const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    eleve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'élève est requis']
    },
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
        required: [true, 'La classe est requise']
    },
    date: {
        type: Date,
        required: [true, 'La date est requise']
    },
    statut: {
        type: String,
        enum: ['present', 'absent', 'late'],
        required: [true, 'Le statut est requis']
    },
    heures: {
        type: Number,
        default: 0,
        min: 0,
        max: 24
    },
    sauvegarde: {
        type: Boolean,
        default: false
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le marqueur est requis']
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere'
    },
    heureDebut: {
        type: String
    },
    heureFin: {
        type: String
    },
    justifie: {
        type: Boolean,
        default: false
    },
    statusJustification: {
        type: String,
        enum: ['NON_JUSTIFIEE', 'EN_ATTENTE', 'VALIDE', 'REFUTE'],
        default: 'NON_JUSTIFIEE'
    },
    justificatif: {
        type: String // Path to uploaded file
    },
    motivation: {
        type: String // Reason code: maladie, famille, etc.
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

// Index for efficient queries
AttendanceSchema.index({ date: 1, statut: 1 });
AttendanceSchema.index({ eleve: 1, date: 1 });
AttendanceSchema.index({ classe: 1, date: 1 });

// Middleware to update updatedAt
AttendanceSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
