const Incident = require('../models/Incident');
const Attendance = require('../models/Attendance');
const Classe = require('../models/Classe');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get CPE statistics
// @route   GET /api/v1/stats/cpe
// @access  Private (Staff)
exports.getCPEStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
        const end = endDate ? new Date(endDate) : new Date();

        // 1. Total Incidents
        const totalIncidents = await Incident.countDocuments({
            createdAt: { $gte: start, $lte: end }
        });

        // 2. Incident motifs (Top 5)
        const motifs = await Incident.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const totalIncidentsCount = motifs.reduce((acc, m) => acc + m.count, 0);
        const topMotifs = motifs.map(m => ({
            name: m._id,
            percentage: totalIncidentsCount > 0 ? Math.round((m.count / totalIncidentsCount) * 100) : 0
        }));

        // 3. Attendance Stats
        const attendance = await Attendance.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$statut',
                    count: { $sum: 1 }
                }
            }
        ]);

        const attendanceCounts = { present: 0, absent: 0, late: 0 };
        attendance.forEach(a => {
            attendanceCounts[a._id] = a.count;
        });

        const totalAttendance = attendanceCounts.present + attendanceCounts.absent + attendanceCounts.late;
        const absenteeismRate = totalAttendance > 0 ? (attendanceCounts.absent / totalAttendance) * 100 : 0;

        // 4. stats by Level (Classe)
        const levels = await Attendance.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classe',
                    foreignField: '_id',
                    as: 'classeInfo'
                }
            },
            { $unwind: '$classeInfo' },
            {
                $group: {
                    _id: '$classeInfo.niveau',
                    total: { $sum: 1 },
                    absents: {
                        $sum: { $cond: [{ $eq: ['$statut', 'absent'] }, 1, 0] }
                    }
                }
            }
        ]);

        const absenteeismByLevel = levels.map(l => ({
            level: l._id,
            presence: Math.round(((l.total - l.absents) / l.total) * 100 * 10) / 10,
            unjustifiedAbsences: l.absents,
            status: l.absents > 15 ? 'Alerte' : (l.absents > 10 ? 'Vigilance' : 'Normal')
        }));

        res.status(200).json({
            success: true,
            data: {
                totalIncidents,
                absenteeismRate: Math.round(absenteeismRate * 10) / 10,
                flaggedStudents: 0, // Simplified for now
                totalDelays: attendanceCounts.late,
                topMotifs,
                absenteeismByLevel
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get CPE Dashboard stats (Today's metrics, recent incidents, upcoming councils)
// @route   GET /api/v1/stats/dashboard
// @access  Private (Staff)
exports.getCPEDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        // 1. KPIs for Today - Retards signalés par professeurs
        const attendanceToday = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: today, $lt: tomorrow },
                    statut: 'late',
                    markedBy: { $exists: true, $ne: null }
                }
            },
            { $group: { _id: '$markedBy', count: { $sum: 1 } } }
        ]);

        const delaysToday = attendanceToday.reduce((total, item) => total + item.count, 0);

        // 2. Recent Incidents (Last 5)
        const recentIncidents = await Incident.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'eleve',
                select: 'prenom nom photo',
                populate: { path: 'classe', select: 'niveau section' }
            });

        const formattedIncidents = recentIncidents.map(inc => ({
            id: inc._id,
            eleve: inc.eleve ? `${inc.eleve.prenom} ${inc.eleve.nom}` : 'Élève inconnu',
            classe: inc.eleve?.classe ? `${inc.eleve.classe.niveau} ${inc.eleve.classe.section}` : 'N/A',
            description: inc.titre,
            time: formatTimeAgo(inc.createdAt),
            severity: inc.priorite === 'Haute' ? 'Sévère' : (inc.priorite === 'Moyenne' ? 'Moyen' : 'Mineur'),
            avatar: inc.eleve?.photo ? (inc.eleve.photo.startsWith('http') ? inc.eleve.photo : `http://localhost:5000/${inc.eleve.photo}`) : null
        }));

        // 3. Upcoming Councils (Only those created by the current user as per request)
        const upcomingCouncils = await Event.find({
            type: 'council',
            date: { $gte: today },
            createdBy: req.user.id
        })
            .sort({ date: 1, time: 1 })
            .limit(5);

        const formattedCouncils = upcomingCouncils.map(c => {
            const eventDate = new Date(c.date);
            const isToday = eventDate.toDateString() === today.toDateString();
            return {
                id: c._id,
                classe: c.classe || 'Conseil de classe',
                professeur: c.notes || 'Réunion trimestrielle',
                date: isToday ? 'Aujourd\'hui' : eventDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                time: c.time,
                salle: 'Salle de réunion',
                isToday
            };
        });

        // 4. Recent Absences to Validate (Last 5 unjustified)
        const recentAbsences = await Attendance.find({
            statut: 'absent',
            justifie: false
        })
            .sort({ date: -1, createdAt: -1 })
            .limit(5)
            .populate('eleve', 'prenom nom photo')
            .populate('classe', 'niveau section');

        const formattedAbsences = recentAbsences.map(abs => ({
            id: abs._id,
            eleve: abs.eleve ? `${abs.eleve.prenom} ${abs.eleve.nom}` : 'Élève inconnu',
            classe: abs.classe ? `${abs.classe.niveau} ${abs.classe.section}` : 'N/A',
            date: new Date(abs.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            avatar: abs.eleve?.photo ? (abs.eleve.photo.startsWith('http') ? abs.eleve.photo : `http://localhost:5000/${abs.eleve.photo}`) : null
        }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    retards: delaysToday
                },
                councils: formattedCouncils,
                recentAbsences: formattedAbsences
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

function formatTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
}

// @desc    Download weekly report (CSV)
// @route   GET /api/v1/stats/report
// @access  Private (Staff)
exports.downloadWeeklyReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
        const end = endDate ? new Date(endDate) : new Date();

        const incidents = await Incident.find({
            createdAt: { $gte: start, $lte: end }
        }).populate('eleve', 'nom prenom');

        let csv = 'Date,Eleve,Type,Titre,Description,Status\n';
        incidents.forEach(inc => {
            const date = inc.createdAt.toLocaleDateString();
            const eleve = `${inc.eleve?.prenom} ${inc.eleve?.nom}`;
            csv += `${date},${eleve},${inc.type},"${inc.title}","${inc.description.replace(/"/g, '""')}",${inc.status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=rapport_semaine_${start.toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
