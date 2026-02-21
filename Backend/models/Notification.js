const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: [true, 'L\'objet est requis'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Le contenu est requis']
    },
    type: {
        type: String,
        enum: ['classe', 'role'],
        required: true
    },
    targetClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe'
    }],
    targetRoles: [{
        type: String,
        enum: ['ADMIN', 'PROVISEUR', 'CENSEUR', 'CPE', 'PROFESSEUR', 'SECRETAIRE', 'ELEVE', 'PARENT']
    }],
    recipients: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        read: {
            type: Boolean,
            default: false
        },
        readAt: Date
    }],
    channels: {
        app: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        email: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ['Envoyé', 'Brouillon', 'Erreur'],
        default: 'Envoyé'
    },
    deletedBySender: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
