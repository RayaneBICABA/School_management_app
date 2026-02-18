const mongoose = require('mongoose');

const ClasseSchema = new mongoose.Schema({
    niveau: {
        type: String,
        required: [true, 'Le niveau est requis'],
        trim: true,
        enum: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale', 'CP', 'CE1', 'CE2', 'CM1', 'CM2']
    },
    serie: {
        type: String,
        trim: true,
        default: 'Général' // A, C, D, etc. for high school
    },
    filiere: {
        type: String,
        required: [true, 'La filière est requise'],
        enum: ['Générale', 'Technique'],
        default: 'Générale'
    },
    section: {
        type: String,
        required: [true, 'La section/nom de classe est requis'], // e.g., 'A', '1', 'Rouge'
        trim: true
    },
    anneeScolaire: {
        type: String,
        required: [true, 'L\'année scolaire est requise'],
        default: '2025-2026'
    },
    professeurPrincipal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    capacite: {
        type: Number,
        default: 30
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual pour obtenir les périodes selon la filière
ClasseSchema.virtual('periodes').get(function () {
    if (this.filiere === 'Générale') {
        return ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
    } else if (this.filiere === 'Technique') {
        return ['Semestre 1', 'Semestre 2'];
    }
    return [];
});

// Virtual pour le nom complet de la classe
ClasseSchema.virtual('nom').get(function () {
    return `${this.niveau} ${this.section}`;
});

// Compound index to ensure uniqueness of Class name per year
ClasseSchema.index({ niveau: 1, serie: 1, section: 1, anneeScolaire: 1 }, { unique: true });

module.exports = mongoose.model('Classe', ClasseSchema);
