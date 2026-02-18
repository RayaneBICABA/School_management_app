const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    eleve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'élève est requis"]
    },
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe',
        required: [true, 'La classe est requise']
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    titre: {
        type: String,
        required: [true, "Le titre est requis"],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, "La description est requise"],
        trim: true,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    date: {
        type: Date,
        required: [true, 'La date est requise'],
        default: Date.now
    },
    heure: {
        type: String,
        trim: true
    },
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere'
    },
    professeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        required: [true, "Le type d'incident est requis"],
        enum: ['absence', 'retard', 'incident', 'sanction', 'conduite', 'Discipline', 'Médical', 'Pédagogique', 'Autre'],
        default: 'incident'
    },
    priorite: {
        type: String,
        enum: ['Basse', 'Moyenne', 'Haute', 'faible', 'moyenne', 'elevee'],
        default: 'Moyenne'
    },
    gravite: {
        type: String,
        enum: ['faible', 'moyenne', 'elevee'],
        default: 'moyenne'
    },
    statut: {
        type: String,
        enum: ['Non traité', 'En cours', 'Traité', 'en_attente', 'traite', 'archive'],
        default: 'Non traité'
    },
    lieu: {
        type: String,
        trim: true
    },
    personnesImpliquees: [
        {
            type: String
        }
    ],
    actionsPrises: [
        {
            type: String
        }
    ],
    pointsConduite: {
        type: Number,
        default: 0,
        min: [-20, 'Les points de conduite ne peuvent pas être inférieurs à -20'],
        max: [20, 'Les points de conduite ne peuvent pas être supérieurs à 20']
    },
    justifie: {
        type: Boolean,
        default: false
    },
    documentJustificatif: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index pour rechercher rapidement les incidents d'un élève
IncidentSchema.index({ eleve: 1, date: -1 });
// Index pour les incidents par classe et date
IncidentSchema.index({ classe: 1, date: -1 });
// Index pour les incidents par type et statut
IncidentSchema.index({ type: 1, statut: 1 });
// Index pour les incidents par professeur
IncidentSchema.index({ professeur: 1, date: -1 });

// Virtual pour calculer le total des points de conduite
IncidentSchema.virtual('totalPointsConduite').get(function() {
    return this.pointsConduite || 0;
});

// Méthode statique pour calculer les statistiques de discipline d'un élève
IncidentSchema.statics.getStatsEleve = async function(eleveId, anneeScolaire) {
    const debutAnnee = new Date(anneeScolaire.split('-')[0], 8, 1); // 1er septembre
    const finAnnee = new Date(anneeScolaire.split('-')[1], 6, 31); // 31 juillet
    
    const stats = await this.aggregate([
        {
            $match: {
                eleve: new mongoose.Types.ObjectId(eleveId),
                date: { $gte: debutAnnee, $lte: finAnnee }
            }
        },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalPoints: { $sum: { $ifNull: ['$pointsConduite', 0] } }
            }
        }
    ]);
    
    const result = {
        absences: 0,
        retards: 0,
        incidents: 0,
        sanctions: 0,
        totalPoints: 0
    };
    
    stats.forEach(stat => {
        if (stat._id === 'absence') result.absences = stat.count;
        else if (stat._id === 'retard') result.retards = stat.count;
        else if (stat._id === 'incident') result.incidents = stat.count;
        else if (stat._id === 'sanction') result.sanctions = stat.count;
        result.totalPoints += stat.totalPoints;
    });
    
    return result;
};

module.exports = mongoose.model('Incident', IncidentSchema);
