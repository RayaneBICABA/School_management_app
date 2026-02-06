const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est requis']
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis']
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Veuillez ajouter un email valide'
        ]
    },
    matricule: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined values to not violate unique constraint
    },
    telephone: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['ADMIN', 'ELEVE', 'PROFESSEUR', 'PARENT', 'CENSEUR', 'CPE', 'PROVISEUR', 'SECRETAIRE'],
        default: 'ELEVE'
    },
    status: {
        type: String,
        enum: ['ACTIF', 'INACTIF', 'EN_ATTENTE', 'BLOQUE'],
        default: 'EN_ATTENTE'
    },
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classe'
    },
    lastLogins: [
        {
            date: { type: Date, default: Date.now },
            ip: String,
            userAgent: String
        }
    ],
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
