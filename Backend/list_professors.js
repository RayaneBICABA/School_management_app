const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const professors = await User.find({ role: 'PROFESSEUR' }).select('nom prenom email matricule role');

        console.log('\n--- Liste des Professeurs ---');
        professors.forEach(p => {
            console.log(`Nom: ${p.nom} ${p.prenom}`);
            console.log(`Email: ${p.email}`);
            console.log(`Matricule: ${p.matricule || 'N/A'}`);
            console.log(`Mot de passe par défaut: ${p.matricule || '123456 (si non défini)'}`);
            console.log('---------------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error('FAILED TO LIST PROFESSORS:');
        console.error(err);
        process.exit(1);
    }
};

run();
