const mongoose = require('mongoose');

const NoteColumnSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de la colonne est requis'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere',
        required: [true, 'La matière est requise']
    },
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
        required: [true, 'La classe est requise']
    },
    professeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le professeur est requis']
    },
    periode: {
        type: String,
        required: [true, 'La période est requise'],
        enum: ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Semestre 1', 'Semestre 2']
    },
    ordre: {
        type: Number,
        default: 0
    },
    anneeScolaire: {
        type: String,
        required: [true, 'L\'année scolaire est requise'],
        default: '2025-2026'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index pour recherche rapide
NoteColumnSchema.index({ matiere: 1, classe: 1, periode: 1, anneeScolaire: 1 });
NoteColumnSchema.index({ professeur: 1, periode: 1 });

module.exports = mongoose.model('NoteColumn', NoteColumnSchema);
