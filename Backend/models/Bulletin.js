const mongoose = require('mongoose');

const BulletinSchema = new mongoose.Schema({
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
    periode: {
        type: String,
        required: [true, 'La période est requise'],
        enum: ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Semestre 1', 'Semestre 2']
    },
    anneeScolaire: {
        type: String,
        required: [true, 'L\'année scolaire est requise'],
        default: '2025-2026'
    },
    notes: [{
        matiere: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Matiere'
        },
        professeur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        int: Number, // Int (1)
        dev: Number, // Dev (2)
        compo: Number, // Compo (3)
        interroGrades: [Number],
        devoirGrades: [Number],
        compoGrades: [Number],
        moyenneMatiere: Number,
        coeff: Number,
        notePonderee: Number,
        retraitPoints: {
            type: Number,
            default: 0
        },
        appreciation: String,
        categorie: String
    }],
    moyenneGenerale: {
        type: Number,
        min: 0,
        max: 20
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    totalCoefficients: {
        type: Number,
        default: 0
    },
    moyenneClasse: {
        type: Number,
        default: 0
    },
    meilleureMoyenneClasse: {
        type: Number,
        default: 0
    },
    pireMoyenneClasse: {
        type: Number,
        default: 0
    },
    rang: {
        type: String // Changed to String to support "1er", "2e", "ex"
    },
    effectif: {
        type: Number,
        min: 1
    },
    absencesJustifiees: {
        type: Number,
        default: 0
    },
    absencesNonJustifiees: {
        type: Number,
        default: 0
    },
    conduite: {
        type: String
    },
    retraitPoints: {
        type: Number,
        default: 0 // Global withdrawal (if any)
    },
    moyenneDefinitive: {
        type: Number,
        default: 0
    },
    appreciationGenerale: {
        type: String,
        maxlength: 1000
    },
    decision: {
        type: String,
        default: 'En cours'
    },
    genereePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateGeneration: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        enum: ['BROUILLON', 'FINALISE', 'DISTRIBUE'],
        default: 'BROUILLON'
    },
    dateDistribution: {
        type: Date
    },
    signatureCenseur: {
        type: Boolean,
        default: false
    },
    signatureProviseur: {
        type: Boolean,
        default: false
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
BulletinSchema.index({ eleve: 1, periode: 1, anneeScolaire: 1 }, { unique: true });
BulletinSchema.index({ classe: 1, periode: 1, statut: 1 });
BulletinSchema.index({ anneeScolaire: 1, statut: 1 });

// Méthode pour calculer la moyenne générale
BulletinSchema.methods.calculerMoyenneGenerale = async function () {
    try {
        if (!this.notes || this.notes.length === 0) {
            this.moyenneGenerale = 0;
            this.totalPoints = 0;
            this.totalCoefficients = 0;
            return this.moyenneGenerale;
        }

        let totalPoints = 0;
        let totalCoefficients = 0;

        for (const note of this.notes) {
            const coefficient = note.coeff || 1;
            const moyenne = note.moyenneMatiere || 0;
            const retrait = note.retraitPoints || 0;

            // Note pondérée = (moyenne - retrait) * coefficient
            // We ensure (moyenne - retrait) doesn't go below 0
            const finalNoteMatiere = Math.max(0, moyenne - retrait);

            totalPoints += finalNoteMatiere * coefficient;
            totalCoefficients += coefficient;
        }

        this.totalPoints = totalPoints;
        this.totalCoefficients = totalCoefficients;

        // Apply global withdrawal (retraitPoints) to the weighted total during average calculation
        const totalRetrait = this.retraitPoints || 0;
        const weightedTotalApresRetrait = Math.max(0, totalPoints - totalRetrait);

        // The average is now (weightedTotal - retrait) / totalCoefficients
        this.moyenneGenerale = totalCoefficients > 0 ? weightedTotalApresRetrait / totalCoefficients : 0;

        // Moyenne définitive is same as moyenneGenerale after deductions
        this.moyenneDefinitive = this.moyenneGenerale;

        return this.moyenneGenerale;
    } catch (error) {
        console.error('Erreur calcul moyenne générale:', error);
        this.moyenneGenerale = 0;
        return 0;
    }
};

// Méthode pour calculer le rang
BulletinSchema.methods.calculerRang = async function () {
    try {
        const User = mongoose.model('User');

        const bulletins = await Bulletin.find({
            classe: this.classe,
            periode: this.periode,
            anneeScolaire: this.anneeScolaire
        }).sort({ moyenneGenerale: -1 });

        this.effectif = await User.countDocuments({ classe: this.classe, role: 'ELEVE' });

        const rang = bulletins.findIndex(b => b._id.toString() === this._id.toString()) + 1;
        this.rang = rang > 0 ? rang : bulletins.length;

        return this.rang;
    } catch (error) {
        console.error('Erreur calcul rang:', error);
        this.rang = 1;
        this.effectif = 1;
        return 1;
    }
};

// Middleware pour mettre à jour updatedAt
BulletinSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Bulletin', BulletinSchema);
