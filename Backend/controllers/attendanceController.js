const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Classe = require('../models/Classe');
const Notification = require('../models/Notification');
const Bulletin = require('../models/Bulletin');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

// @desc    Get all students for a specific class
// @route   GET /api/v1/attendance/students/:classeId
// @access  Private
exports.getStudentsByClass = async (req, res, next) => {
    try {
        const students = await User.find({
            classe: req.params.classeId,
            role: 'ELEVE'
        }).select('nom prenom email photo status matricule dateNaissance lieuNaissance isRedoublant sexe statutEleve telephone');

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Save attendance for a class
// @route   POST /api/v1/attendance
// @access  Private
exports.saveAttendance = async (req, res, next) => {
    try {
        const { classeId, attendanceList, date } = req.body;

        if (!classeId || !attendanceList || !Array.isArray(attendanceList)) {
            return res.status(400).json({ success: false, error: 'Données d\'appel invalides' });
        }

        const attendanceData = attendanceList.map(item => ({
            eleve: item.studentId,
            classe: classeId,
            markedBy: req.user.id,
            date: date || new Date(),
            statut: item.status ? item.status.toLowerCase() : 'present',
            notes: item.observations,
            matiere: req.body.matiereId // Fixed: Include matiere ID
        }));

        const records = await Attendance.insertMany(attendanceData);

        // Notify CPE if there are absences
        const absences = attendanceData.filter(a => a.statut === 'absent');
        if (absences.length > 0) {
            const classInfo = await Classe.findById(classeId);
            const cpes = await User.find({ role: 'CPE' });

            if (cpes.length > 0) {
                await Notification.create({
                    sender: req.user.id,
                    subject: 'Nouvel appel : Absences signalées',
                    content: `Le professeur a signalé ${absences.length} absence(s) dans la classe ${classInfo ? classInfo.nom : 'Inconnue'}.`,
                    type: 'role',
                    targetRoles: ['CPE'],
                    recipients: cpes.map(c => ({ user: c._id }))
                });
            }
        }

        res.status(201).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get attendance statistics for a class
// @route   GET /api/v1/attendance/stats/:classeId
// @access  Private
exports.getClassAttendanceStats = async (req, res, next) => {
    try {
        const totalAbsences = await Attendance.countDocuments({
            classe: req.params.classeId,
            statut: 'absent'
        });

        // Get class average (if we had grades merged here, but for now just attendance)
        // This is a placeholder for more complex logic if needed

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const absencesAujourdHui = await Attendance.countDocuments({
            classe: req.params.classeId,
            statut: 'absent',
            date: { $gte: today, $lt: tomorrow }
        });

        res.status(200).json({
            success: true,
            data: {
                totalAbsences,
                absencesAujourdHui,
                incidents: 0, // Placeholder
                average: 0 // Placeholder
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get detailed attendance list for students in a class
// @route   GET /api/v1/attendance/list/:classeId
// @access  Private
exports.getDetailedAttendanceList = async (req, res, next) => {
    try {
        const students = await User.find({
            classe: req.params.classeId,
            role: 'ELEVE'
        }).select('nom prenom email photo createdAt');

        const detailedList = await Promise.all(students.map(async (student) => {
            const absences = await Attendance.countDocuments({
                eleve: student._id,
                statut: 'absent'
            });

            return {
                id: student._id,
                name: `${student.prenom} ${student.nom}`,
                avatar: student.photo,
                registrationDate: student.createdAt.toLocaleDateString('fr-FR'),
                absences,
                absenceTrend: null, // Logic for trend could be added
                reports: 0, // Placeholder
                average: 0, // Placeholder
                status: absences > 10 ? 'À surveiller' : 'Régulier'
            };
        }));

        res.status(200).json({
            success: true,
            data: detailedList
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get manageable absences for CPE
// @route   GET /api/v1/attendance/manageable
// @access  Private (CPE/Admin)
exports.getManageableAbsences = asyncHandler(async (req, res, next) => {
    const { classe, student, startDate, endDate, justifie } = req.query;

    const { status } = req.query;
    const query = {};

    if (status && status !== 'all') {
        query.statut = status;
    } else if (!status) {
        // Default: hide 'present' records to keep console clean, but allow 'all'
        query.statut = { $ne: 'present' };
    }

    if (classe) query.classe = classe;
    if (student) query.eleve = student;

    // Fix: Only apply filter if explicitly true or false
    if (justifie === 'true') query.justifie = true;
    else if (justifie === 'false') query.justifie = false;

    // Support for school periods (Trimesters)
    if (req.query.periode && req.query.periode !== 'custom') {
        const period = req.query.periode;
        const currentYear = new Date().getFullYear();

        if (period === 'Trimestre 1') {
            query.date = {
                $gte: new Date(currentYear, 8, 1), // Sept 1
                $lte: new Date(currentYear, 11, 31, 23, 59, 59) // Dec 31
            };
        } else if (period === 'Trimestre 2') {
            query.date = {
                $gte: new Date(currentYear, 0, 1), // Jan 1
                $lte: new Date(currentYear, 2, 31, 23, 59, 59) // March 31
            };
        } else if (period === 'Trimestre 3') {
            query.date = {
                $gte: new Date(currentYear, 3, 1), // April 1
                $lte: new Date(currentYear, 6, 31, 23, 59, 59) // July 31
            };
        }
    } else if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) {
            // Fix: Include the entire end date by setting time to 23:59:59
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.date.$lte = end;
        }
    }

    let records = await Attendance.find(query)
        .populate('eleve', 'nom prenom photo matricule') // Ensure matricule and names are there
        .populate('classe', 'niveau section nom')
        .populate('markedBy', 'nom prenom role')
        .populate('matiere', 'nom code')
        .sort({ date: -1, createdAt: -1 });

    // Filter out orphaned records (technical logs with no student)
    records = records.filter(abs => abs.eleve !== null);

    res.status(200).json({
        success: true,
        count: records.length,
        data: records
    });
});

// @desc    Justify an absence
// @route   PUT /api/v1/attendance/:id/justify
// @access  Private (CPE/Admin)
exports.justifyAbsence = asyncHandler(async (req, res, next) => {
    const { motivation, notes } = req.body;

    let absence = await Attendance.findById(req.params.id);

    if (!absence) {
        return res.status(404).json({ success: false, error: 'Absence non trouvée' });
    }

    absence.justifie = true;
    absence.statusJustification = 'VALIDE';
    absence.motivation = motivation;
    if (notes) absence.notes = notes;
    absence.updatedBy = req.user.id;

    await absence.save();

    // Recalculate deductions for the bulletin
    if (absence.matiere) {
        await recalculatePointDeductions(absence.eleve, absence.classe, absence.matiere, absence.date);
    }

    res.status(200).json({
        success: true,
        data: absence
    });
});

// @desc    Save grouped absences
// @route   POST /api/v1/attendance/grouped
// @access  Private (CPE/Admin)
exports.saveGroupedAbsences = asyncHandler(async (req, res, next) => {
    const { studentIds, classeId, startDate, startTime, endDate, endTime, reason, matiere, periode, comment } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || !classeId) {
        return res.status(400).json({ success: false, error: 'Données invalides' });
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const hours = Math.abs(end - start) / 36e5;

    const attendanceData = studentIds.map(studentId => ({
        eleve: studentId,
        classe: classeId,
        markedBy: req.user.id,
        date: start,
        heureDebut: startTime,
        heureFin: endTime,
        heures: hours,
        statut: 'absent',
        motivation: reason,
        notes: comment,
        matiere,
        justifie: false,
        statusJustification: 'NON_JUSTIFIEE'
    }));

    const records = await Attendance.insertMany(attendanceData);

    // Recalculate deductions for each student
    for (const studentId of studentIds) {
        await recalculatePointDeductions(studentId, classeId, matiere, start);
    }

    res.status(201).json({
        success: true,
        count: records.length,
        data: records
    });
});

// @desc    Validate an absence justification
// @route   PUT /api/v1/attendance/:id/validate
// @access  Private (CPE/Admin)
exports.validateJustification = asyncHandler(async (req, res, next) => {
    let absence = await Attendance.findById(req.params.id);

    if (!absence) {
        return res.status(404).json({ success: false, error: 'Absence non trouvée' });
    }

    absence.statusJustification = 'VALIDE';
    absence.justifie = true;
    absence.updatedBy = req.user.id;

    await absence.save();

    // Recalculate deductions for the bulletin
    if (absence.matiere) {
        await recalculatePointDeductions(absence.eleve, absence.classe, absence.matiere, absence.date);
    }

    res.status(200).json({
        success: true,
        data: absence
    });
});

// @desc    Reject/Refute an absence justification
// @route   PUT /api/v1/attendance/:id/reject
// @access  Private (CPE/Admin)
exports.rejectJustification = asyncHandler(async (req, res, next) => {
    let absence = await Attendance.findById(req.params.id);

    if (!absence) {
        return res.status(404).json({ success: false, error: 'Absence non trouvée' });
    }

    absence.statusJustification = 'REFUTE';
    absence.justifie = false;
    absence.updatedBy = req.user.id;

    await absence.save();

    // Recalculate deductions for the bulletin (deductions might increase if previously justified)
    if (absence.matiere) {
        await recalculatePointDeductions(absence.eleve, absence.classe, absence.matiere, absence.date);
    }

    res.status(200).json({
        success: true,
        data: absence
    });
});

// function to recalculate point deductions
exports.recalculatePointDeductions = async (studentId, classeId, periodParam, date) => {
    try {
        // Determine the correct period (Trimester)
        let period = periodParam;
        if (!period) {
            const month = new Date(date).getMonth() + 1;
            if (month >= 1 && month <= 3) period = 'Trimestre 2';
            else if (month >= 4 && month <= 7) period = 'Trimestre 3';
            else period = 'Trimestre 1';
        }

        // Determine date range for the trimester (approximate)
        let dateQuery = {};
        const year = new Date(date).getFullYear();
        if (period === 'Trimestre 1') {
            dateQuery = { $gte: new Date(year, 8, 1), $lte: new Date(year, 11, 31) }; // Sept - Dec
        } else if (period === 'Trimestre 2') {
            const y = month <= 3 ? year : year + 1;
            dateQuery = { $gte: new Date(y, 0, 1), $lte: new Date(y, 2, 31) }; // Jan - Mar
        } else if (period === 'Trimestre 3') {
            const y = month <= 7 ? year : year + 1;
            dateQuery = { $gte: new Date(y, 3, 1), $lte: new Date(y, 6, 31) }; // Apr - Jul
        }

        // Count hours of UNJUSTIFIED absences grouped by subject
        const stats = await Attendance.aggregate([
            {
                $match: {
                    eleve: new mongoose.Types.ObjectId(studentId),
                    statut: 'absent',
                    justifie: false,
                    date: dateQuery
                }
            },
            {
                $group: {
                    _id: '$matiere',
                    totalHours: { $sum: '$heures' }
                }
            }
        ]);

        let globalDeduction = 0;
        const subjectDeductions = {};

        stats.forEach(subjectStat => {
            if (subjectStat._id) {
                // Rule: -0.5 points per 4 hours of unjustified absence PER subject
                const subjectDeduction = Math.floor(subjectStat.totalHours / 4) * 0.5;
                globalDeduction += subjectDeduction;
                subjectDeductions[subjectStat._id.toString()] = subjectDeduction;
            }
        });

        // Update the bulletin
        const bulletin = await Bulletin.findOne({
            eleve: studentId,
            classe: classeId,
            periode: period,
            anneeScolaire: '2025-2026' // Should be dynamic
        });

        if (bulletin) {
            // 1. Update global retraitPoints
            bulletin.retraitPoints = globalDeduction;

            // 2. Optionally update subject-level retraitPoints for transparency
            if (bulletin.notes && bulletin.notes.length > 0) {
                bulletin.notes.forEach(note => {
                    const matiereId = note.matiere.toString();
                    note.retraitPoints = subjectDeductions[matiereId] || 0;
                });
            }

            await bulletin.calculerMoyenneGenerale();
            await bulletin.save();
        }
    } catch (error) {
        console.error('Error recalculating deductions:', error);
    }
};
