const Dispensation = require('../models/Dispensation');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all dispensations
// @route   GET /api/v1/dispensations
// @access  Private
exports.getDispensations = asyncHandler(async (req, res, next) => {
    let query;

    if (req.query.eleve) {
        query = Dispensation.find({ eleve: req.query.eleve });
    } else if (req.query.matiere) {
        query = Dispensation.find({ matiere: req.query.matiere });
    } else {
        query = Dispensation.find();
    }

    const dispensations = await query.populate('eleve', 'nom prenom matricule').populate('matiere', 'nom');

    res.status(200).json({
        success: true,
        count: dispensations.length,
        data: dispensations
    });
});

// @desc    Create a dispensation(s)
// @route   POST /api/v1/dispensations
// @access  Private (Censeur/Admin)
exports.createDispensation = asyncHandler(async (req, res, next) => {
    // Check role
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé à créer des dispensations', 403));
    }

    let results;
    if (Array.isArray(req.body)) {
        const dispensationsData = req.body.map(disp => ({
            ...disp,
            creePar: req.user.id
        }));
        results = await Dispensation.insertMany(dispensationsData);
    } else {
        req.body.creePar = req.user.id;
        results = await Dispensation.create(req.body);
    }

    res.status(201).json({
        success: true,
        data: results
    });
});

// @desc    Delete a dispensation
// @route   DELETE /api/v1/dispensations/:id
// @access  Private (Censeur/Admin)
exports.deleteDispensation = asyncHandler(async (req, res, next) => {
    // Check role
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé à supprimer des dispensations', 403));
    }

    const dispensation = await Dispensation.findById(req.params.id);

    if (!dispensation) {
        return next(new ErrorResponse('Dispensation non trouvée', 404));
    }

    await dispensation.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
