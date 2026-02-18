const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get today's absences for CPE
// @route   GET /api/v1/absences-jour
// @access  Private (CPE)
exports.getTodayAbsences = async (req, res, next) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        // Get all absences for today
        const todayAbsences = await Attendance.find({
            date: { $gte: today, $lt: tomorrow },
            statut: 'absent'
        })
        .populate({
            path: 'eleve',
            select: 'prenom nom photo classe',
            populate: {
                path: 'classe',
                select: 'niveau section'
            }
        })
        .populate('markedBy', 'prenom nom');

        // Format the response
        const formattedAbsences = todayAbsences.map(absence => ({
            id: absence._id,
            eleve: absence.eleve,
            classe: absence.eleve?.classe,
            heures: absence.heures || 5, // Default 5h
            sauvegarde: absence.sauvegarde || false,
            signalePar: absence.markedBy ? `${absence.markedBy.prenom} ${absence.markedBy.nom}` : 'Système',
            heureSignalement: absence.createdAt,
            date: absence.date,
            statut: absence.statut
        }));

        res.status(200).json({
            success: true,
            data: formattedAbsences
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update absence hours and save status
// @route   PUT /api/v1/absences-jour/:id
// @access  Private (CPE)
exports.updateAbsence = async (req, res, next) => {
    try {
        const { heures, sauvegarde } = req.body;

        // Validate input
        if (typeof heures !== 'number' || heures < 0 || heures > 24) {
            return res.status(400).json({
                success: false,
                error: 'Le nombre d\'heures doit être entre 0 et 24'
            });
        }

        // Find and update the absence
        const absence = await Attendance.findByIdAndUpdate(
            req.params.id,
            { 
                heures: heures,
                sauvegarde: sauvegarde,
                updatedBy: req.user.id,
                updatedAt: new Date()
            },
            { new: true }
        ).populate({
            path: 'eleve',
            select: 'prenom nom photo classe',
            populate: {
                path: 'classe',
                select: 'niveau section'
            }
        });

        if (!absence) {
            return res.status(404).json({
                success: false,
                error: 'Absence non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: absence._id,
                eleve: absence.eleve,
                classe: absence.eleve?.classe,
                heures: absence.heures,
                sauvegarde: absence.sauvegarde,
                signalePar: absence.markedBy ? `${absence.markedBy.prenom} ${absence.markedBy.nom}` : 'Système',
                heureSignalement: absence.createdAt,
                date: absence.date,
                statut: absence.statut
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
