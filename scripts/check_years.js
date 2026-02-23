const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Note = require('../Backend/models/Note');

async function checkYears() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const years = await Note.distinct('anneeScolaire');
        console.log('Distinct Years in Note model:', years);

        const periods = await Note.distinct('periode');
        console.log('Distinct Periods in Note model:', periods);

        if (years.length > 0) {
            for (const year of years) {
                const count = await Note.countDocuments({ anneeScolaire: year });
                console.log(`Year: ${year}, Count: ${count}`);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkYears();
