const mongoose = require('mongoose');

const MatiereSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de la matière est requis'],
        trim: true,
        unique: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    },
    categorie: {
        type: String,
        enum: ['ENSEIGNEMENT GÉNÉRAL', 'ENSEIGNEMENT TECHNIQUE'],
        default: 'ENSEIGNEMENT GÉNÉRAL'
    },
    coefficient: {
        type: Number,
        default: 1
    },
    description: {
        type: String
    },
    couleur: {
        type: String,
        default: 'blue'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Matiere', MatiereSchema);
