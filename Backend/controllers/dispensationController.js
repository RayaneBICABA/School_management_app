const Dispensation = require('../models/Dispensation');
const User = require('../models/User');
const Setting = require('../models/Setting');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all dispensations
// @route   GET /api/v1/dispensations
// @access  Private/Censeur
exports.getDispensations = asyncHandler(async (req, res, next) => {
    let { eleve, matiere, classe, anneeScolaire } = req.query;
    let filter = {};

    // Default academic year if not provided
    if (!anneeScolaire) {
        const academicSetting = await Setting.findOne({ key: 'academic_year_config' });
        anneeScolaire = academicSetting ? (academicSetting.value.year || academicSetting.value.academicYear) : '2025-2026';
    }
    filter.anneeScolaire = anneeScolaire;

    if (matiere) filter.matiere = matiere;

    if (classe) {
        // If class is provided, find all students of that class
        const students = await User.find({ classe, role: 'ELEVE' }).select('_id');
        const studentIdsInClass = students.map(s => s._id.toString());

        if (eleve) {
            // Intersection: only filter by provided student if they belong to the class
            if (studentIdsInClass.includes(eleve.toString())) {
                filter.eleve = eleve;
            } else {
                // Student not in this class, force empty result
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        } else {
            // All students in class
            filter.eleve = { $in: students.map(s => s._id) };
        }
    } else if (eleve) {
        filter.eleve = eleve;
    }

    const dispensations = await Dispensation.find(filter)
        .populate('eleve', 'nom prenom matricule')
        .populate('matiere', 'nom');

    res.status(200).json({
        success: true,
        count: dispensations.length,
        data: dispensations
    });
});

// @desc    Create a dispensation
// @route   POST /api/v1/dispensations
// @access  Private/Censeur
exports.createDispensation = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.creePar = req.user.id;

    // Check if dispensation already exists
    const existing = await Dispensation.findOne({
        eleve: req.body.eleve,
        matiere: req.body.matiere,
        anneeScolaire: req.body.anneeScolaire
    });

    if (existing) {
        return next(new ErrorResponse('Une dispensation existe déjà pour cet élève dans cette matière', 400));
    }

    const dispensation = await Dispensation.create(req.body);

    res.status(201).json({
        success: true,
        data: dispensation
    });
});

// @desc    Update a dispensation
// @route   PUT /api/v1/dispensations/:id
// @access  Private/Censeur
exports.updateDispensation = asyncHandler(async (req, res, next) => {
    let dispensation = await Dispensation.findById(req.params.id);

    if (!dispensation) {
        return next(new ErrorResponse(`Dispensation non trouvée avec l'id ${req.params.id}`, 404));
    }

    dispensation = await Dispensation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: dispensation
    });
});

// @desc    Delete a dispensation
// @route   DELETE /api/v1/dispensations/:id
// @access  Private/Censeur
exports.deleteDispensation = asyncHandler(async (req, res, next) => {
    const dispensation = await Dispensation.findById(req.params.id);

    if (!dispensation) {
        return next(new ErrorResponse(`Dispensation non trouvée avec l'id ${req.params.id}`, 404));
    }

    await dispensation.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
