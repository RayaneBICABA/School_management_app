const mongoose = require('mongoose');

const ClasseMatiereSchema = new mongoose.Schema({
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
        required: [true, 'La classe est requise']
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere',
        required: [true, 'La matière est requise']
    },
    coefficient: {
        type: Number,
        required: [true, 'Le coefficient est requis'],
        min: [0.5, 'Le coefficient minimum est 0.5'],
        max: [10, 'Le coefficient maximum est 10'],
        default: 1
    },
    professeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    heuresParSemaine: {
        type: Number,
        default: 2
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ClasseMatiereSchema.index({ classe: 1, matiere: 1 }, { unique: true });

module.exports = mongoose.model('ClasseMatiere', ClasseMatiereSchema);
