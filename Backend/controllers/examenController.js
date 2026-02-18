const Evaluation = require('../models/Evaluation');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const User = require('../models/User');

// @desc    Get all exams
// @route   GET /api/v1/examens
// @access  Private
exports.getExamens = async (req, res, next) => {
    try {
        const { classe, matiere, date, page = 1, limit = 20 } = req.query;
        
        // Build query
        let query = {};
        
        if (classe) {
            query.classe = classe;
        }
        
        if (matiere) {
            query.matiere = matiere;
        }
        
        if (date) {
            // Filter by date range
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        } else {
            // Only show future exams by default
            query.date = { $gte: new Date() };
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const examens = await Evaluation.find(query)
            .populate('classe', 'niveau section')
            .populate('matiere', 'nom coefficient')
            .populate('professeur', 'prenom nom')
            .sort({ date: 1, heureDebut: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Evaluation.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: examens,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur getExamens:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create exam
// @route   POST /api/v1/examens
// @access  Private (Professor, Admin)
exports.createExamen = async (req, res, next) => {
    try {
        const examenData = {
            nom: req.body.nom,
            description: req.body.description,
            type: req.body.type || 'EXAMEN',
            date: req.body.date,
            heureDebut: req.body.heureDebut,
            heureFin: req.body.heureFin,
            classe: req.body.classe,
            matiere: req.body.matiere,
            professeur: req.user._id,
            coefficient: req.body.coefficient || 1,
            salle: req.body.salle,
            documents: req.body.documents || [],
            instructions: req.body.instructions
        };
        
        const examen = await Evaluation.create(examenData);
        
        // Populate for response
        await examen.populate([
            { path: 'classe', select: 'niveau section' },
            { path: 'matiere', select: 'nom coefficient' },
            { path: 'professeur', select: 'prenom nom' }
        ]);
        
        res.status(201).json({
            success: true,
            data: examen
        });
    } catch (error) {
        console.error('Erreur createExamen:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update exam
// @route   PUT /api/v1/examens/:id
// @access  Private
exports.updateExamen = async (req, res, next) => {
    try {
        const examen = await Evaluation.findById(req.params.id);
        
        if (!examen) {
            return res.status(404).json({
                success: false,
                error: 'Examen non trouvé'
            });
        }
        
        // Check permissions (professor can only update their own exams)
        if (req.user.role === 'PROFESSEUR' && examen.professeur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Non autorisé à modifier cet examen'
            });
        }
        
        const updatedExamen = await Evaluation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate([
            { path: 'classe', select: 'niveau section' },
            { path: 'matiere', select: 'nom coefficient' },
            { path: 'professeur', select: 'prenom nom' }
        ]);
        
        res.status(200).json({
            success: true,
            data: updatedExamen
        });
    } catch (error) {
        console.error('Erreur updateExamen:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete exam
// @route   DELETE /api/v1/examens/:id
// @access  Private
exports.deleteExamen = async (req, res, next) => {
    try {
        const examen = await Evaluation.findById(req.params.id);
        
        if (!examen) {
            return res.status(404).json({
                success: false,
                error: 'Examen non trouvé'
            });
        }
        
        // Check permissions
        if (req.user.role === 'PROFESSEUR' && examen.professeur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Non autorisé à supprimer cet examen'
            });
        }
        
        await Evaluation.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Erreur deleteExamen:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get exam by ID
// @route   GET /api/v1/examens/:id
// @access  Private
exports.getExamen = async (req, res, next) => {
    try {
        const examen = await Evaluation.findById(req.params.id)
            .populate('classe', 'niveau section')
            .populate('matiere', 'nom coefficient')
            .populate('professeur', 'prenom nom');
        
        if (!examen) {
            return res.status(404).json({
                success: false,
                error: 'Examen non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            data: examen
        });
    } catch (error) {
        console.error('Erreur getExamen:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
