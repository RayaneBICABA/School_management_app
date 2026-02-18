const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');

// @desc    Envoyer un message
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
    const { destinataire, sujet, contenu, priorite, categorie } = req.body;

    // Vérifier que le destinataire existe
    const destinataireUser = await User.findById(destinataire);
    if (!destinataireUser) {
        return next(new ErrorResponse('Destinataire non trouvé', 404));
    }

    // Vérifier que l'utilisateur ne s'envoie pas un message à lui-même
    if (destinataire === req.user.id.toString()) {
        return next(new ErrorResponse('Vous ne pouvez pas vous envoyer un message à vous-même', 400));
    }

    // Créer le message
    const message = await Message.create({
        expediteur: req.user.id,
        destinataire,
        sujet,
        contenu,
        priorite: priorite || 'NORMAL',
        categorie: categorie || 'PERSONNEL'
    });

    // Populer les données pour la réponse
    await message.populate([
        { path: 'expediteur', select: 'nom prenom photo role' },
        { path: 'destinataire', select: 'nom prenom photo role' }
    ]);

    res.status(201).json({
        success: true,
        data: message
    });
});

// @desc    Obtenir les messages de l'utilisateur
// @route   GET /api/v1/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, nonLusSeulement, categorie } = req.query;

    // Construire la requête
    let query = {
        $or: [
            { expediteur: req.user.id, supprimeParExpediteur: false },
            { destinataire: req.user.id, supprimeParDestinataire: false }
        ]
    };

    // Filtrer par messages non lus seulement
    if (nonLusSeulement === 'true') {
        query.destinataire = req.user.id;
        query.lu = false;
    }

    // Filtrer par catégorie
    if (categorie) {
        query.categorie = categorie;
    }

    // Exécuter la requête avec pagination
    const messages = await Message.find(query)
        .populate('expediteur', 'nom prenom photo role')
        .populate('destinataire', 'nom prenom photo role')
        .sort('-dateEnvoi')
        .limit(limit * 1)
        .skip((page - 1) * limit);

    // Compter le total pour la pagination
    const total = await Message.countDocuments(query);

    res.status(200).json({
        success: true,
        count: messages.length,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        data: messages
    });
});

// @desc    Obtenir une conversation spécifique
// @route   GET /api/v1/messages/conversation/:userId
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Vérifier que l'autre utilisateur existe
    const otherUser = await User.findById(userId);
    if (!otherUser) {
        return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Obtenir la conversation
    const messages = await Message.getConversation(req.user.id, userId, limit);

    // Marquer les messages reçus comme lus
    await Message.updateMany(
        {
            expediteur: userId,
            destinataire: req.user.id,
            lu: false
        },
        {
            lu: true,
            dateLecture: new Date()
        }
    );

    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
    });
});

// @desc    Obtenir un message spécifique
// @route   GET /api/v1/messages/:id
// @access  Private
exports.getMessage = asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id)
        .populate('expediteur', 'nom prenom photo role')
        .populate('destinataire', 'nom prenom photo role')
        .populate('reponseA', 'sujet contenu dateEnvoi');

    if (!message) {
        return next(new ErrorResponse('Message non trouvé', 404));
    }

    // Vérifier que l'utilisateur a le droit de voir ce message
    if (message.expediteur._id.toString() !== req.user.id && 
        message.destinataire._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Non autorisé à voir ce message', 403));
    }

    // Vérifier que le message n'est pas supprimé pour cet utilisateur
    if ((message.expediteur._id.toString() === req.user.id && message.supprimeParExpediteur) ||
        (message.destinataire._id.toString() === req.user.id && message.supprimeParDestinataire)) {
        return next(new ErrorResponse('Message non trouvé', 404));
    }

    // Marquer comme lu si c'est le destinataire
    if (message.destinataire._id.toString() === req.user.id && !message.lu) {
        await message.marquerCommeLu();
    }

    res.status(200).json({
        success: true,
        data: message
    });
});

// @desc    Répondre à un message
// @route   POST /api/v1/messages/:id/repondre
// @access  Private
exports.repondreMessage = asyncHandler(async (req, res, next) => {
    const { contenu } = req.body;
    const messageId = req.params.id;

    // Obtenir le message original
    const messageOriginal = await Message.findById(messageId);
    if (!messageOriginal) {
        return next(new ErrorResponse('Message non trouvé', 404));
    }

    // Vérifier que l'utilisateur peut répondre (doit être le destinataire)
    if (messageOriginal.destinataire.toString() !== req.user.id) {
        return next(new ErrorResponse('Seul le destinataire peut répondre à ce message', 403));
    }

    // Créer la réponse
    const reponse = await messageOriginal.repondre(contenu, req.user.id);

    // Populer les données
    await reponse.populate([
        { path: 'expediteur', select: 'nom prenom photo role' },
        { path: 'destinataire', select: 'nom prenom photo role' }
    ]);

    res.status(201).json({
        success: true,
        data: reponse
    });
});

