const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Devoir', 'Examen', 'TP', 'Projet'],
        required: true
    },
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
        required: true
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere',
        required: true
    },
    professeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    heureDebut: {
        type: String, // "08:00"
        required: true
    },
    heureFin: {
        type: String, // "10:00"
        required: true
    },
    salle: {
        type: String
    },
    statut: {
        type: String,
        enum: ['EN_ATTENTE', 'VALIDE', 'REFUSE', 'TERMINE'],
        default: 'EN_ATTENTE'
    },
    commentaireCenseur: {
        type: String
    },
    description: {
        type: String
    },
    anneeScolaire: {
        type: String,
        default: '2025-2026'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
