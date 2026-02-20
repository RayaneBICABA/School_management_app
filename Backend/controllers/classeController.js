const Classe = require('../models/Classe');

// @desc    Get all classes
// @route   GET /api/v1/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
    try {
        const classes = await Classe.find().populate('professeurPrincipal', 'nom prenom');

        res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single class
// @route   GET /api/v1/classes/:id
// @access  Private
exports.getClasse = async (req, res, next) => {
    try {
        const classe = await Classe.findById(req.params.id).populate('professeurPrincipal', 'nom prenom');

        if (!classe) {
            return res.status(404).json({ success: false, error: 'Classe non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: classe
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create class
// @route   POST /api/v1/classes
// @access  Private/Admin
exports.createClasse = async (req, res, next) => {
    try {
        // Check if professor is already principal of another class
        if (req.body.professeurPrincipal) {
            const existingClass = await Classe.findOne({
                professeurPrincipal: req.body.professeurPrincipal
            });

            if (existingClass) {
                // Remove professor from old class
                await Classe.findByIdAndUpdate(existingClass._id, {
                    $unset: { professeurPrincipal: 1 }
                });
            }
        }

        const classe = await Classe.create(req.body);

        res.status(201).json({
            success: true,
            data: classe
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update class
// @route   PUT /api/v1/classes/:id
// @access  Private/Admin
exports.updateClasse = async (req, res, next) => {
    try {
        // Check if professor is already principal of another class
        if (req.body.professeurPrincipal) {
            const existingClass = await Classe.findOne({
                professeurPrincipal: req.body.professeurPrincipal,
                _id: { $ne: req.params.id }
            });

            if (existingClass) {
                // Remove professor from old class
                await Classe.findByIdAndUpdate(existingClass._id, {
                    $unset: { professeurPrincipal: 1 }
                });
            }
        }

        const classe = await Classe.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!classe) {
            return res.status(404).json({ success: false, error: 'Classe non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: classe
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete class
// @route   DELETE /api/v1/classes/:id
// @access  Private/Admin
exports.deleteClasse = async (req, res, next) => {
    try {
        const classe = await Classe.findByIdAndDelete(req.params.id);

        if (!classe) {
            return res.status(404).json({ success: false, error: 'Classe non trouvée' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Rename a niveau (bulk update)
// @route   PUT /api/v1/classes/niveaux
// @access  Private/Admin
exports.renameNiveau = async (req, res, next) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return res.status(400).json({ success: false, error: 'Veuillez fournir l\'ancien et le nouveau nom' });
        }

        const result = await Classe.updateMany(
            { niveau: oldName },
            { $set: { niveau: newName } }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} classe(s) mise(s) à jour`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a niveau (remove from classes, bulk update)
// @route   DELETE /api/v1/classes/niveaux/:name
// @access  Private/Admin
exports.deleteNiveau = async (req, res, next) => {
    try {
        const name = req.params.name;

        // Option douce: retire le niveau (ou met par défaut) au lieu de supprimer la classe
        const result = await Classe.updateMany(
            { niveau: name },
            { $unset: { niveau: "" } } // Ou set à une chaîne vide
        );

        res.status(200).json({
            success: true,
            message: `Le niveau ${name} a été retiré de ${result.modifiedCount} classe(s)`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Rename a specialite (bulk update)
// @route   PUT /api/v1/classes/specialites
// @access  Private/Admin
exports.renameSpecialite = async (req, res, next) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return res.status(400).json({ success: false, error: 'Veuillez fournir l\'ancien et le nouveau nom' });
        }

        const result = await Classe.updateMany(
            { serie: oldName },
            { $set: { serie: newName } }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} classe(s) mise(s) à jour`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a specialite (remove from classes, bulk update)
// @route   DELETE /api/v1/classes/specialites/:name
// @access  Private/Admin
exports.deleteSpecialite = async (req, res, next) => {
    try {
        const name = req.params.name;

        const result = await Classe.updateMany(
            { serie: name },
            { $unset: { serie: "" } }
        );

        res.status(200).json({
            success: true,
            message: `La spécialité ${name} a été retirée de ${result.modifiedCount} classe(s)`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
