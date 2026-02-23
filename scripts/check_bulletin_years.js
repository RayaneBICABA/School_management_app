const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Bulletin = require('../Backend/models/Bulletin');

async function checkBulletinYears() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const years = await Bulletin.distinct('anneeScolaire');
        console.log('Distinct Years in Bulletin model:', years);

        if (years.length > 0) {
            for (const year of years) {
                const count = await Bulletin.countDocuments({ anneeScolaire: year });
                console.log(`Year: ${year}, Count: ${count}`);

                const sample = await Bulletin.findOne({ anneeScolaire: year });
                console.log(`Sample Bulletin for ${year}: Notes length: ${sample.notes.length}, Statut: ${sample.statut}, Moyenne: ${sample.moyenneGenerale}`);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkBulletinYears();
