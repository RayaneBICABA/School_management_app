const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    eleve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'élève est requis']
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
    notes: [{
        valeur: {
            type: Number,
            required: true,
            min: 0,
            max: 20
        },
        type: {
            type: String,
            required: true
            // Enum retiré pour permettre des noms d'évaluation personnalisés
        },
        date: {
            type: Date,
            default: Date.now
        },
        coefficient: {
            type: Number,
            default: 1,
            min: 1
        }
    }],
    statut: {
        type: String,
        enum: ['EN_ATTENTE', 'VALIDEE', 'REJETEE'],
        default: 'EN_ATTENTE'
    },
    validePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateValidation: {
        type: Date
    },
    motifRejet: {
        type: String
    },
    moyenne: {
        type: Number,
        min: 0,
        max: 20
    },
    appreciation: {
        type: String,
        maxlength: 500
    },
    anneeScolaire: {
        type: String,
        required: [true, 'L\'année scolaire est requise'],
        default: '2025-2026'
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
NoteSchema.index({ eleve: 1, matiere: 1, periode: 1, anneeScolaire: 1 });
NoteSchema.index({ classe: 1, periode: 1, statut: 1 });
NoteSchema.index({ professeur: 1, statut: 1 });

// Méthode pour calculer la moyenne
NoteSchema.methods.calculerMoyenne = function () {
    if (this.notes.length === 0) {
        return 0;
    }

    let totalPoints = 0;
    let totalCoefficients = 0;

    this.notes.forEach(note => {
        totalPoints += note.valeur * (note.coefficient || 1);
        totalCoefficients += (note.coefficient || 1);
    });

    return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
};

// Middleware pour mettre à jour updatedAt
NoteSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Note', NoteSchema);
