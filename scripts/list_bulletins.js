const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Bulletin = require('../Backend/models/Bulletin');

async function listBulletins() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const bulletins = await Bulletin.find({}).populate('eleve');
        console.log(`Total Bulletins: ${bulletins.length}`);
        bulletins.forEach(b => {
            console.log(`ID: ${b._id}, Eleve: ${b.eleve ? b.eleve.nom : 'Unknown'}, Year: ${b.anneeScolaire}, Periode: ${b.periode}, Notes Count: ${b.notes.length}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

listBulletins();