// @desc    Marquer un message comme lu
// @route   PUT /api/v1/messages/:id/lire
// @access  Private
exports.marquerCommeLu = asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        return next(new ErrorResponse('Message non trouvé', 404));
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.destinataire.toString() !== req.user.id) {
        return next(new ErrorResponse('Seul le destinataire peut marquer ce message comme lu', 403));
    }

    await message.marquerCommeLu();

    res.status(200).json({
        success: true,
        data: message
    });
});

// @desc    Supprimer un message
// @route   DELETE /api/v1/messages/:id
// @access  Private
exports.supprimerMessage = asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        return next(new ErrorResponse('Message non trouvé', 404));
    }

    // Vérifier que l'utilisateur a le droit de supprimer ce message
    const estExpediteur = message.expediteur.toString() === req.user.id;
    const estDestinataire = message.destinataire.toString() === req.user.id;

    if (!estExpediteur && !estDestinataire) {
        return next(new ErrorResponse('Non autorisé à supprimer ce message', 403));
    }

    // Supprimer pour l'utilisateur approprié
    if (estExpediteur) {
        await message.supprimerPourExpediteur();
    } else {
        await message.supprimerPourDestinataire();
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Obtenir les messages non lus
// @route   GET /api/v1/messages/non-lus
// @access  Private
exports.getMessagesNonLus = asyncHandler(async (req, res, next) => {
    const messages = await Message.getMessagesNonLus(req.user.id);

    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
    });
});

// @desc    Obtenir les statistiques de messagerie
// @route   GET /api/v1/messages/stats
// @access  Private
exports.getMessageStats = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const stats = await Message.aggregate([
        {
            $match: {
                $or: [
                    { expediteur: userId, supprimeParExpediteur: false },
                    { destinataire: userId, supprimeParDestinataire: false }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalEnvoyes: {
                    $sum: { $cond: [{ $eq: ['$expediteur', userId] }, 1, 0] }
                },
                totalRecus: {
                    $sum: { $cond: [{ $eq: ['$destinataire', userId] }, 1, 0] }
                },
                nonLus: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$destinataire', userId] }, { $eq: ['$lu', false] }] },
                            1,
                            0
                        ]
                    }
                },
                parCategorie: {
                    $push: {
                        categorie: '$categorie',
                        estEnvoye: { $eq: ['$expediteur', userId] }
                    }
                }
            }
        }
    ]);

    // Compter par catégorie
    const categories = {};
    if (stats[0] && stats[0].parCategorie) {
        stats[0].parCategorie.forEach(item => {
            if (!categories[item.categorie]) {
                categories[item.categorie] = { envoyes: 0, recus: 0 };
            }
            if (item.estEnvoye) {
                categories[item.categorie].envoyes++;
            } else {
                categories[item.categorie].recus++;
            }
        });
    }

    res.status(200).json({
        success: true,
        data: {
            totalEnvoyes: stats[0]?.totalEnvoyes || 0,
            totalRecus: stats[0]?.totalRecus || 0,
            nonLus: stats[0]?.nonLus || 0,
            categories
        }
    });
});

// @desc    Uploader une pièce jointe
// @route   POST /api/v1/messages/upload
// @access  Private
exports.uploadPieceJointe = asyncHandler(async (req, res, next) => {
    if (!req.files) {
        return next(new ErrorResponse('Veuillez uploader un fichier', 400));
    }

    const file = req.files.file;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return next(new ErrorResponse('Le fichier ne doit pas dépasser 5MB', 400));
    }

    // Vérifier le type de fichier
    const typesAutorises = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!typesAutorises.includes(file.mimetype)) {
        return next(new ErrorResponse('Type de fichier non autorisé', 400));
    }

    // Générer un nom de fichier unique
    const nomFichier = `message_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const cheminFichier = path.join(__dirname, '../uploads/messages', nomFichier);

    // Déplacer le fichier
    file.mv(cheminFichier, async (err) => {
        if (err) {
            return next(new ErrorResponse('Erreur lors de l\'upload du fichier', 500));
        }

        res.status(200).json({
            success: true,
            data: {
                nomFichier,
                chemin: `/uploads/messages/${nomFichier}`,
                nomOriginal: file.name,
                type: file.mimetype,
                taille: file.size
            }
        });
    });
});
