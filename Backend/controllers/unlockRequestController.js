const UnlockRequest = require('../models/UnlockRequest');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Créer une demande de déblocage
// @route   POST /api/v1/unlock-requests
// @access  Private (Professeur)
exports.createUnlockRequest = asyncHandler(async (req, res, next) => {
    // Vérifier que l'utilisateur est un professeur
    if (req.user.role !== 'PROFESSEUR') {
        return next(new ErrorResponse('Seuls les professeurs peuvent créer des demandes de déblocage', 403));
    }

    // Ajouter l'ID du professeur
    req.body.professeur = req.user.id;

    // Vérifier qu'il n'y a pas déjà une demande en attente pour cette combinaison
    const existingRequest = await UnlockRequest.findOne({
        professeur: req.user.id,
        classe: req.body.classe,
        matiere: req.body.matiere,
        periode: req.body.periode,
        statut: 'EN_ATTENTE'
    });

    if (existingRequest) {
        return next(new ErrorResponse('Vous avez déjà une demande en attente pour cette classe/matière/période', 400));
    }

    const unlockRequest = await UnlockRequest.create(req.body);
    await unlockRequest.populate(['professeur', 'classe', 'matiere']);

    res.status(201).json({
        success: true,
        data: unlockRequest
    });
});

// @desc    Obtenir les demandes de déblocage
// @route   GET /api/v1/unlock-requests
// @access  Private
exports.getUnlockRequests = asyncHandler(async (req, res, next) => {
    let filter = {};

    // Si professeur, voir seulement ses demandes
    if (req.user.role === 'PROFESSEUR') {
        filter.professeur = req.user.id;
    }
    // Si censeur, proviseur ou admin, voir toutes les demandes
    else if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN' && req.user.role !== 'PROVISEUR') {
        return next(new ErrorResponse('Accès non autorisé', 403));
    }

    // Filtres optionnels
    if (req.query.statut) {
        filter.statut = req.query.statut;
    }
    if (req.query.classe) {
        filter.classe = req.query.classe;
    }
    if (req.query.matiere) {
        filter.matiere = req.query.matiere;
    }

    const unlockRequests = await UnlockRequest.find(filter)
        .populate('professeur', 'nom prenom email')
        .populate('classe', 'niveau section filiere')
        .populate('matiere', 'nom')
        .populate('traitePar', 'nom prenom')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: unlockRequests.length,
        data: unlockRequests
    });
});

// @desc    Obtenir une demande de déblocage
// @route   GET /api/v1/unlock-requests/:id
// @access  Private
exports.getUnlockRequest = asyncHandler(async (req, res, next) => {
    const unlockRequest = await UnlockRequest.findById(req.params.id)
        .populate('professeur', 'nom prenom email')
        .populate('classe', 'niveau section filiere')
        .populate('matiere', 'nom')
        .populate('traitePar', 'nom prenom');

    if (!unlockRequest) {
        return next(new ErrorResponse('Demande non trouvée', 404));
    }

    // Vérifier les permissions
    if (req.user.role === 'PROFESSEUR' && unlockRequest.professeur._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Accès non autorisé', 403));
    }

    res.status(200).json({
        success: true,
        data: unlockRequest
    });
});

const Note = require('../models/Note');

// @desc    Approuver une demande de déblocage
// @route   PUT /api/v1/unlock-requests/:id/approve
// @access  Private (Censeur/Admin)
exports.approveUnlockRequest = asyncHandler(async (req, res, next) => {
    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN' && req.user.role !== 'PROVISEUR') {
        return next(new ErrorResponse('Seul le censeur ou le proviseur peut approuver les demandes', 403));
    }

    const unlockRequest = await UnlockRequest.findById(req.params.id);

    if (!unlockRequest) {
        return next(new ErrorResponse('Demande non trouvée', 404));
    }

    if (unlockRequest.statut !== 'EN_ATTENTE') {
        return next(new ErrorResponse('Cette demande a déjà été traitée', 400));
    }

    unlockRequest.statut = 'APPROUVEE';
    unlockRequest.traitePar = req.user.id;
    unlockRequest.dateTraitement = Date.now();

    // 1. Sauvegarder l'approbation de la demande
    await unlockRequest.save();

    // 2. Débloquer réellement les notes correspondantes
    // On repasse les notes de VALIDEE à BROUILLON
    await Note.updateMany(
        {
            professeur: unlockRequest.professeur,
            classe: unlockRequest.classe,
            matiere: unlockRequest.matiere,
            periode: unlockRequest.periode,
            statut: 'VALIDEE'
        },
        {
            $set: {
                statut: 'BROUILLON',
                updatedAt: Date.now()
            }
        }
    );

    await unlockRequest.populate(['professeur', 'classe', 'matiere', 'traitePar']);

    res.status(200).json({
        success: true,
        data: unlockRequest
    });
});

// @desc    Rejeter une demande de déblocage
// @route   PUT /api/v1/unlock-requests/:id/reject
// @access  Private (Censeur/Admin)
exports.rejectUnlockRequest = asyncHandler(async (req, res, next) => {
    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN' && req.user.role !== 'PROVISEUR') {
        return next(new ErrorResponse('Seul le censeur ou le proviseur peut rejeter les demandes', 403));
    }

    const unlockRequest = await UnlockRequest.findById(req.params.id);

    if (!unlockRequest) {
        return next(new ErrorResponse('Demande non trouvée', 404));
    }

    if (unlockRequest.statut !== 'EN_ATTENTE') {
        return next(new ErrorResponse('Cette demande a déjà été traitée', 400));
    }

    if (!req.body.raisonRejet) {
        return next(new ErrorResponse('La raison du rejet est requise', 400));
    }

    unlockRequest.statut = 'REJETEE';
    unlockRequest.traitePar = req.user.id;
    unlockRequest.dateTraitement = Date.now();
    unlockRequest.raisonRejet = req.body.raisonRejet;

    await unlockRequest.save();
    await unlockRequest.populate(['professeur', 'classe', 'matiere', 'traitePar']);

    res.status(200).json({
        success: true,
        data: unlockRequest
    });
});

// @desc    Supprimer une demande de déblocage
// @route   DELETE /api/v1/unlock-requests/:id
// @access  Private (Professeur - seulement ses demandes)
exports.deleteUnlockRequest = asyncHandler(async (req, res, next) => {
    const unlockRequest = await UnlockRequest.findById(req.params.id);

    if (!unlockRequest) {
        return next(new ErrorResponse('Demande non trouvée', 404));
    }

    // Seul le professeur propriétaire peut supprimer sa demande
    if (unlockRequest.professeur.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Accès non autorisé', 403));
    }

    // Ne peut supprimer que les demandes en attente
    if (unlockRequest.statut !== 'EN_ATTENTE') {
        return next(new ErrorResponse('Seules les demandes en attente peuvent être supprimées', 400));
    }

    await unlockRequest.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
