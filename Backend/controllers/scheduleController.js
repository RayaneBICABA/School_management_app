const Schedule = require('../models/Schedule');
const ClasseMatiere = require('../models/ClasseMatiere');

// @desc    Get all schedules (with optional filters)
// @route   GET /api/v1/schedules
// @access  Private
exports.getSchedules = async (req, res) => {
    try {
        let query = {};

        // Filter by class if provided
        if (req.query.classe) {
            query.classe = req.query.classe;
        }

        if (req.query.professeur) {
            query.professeur = req.query.professeur;
        }

        const schedules = await Schedule.find(query)
            .populate('classe', 'section niveau')
            .populate('matiere', 'nom')
            .populate('professeur', 'nom prenom');

        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération de l\'emploi du temps',
            message: err.message
        });
    }
};

// @desc    Create new schedule slot with conflict detection
// @route   POST /api/v1/schedules
// @access  Private/Admin
exports.createSchedule = async (req, res) => {
    try {
        let { classe, matiere, professeur, jour, creneau, salle } = req.body;

        // Auto-assign professor if not provided
        if (!professeur) {
            const classeMatiere = await ClasseMatiere.findOne({
                classe: classe,
                matiere: matiere
            });

            if (classeMatiere && classeMatiere.professeur) {
                professeur = classeMatiere.professeur;
            }
        }

        // 1. Check for Professor conflict (same prof, same day, same time)
        if (professeur) {
            const profConflict = await Schedule.findOne({
                professeur,
                jour,
                creneau
            }).populate('classe', 'section niveau');

            if (profConflict) {
                return res.status(400).json({
                    success: false,
                    error: `Conflit: Le professeur est déjà occupé avec la classe ${profConflict.classe.section} sur ce créneau.`
                });
            }
        }

        // 2. Check for Room conflict (same room, same day, same time)
        if (salle && salle !== 'TBD') {
            const roomConflict = await Schedule.findOne({
                salle,
                jour,
                creneau
            }).populate('classe', 'section niveau');

            if (roomConflict) {
                return res.status(400).json({
                    success: false,
                    error: `Conflit: La salle ${salle} est déjà occupée par la classe ${roomConflict.classe.section} sur ce créneau.`
                });
            }
        }

        // 3. Create schedule
        const schedule = await Schedule.create({
            classe,
            matiere,
            professeur, // Used resolved professor
            jour,
            creneau,
            salle
        });

        // 4. Populate for response
        const populatedSchedule = await Schedule.findById(schedule._id)
            .populate('classe', 'niveau section')
            .populate('matiere', 'nom')
            .populate('professeur', 'nom prenom');

        res.status(201).json({
            success: true,
            data: populatedSchedule
        });
    } catch (err) {
        // Handle unique constraint (class/day/time)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Un cours est déjà programmé pour cette classe à ce créneau.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création du créneau',
            message: err.message
        });
    }
};

// @desc    Delete schedule slot
// @route   DELETE /api/v1/schedules/:id
// @access  Private/Admin
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                error: 'Créneau non trouvé'
            });
        }

        await schedule.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du créneau',
            message: err.message
        });
    }
};
