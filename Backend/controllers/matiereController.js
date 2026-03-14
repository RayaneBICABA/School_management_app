const Matiere = require('../models/Matiere');

// @desc    Get all subjects
// @route   GET /api/v1/matieres
// @access  Private
exports.getMatieres = async (req, res, next) => {
    try {
        const matieres = await Matiere.find().sort('nom');

        res.status(200).json({
            success: true,
            count: matieres.length,
            data: matieres
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single subject
// @route   GET /api/v1/matieres/:id
// @access  Private
exports.getMatiere = async (req, res, next) => {
    try {
        const matiere = await Matiere.findById(req.params.id);

        if (!matiere) {
            return res.status(404).json({ success: false, error: 'Matière non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: matiere
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create subject
// @route   POST /api/v1/matieres
// @access  Private/Admin
exports.createMatiere = async (req, res, next) => {
    try {
        const matiere = await Matiere.create(req.body);

        res.status(201).json({
            success: true,
            data: matiere
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update subject
// @route   PUT /api/v1/matieres/:id
// @access  Private/Admin
exports.updateMatiere = async (req, res, next) => {
    try {
        const matiere = await Matiere.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!matiere) {
            return res.status(404).json({ success: false, error: 'Matière non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: matiere
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/v1/matieres/:id
// @access  Private/Admin
exports.deleteMatiere = async (req, res, next) => {
    try {
        const matiere = await Matiere.findByIdAndDelete(req.params.id);

        if (!matiere) {
            return res.status(404).json({ success: false, error: 'Matière non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
