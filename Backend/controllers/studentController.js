const User = require('../models/User');
const Note = require('../models/Note');
const Bulletin = require('../models/Bulletin');
const Attendance = require('../models/Attendance');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const Incident = require('../models/Incident');
const Event = require('../models/Event');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const ClasseMatiere = require('../models/ClasseMatiere');

// @desc    Get student statistics
// @route   GET /api/v1/eleves/:id/stats
// @access  Private
exports.getStudentStats = async (req, res, next) => {
    try {
        const studentId = req.params.id;

        // Vérifier que l'utilisateur est bien un élève
        const student = await User.findById(studentId);
        if (!student || student.role !== 'ELEVE') {
            return res.status(404).json({
                success: false,
                error: 'Élève non trouvé'
            });
        }

        // Récupérer les notes de l'élève
        const notes = await Note.find({ eleve: studentId })
            .populate('matiere', 'nom coefficient')
            .sort({ createdAt: -1 });

        // Calculer les statistiques
        let totalCoefficients = 0;
        let weightedSum = 0;
        let creditsValides = 0;

        notes.forEach(note => {
            if (note.statut === 'VALIDEE' && note.moyenne) {
                const coefficient = note.matiere?.coefficient || 1;
                totalCoefficients += coefficient;
                weightedSum += note.moyenne * coefficient;

                // Calculer les crédits (simplifié: 1 crédit par matière validée)
                if (note.moyenne >= 10) {
                    creditsValides += 1;
                }
            }
        });

        const moyenneGenerale = totalCoefficients > 0 ? weightedSum / totalCoefficients : 0;

        // Récupérer les absences du mois en cours
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);

        const absencesCeMois = await Attendance.countDocuments({
            eleve: studentId,
            statut: 'absent',
            date: { $gte: monthStart, $lt: monthEnd }
        });

        const totalAbsences = await Attendance.countDocuments({
            eleve: studentId,
            statut: 'absent'
        });

        const totalRetards = await Attendance.countDocuments({
            eleve: studentId,
            statut: 'retard'
        });

        res.status(200).json({
            success: true,
            data: {
                moyenneGenerale,
                creditsValides,
                absencesCeMois,
                totalAbsences,
                totalRetards,
                totalMatieres: notes.length,
                totalNotes: notes.filter(n => n.statut === 'VALIDEE').length
            }
        });
    } catch (error) {
        console.error('Erreur getStudentStats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get today's schedule for a student
// @route   GET /api/v1/eleves/:id/schedule/today
// @access  Private
exports.getTodaySchedule = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const today = new Date();
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayOfWeekName = days[today.getDay()];

        // Si c'est dimanche, pas de cours (Samedi peut avoir des cours)
        if (today.getDay() === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        // Récupérer l'élève et sa classe
        const student = await User.findById(studentId);
        if (!student || !student.classe) {
            return res.status(404).json({
                success: false,
                error: 'Élève ou classe non trouvé'
            });
        }

        // Récupérer l'emploi du temps réel
        const schedules = await Schedule.find({
            classe: student.classe,
            jour: dayOfWeekName
        })
            .populate('matiere', 'nom')
            .populate('professeur', 'nom prenom')
            .sort({ creneau: 1 });

        // Formater pour le frontend (calculer heureFin approximative +1h)
        const formattedSchedule = schedules.map(s => {
            const [hours, minutes] = s.creneau.split(':').map(Number);
            const endHours = hours + 1;
            const heureFin = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            return {
                matiere: s.matiere?.nom || 'Matière',
                heureDebut: s.creneau,
                heureFin: heureFin,
                salle: s.salle || 'TBD',
                professeur: s.professeur ? `M. ${s.professeur.nom}` : 'N/A'
            };
        });

        res.status(200).json({
            success: true,
            data: formattedSchedule
        });
    } catch (error) {
        console.error('Erreur getTodaySchedule:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get weekly schedule for a student
// @route   GET /api/v1/eleves/:id/schedule/week
// @access  Private
exports.getWeeklySchedule = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);

        if (!student || !student.classe) {
            return res.status(404).json({ success: false, error: 'Élève ou classe non trouvé' });
        }

        const schedules = await Schedule.find({ classe: student.classe })
            .populate('matiere', 'nom')
            .populate('professeur', 'nom prenom')
            .sort({ creneau: 1 });

        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const weeklyData = {
            lundi: [], mardi: [], mercredi: [], jeudi: [], vendredi: [], samedi: [], dimanche: []
        };

        schedules.forEach(s => {
            const dayKey = s.jour.toLowerCase();
            const [hours, minutes] = s.creneau.split(':').map(Number);
            const heureFin = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            if (weeklyData[dayKey]) {
                weeklyData[dayKey].push({
                    matiere: s.matiere?.nom || 'Matière',
                    heureDebut: s.creneau,
                    heureFin: heureFin,
                    salle: s.salle || 'TBD',
                    professeur: s.professeur ? `${s.professeur.prenom} ${s.professeur.nom}` : 'N/A'
                });
            }
        });

        res.status(200).json({
            success: true,
            data: weeklyData
        });
    } catch (error) {
        console.error('Erreur getWeeklySchedule:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get notes for a student
// @route   GET /api/v1/eleves/:id/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const { periode, matiere } = req.query;

        let query = { eleve: studentId };
        if (periode) query.periode = periode;
        if (matiere) query.matiere = matiere;

        const notes = await Note.find(query)
            .populate('matiere', 'nom coefficient')
            .populate('professeur', 'nom prenom')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Erreur getNotes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get bulletins for a student
// @route   GET /api/v1/eleves/:id/bulletins
// @access  Private
exports.getBulletins = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const { periode, anneeScolaire } = req.query;

        let query = { eleve: studentId };
        if (periode) query.periode = periode;
        if (anneeScolaire) query.anneeScolaire = anneeScolaire;

        let bulletins = await Bulletin.find(query)
            .populate({
                path: 'notes',
                populate: [
                    { path: 'matiere', select: 'nom coefficient' },
                    { path: 'professeur', select: 'nom prenom' }
                ]
            })
            .populate('classe', 'niveau section filiere anneeScolaire')
            .sort({ createdAt: -1 });

        // Si aucun bulletin n'existe, essayer d'en créer par défaut
        if (bulletins.length === 0) {
            const student = await User.findById(studentId);
            if (student && student.role === 'ELEVE' && student.classe) {
                const classe = await Classe.findById(student.classe);

                if (classe) {
                    const periodes = classe.filiere === 'Technique'
                        ? ['Semestre 1', 'Semestre 2']
                        : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

                    const defaultBulletins = periodes.map(p => ({
                        eleve: student._id,
                        classe: student.classe,
                        periode: p,
                        anneeScolaire: classe.anneeScolaire || '2025-2026',
                        notes: [],
                        statut: 'BROUILLON'
                    }));

                    await Bulletin.insertMany(defaultBulletins);

                    // Récupérer à nouveau après création
                    bulletins = await Bulletin.find(query)
                        .populate({
                            path: 'notes',
                            populate: [
                                { path: 'matiere', select: 'nom coefficient' },
                                { path: 'professeur', select: 'nom prenom' }
                            ]
                        })
                        .populate('classe', 'niveau section filiere anneeScolaire')
                        .sort({ createdAt: -1 });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: bulletins
        });
    } catch (error) {
        console.error('Erreur getBulletins:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get discipline info for a student
// @route   GET /api/v1/eleves/:id/discipline
// @access  Private
exports.getDiscipline = async (req, res, next) => {
    try {
        const studentId = req.params.id;

        // Vérifier que l'utilisateur est bien un élève
        const student = await User.findById(studentId);
        if (!student || student.role !== 'ELEVE') {
            return res.status(404).json({
                success: false,
                error: 'Élève non trouvé'
            });
        }

        // Obtenir l'année scolaire actuelle
        const currentYear = new Date().getFullYear();
        const anneeScolaire = `${currentYear}-${currentYear + 1}`;

        // Calculer les statistiques de discipline avec fallback
        let stats = {
            absences: 0,
            retards: 0,
            incidents: 0,
            sanctions: 0,
            totalPoints: 0
        };

        try {
            stats = await Incident.getStatsEleve(studentId, anneeScolaire);
        } catch (error) {
            console.warn('Erreur lors du calcul des statistiques de discipline:', error);
        }

        // Récupérer les incidents récents avec fallback
        let recentIncidents = [];
        try {
            recentIncidents = await Incident.find({
                eleve: studentId
            })
                .populate('professeur', 'nom prenom')
                .populate('matiere', 'nom')
                .sort({ date: -1 })
                .limit(10);
        } catch (error) {
            console.warn('Erreur lors de la récupération des incidents récents:', error);
        }

        // Calculer les points de conduite (base 20 + points)
        const pointsConduite = Math.max(0, Math.min(20, 20 + (stats.totalPoints || 0)));

        // Calculer les absences du mois en cours avec fallback
        let absencesCeMois = 0;
        try {
            const currentMonth = new Date().getMonth();
            const currentYearDate = new Date().getFullYear();
            absencesCeMois = await Incident.countDocuments({
                eleve: studentId,
                type: 'absence',
                date: {
                    $gte: new Date(currentYearDate, currentMonth, 1),
                    $lt: new Date(currentYearDate, currentMonth + 1, 1)
                }
            });
        } catch (error) {
            console.warn('Erreur lors du calcul des absences du mois:', error);
        }

        const disciplineData = {
            absences: stats.absences,
            retards: stats.retards,
            incidents: stats.incidents,
            sanctions: stats.sanctions,
            absencesCeMois: absencesCeMois,
            pointsConduite: pointsConduite,
            totalPoints: stats.totalPoints,
            appreciation: pointsConduite >= 16 ? 'Excellent comportement' :
                pointsConduite >= 12 ? 'Bon comportement' :
                    pointsConduite >= 8 ? 'Comportement satisfaisant' :
                        pointsConduite >= 5 ? 'Comportement à améliorer' : 'Comportement insuffisant',
            recentEvents: recentIncidents.map(incident => ({
                id: incident._id,
                type: incident.type,
                titre: incident.titre,
                description: incident.description,
                date: incident.date,
                heure: incident.heure,
                matiere: incident.matiere?.nom || 'Non spécifiée',
                professeur: incident.professeur ?
                    `${incident.professeur.prenom} ${incident.professeur.nom}` : 'Non spécifié',
                justifie: incident.justifie,
                pointsConduite: incident.pointsConduite
            }))
        };

        res.status(200).json({
            success: true,
            data: disciplineData
        });
    } catch (error) {
        console.error('Erreur getDiscipline:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get notifications for a student
// @route   GET /api/v1/eleves/:id/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId).populate('classe');

        if (!student) {
            return res.status(404).json({ success: false, error: 'Élève non trouvé' });
        }

        const className = student.classe ? `${student.classe.niveau} ${student.classe.section}` : null;

        // Fetch notifications targeting the student individually, by role, or by class
        const notifications = await Notification.find({
            $or: [
                { 'recipients.user': studentId },
                { targetRoles: 'ELEVE' },
                ...(className ? [{ targetClasses: student.classe._id }] : [])
            ]
        })
            .populate('sender', 'nom prenom role')
            .sort({ createdAt: -1 });

        // Format for frontend
        const formattedNotifications = notifications.map(notif => {
            const userRecipient = notif.recipients.find(r => r.user.toString() === studentId);
            return {
                _id: notif._id,
                subject: notif.subject,
                content: notif.content,
                createdAt: notif.createdAt,
                read: userRecipient ? userRecipient.read : false,
                type: notif.type,
                sender: notif.sender
            };
        });

        res.status(200).json({
            success: true,
            data: formattedNotifications
        });
    } catch (error) {
        console.error('Erreur getNotifications:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get attendance for a student
// @route   GET /api/v1/eleves/:id/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const { periode } = req.query;

        let dateFilter = {};
        if (periode) {
            // TODO: Implémenter le filtrage par période
        }

        const attendance = await Attendance.find({
            eleve: studentId,
            ...dateFilter
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Erreur getAttendance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get student teachers
// @route   GET /api/v1/eleves/:id/teachers
// @access  Private
exports.getStudentTeachers = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);

        if (!student || !student.classe) {
            return res.status(404).json({ success: false, error: 'Élève ou classe non trouvé' });
        }

        // Get teachers assigned to this class via ClasseMatiere
        const assignments = await ClasseMatiere.find({ classe: student.classe })
            .populate('professeur', 'nom prenom email')
            .populate('matiere', 'nom');

        const teachers = assignments
            .filter(a => a.professeur)
            .map(a => ({
                _id: a.professeur._id,
                prenom: a.professeur.prenom,
                nom: a.professeur.nom,
                matiere: { nom: a.matiere?.nom || 'N/A' },
                email: a.professeur.email
            }));

        // Remove duplicates if a teacher has multiple subjects in the same class
        const uniqueTeachers = Array.from(new Map(teachers.map(t => [t._id.toString(), t])).values());

        res.status(200).json({
            success: true,
            data: uniqueTeachers
        });
    } catch (error) {
        console.error('Erreur getStudentTeachers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get student emergency contacts
// @route   GET /api/v1/eleves/:id/emergency-contacts
// @access  Private
exports.getStudentEmergencyContacts = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, error: 'Élève non trouvé' });
        }

        const contacts = [];

        if (student.fatherName || student.fatherPhone) {
            contacts.push({
                _id: 'father',
                prenom: student.fatherName?.split(' ')[0] || '',
                nom: student.fatherName?.split(' ').slice(1).join(' ') || 'Père',
                relation: 'Père',
                telephone: student.fatherPhone || 'N/A',
                email: student.fatherEmail,
                prioritaire: true
            });
        }

        if (student.motherName || student.motherPhone) {
            contacts.push({
                _id: 'mother',
                prenom: student.motherName?.split(' ')[0] || '',
                nom: student.motherName?.split(' ').slice(1).join(' ') || 'Mère',
                relation: 'Mère',
                telephone: student.motherPhone || 'N/A',
                email: student.motherEmail,
                prioritaire: false
            });
        }

        if (student.legalGuardian || student.guardianPhone) {
            contacts.push({
                _id: 'guardian',
                prenom: student.legalGuardian?.split(' ')[0] || '',
                nom: student.legalGuardian?.split(' ').slice(1).join(' ') || 'Tuteur',
                relation: 'Tuteur Légal',
                telephone: student.guardianPhone || 'N/A',
                prioritaire: contacts.length === 0
            });
        }

        res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Erreur getStudentEmergencyContacts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getStudentEvents = async (req, res, next) => {
    try {
        const student = await User.findById(req.params.id).populate('classe');
        if (!student) return res.status(404).json({ success: false, error: 'Élève non trouvé' });

        const className = student.classe ? `${student.classe.niveau} ${student.classe.section}` : null;
        const events = await Event.find({
            $or: [{ classe: { $exists: false } }, { classe: "" }, { classe: null }, ...(className ? [{ classe: className }] : [])]
        }).sort({ date: 1, time: 1 });

        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        next(err);
    }
};
