const ClasseMatiere = require('../models/ClasseMatiere');
const Matiere = require('../models/Matiere');

// @desc    Get all classe matieres (Global)
// @route   GET /api/v1/classe-matieres
// @access  Private/Admin
exports.getAllClasseMatieres = async (req, res) => {
    try {
        // Filtre optionnel par professeur
        const filter = {};
        if (req.query.professeur) filter.professeur = req.query.professeur;

        const classeMatieres = await ClasseMatiere.find(filter)
            .populate('classe', 'niveau section serie filiere')
            .populate('matiere', 'nom code')
            .populate('professeur', 'nom prenom');

        // Filter out orphans (where class or matiere were deleted)
        const validRecords = classeMatieres.filter(cm => cm.classe && cm.matiere);

        res.status(200).json({
            success: true,
            count: validRecords.length,
            data: validRecords
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all matieres for a specific classe
// @route   GET /api/v1/classes/:classeId/matieres
// @access  Private
exports.getClasseMatieres = async (req, res) => {
    try {
        const classeMatieres = await ClasseMatiere.find({ classe: req.params.classeId })
            .populate('matiere')
            .populate('professeur', 'nom prenom email');

        // Filter orphans
        const filtered = classeMatieres.filter(cm => cm.matiere);

        res.status(200).json({
            success: true,
            count: filtered.length,
            data: filtered
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Add a matiere to a classe
// @route   POST /api/v1/classes/:classeId/matieres
// @access  Private/Admin
exports.addMatiereToClasse = async (req, res) => {
    try {
        const { matiereId, coefficient, professeurId, heuresParSemaine } = req.body;
        const { classeId } = req.params;

        if (!classeId || !matiereId) {
            return res.status(400).json({
                success: false,
                error: 'ID classe et ID matière requis'
            });
        }

        // Check if already exists
        const existing = await ClasseMatiere.findOne({ classe: classeId, matiere: matiereId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Cette matière est déjà assignée à cette classe'
            });
        }

        const classeMatiere = await ClasseMatiere.create({
            classe: classeId,
            matiere: matiereId,
            coefficient: coefficient || 1,
            professeur: professeurId,
            heuresParSemaine: heuresParSemaine || 2
        });

        const populated = await ClasseMatiere.findById(classeMatiere._id)
            .populate('matiere')
            .populate('professeur', 'nom prenom email');

        res.status(201).json({
            success: true,
            data: populated
        });
    } catch (err) {
        console.error('Error in addMatiereToClasse:', err);
        console.error('Request Body:', req.body);
        console.error('Request Params:', req.params);
        res.status(400).json({
            success: false,
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            debug: {
                body: req.body,
                params: req.params
            }
        });
    }
};

// @desc    Update a classe-matiere relationship
// @route   PUT /api/v1/classes/:classeId/matieres/:id
// @access  Private/Admin
exports.updateClasseMatiere = async (req, res) => {
    try {
        const classeMatiere = await ClasseMatiere.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('matiere').populate('professeur', 'nom prenom email');

        if (!classeMatiere) {
            return res.status(404).json({ success: false, error: 'Relation non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: classeMatiere
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Remove a matiere from a classe
// @route   DELETE /api/v1/classes/:classeId/matieres/:id
// @access  Private/Admin
exports.removeMatiereFromClasse = async (req, res) => {
    try {
        const classeMatiere = await ClasseMatiere.findByIdAndDelete(req.params.id);

        if (!classeMatiere) {
            return res.status(404).json({ success: false, error: 'Relation non trouvée' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get classes assigned to current professor
// @route   GET /api/v1/classe-matieres/my-classes
// @access  Private/Professor
exports.getMyClasses = async (req, res) => {
    try {
        const classeMatieres = await ClasseMatiere.find({ professeur: req.user.id })
            .populate('classe', 'niveau section')
            .populate('matiere', 'nom code');

        // Filter orphans
        const filtered = classeMatieres.filter(cm => cm.classe && cm.matiere);

        res.status(200).json({
            success: true,
            count: filtered.length,
            data: filtered
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
