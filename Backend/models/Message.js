const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    expediteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'expéditeur est requis']
    },
    destinataire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le destinataire est requis']
    },
    sujet: {
        type: String,
        required: [true, 'Le sujet est requis'],
        maxlength: [200, 'Le sujet ne peut pas dépasser 200 caractères'],
        trim: true
    },
    contenu: {
        type: String,
        required: [true, 'Le contenu est requis'],
        maxlength: [2000, 'Le contenu ne peut pas dépasser 2000 caractères']
    },
    pieceJointe: {
        type: String,
        default: null
    },
    nomPieceJointe: {
        type: String,
        default: null
    },
    typePieceJointe: {
        type: String,
        default: null
    },
    lu: {
        type: Boolean,
        default: false
    },
    dateLecture: {
        type: Date,
        default: null
    },
    supprimeParExpediteur: {
        type: Boolean,
        default: false
    },
    supprimeParDestinataire: {
        type: Boolean,
        default: false
    },
    dateSuppressionExpediteur: {
        type: Date,
        default: null
    },
    dateSuppressionDestinataire: {
        type: Date,
        default: null
    },
    priorite: {
        type: String,
        enum: ['BASSE', 'NORMAL', 'HAUTE', 'URGENT'],
        default: 'NORMAL'
    },
    categorie: {
        type: String,
        enum: ['ACADEMIQUE', 'DISCIPLINAIRE', 'ADMINISTRATIF', 'PERSONNEL', 'AUTRE'],
        default: 'PERSONNEL'
    },
    reponseA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    statut: {
        type: String,
        enum: ['ENVOYE', 'LU', 'REPONDU', 'SUPPRIME'],
        default: 'ENVOYE'
    },
    dateEnvoi: {
        type: Date,
        default: Date.now
    },
    dateReponse: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index pour recherche rapide
messageSchema.index({ expediteur: 1, destinataire: 1, supprimeParExpediteur: 1 });
messageSchema.index({ destinataire: 1, lu: 1, supprimeParDestinataire: 1 });
messageSchema.index({ dateEnvoi: -1 });
messageSchema.index({ statut: 1 });
messageSchema.index({ categorie: 1 });

// Méthode pour marquer comme lu
messageSchema.methods.marquerCommeLu = async function () {
    if (!this.lu) {
        this.lu = true;
        this.dateLecture = new Date();
        this.statut = 'LU';
        await this.save();
    }
    return this;
};

// Méthode pour répondre à un message
messageSchema.methods.repondre = async function (contenuReponse, expediteurId) {
    const Message = mongoose.model('Message');

    const reponse = await Message.create({
        expediteur: expediteurId,
        destinataire: this.expediteur,
        sujet: `Re: ${this.sujet}`,
        contenu: contenuReponse,
        reponseA: this._id,
        categorie: this.categorie,
        priorite: this.priorite
    });

    this.statut = 'REPONDU';
    this.dateReponse = new Date();
    await this.save();

    return reponse;
};

// Méthode pour supprimer pour l'expéditeur
messageSchema.methods.supprimerPourExpediteur = async function () {
    this.supprimeParExpediteur = true;
    this.dateSuppressionExpediteur = new Date();
    await this.save();
    return this;
};

// Méthode pour supprimer pour le destinataire
messageSchema.methods.supprimerPourDestinataire = async function () {
    this.supprimeParDestinataire = true;
    this.dateSuppressionDestinataire = new Date();
    await this.save();
    return this;
};

// Méthode virtuelle pour obtenir les messages non lus
messageSchema.statics.getMessagesNonLus = async function (userId) {
    return await this.find({
        destinataire: userId,
        lu: false,
        supprimeParDestinataire: false
    }).populate('expediteur', 'nom prenom photo role')
        .sort('-dateEnvoi');
};

// Méthode virtuelle pour obtenir la conversation entre deux utilisateurs
messageSchema.statics.getConversation = async function (userId1, userId2, limit = 50) {
    return await this.find({
        $or: [
            { expediteur: userId1, destinataire: userId2, supprimeParExpediteur: false },
            { expediteur: userId2, destinataire: userId1, supprimeParDestinataire: false }
        ]
    })
        .populate('expediteur', 'nom prenom photo role')
        .populate('destinataire', 'nom prenom photo role')
        .sort('-dateEnvoi')
        .limit(limit);
};

// Middleware pour mettre à jour updatedAt
messageSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Message', messageSchema);
