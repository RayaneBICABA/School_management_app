const mongoose = require('mongoose');

const DispensationSchema = new mongoose.Schema({
    eleve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'élève est requis"]
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere',
        required: [true, 'La matière est requise']
    },
    anneeScolaire: {
        type: String,
        required: [true, "L'année scolaire est requise"],
        default: '2025-2026'
    },
    motif: {
        type: String,
        required: [true, 'Le motif est requis']
    },
    dateDebut: {
        type: Date,
        default: Date.now
    },
    dateFin: {
        type: Date
    },
    creePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Un élève ne peut avoir qu'une dispensation par matière pour une année scolaire donnée
DispensationSchema.index({ eleve: 1, matiere: 1, anneeScolaire: 1 }, { unique: true });

module.exports = mongoose.model('Dispensation', DispensationSchema);
