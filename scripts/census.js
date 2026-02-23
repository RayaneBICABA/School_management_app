const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Note = require('../Backend/models/Note');
const Bulletin = require('../Backend/models/Bulletin');
const Setting = require('../Backend/models/Setting');

async function runCensus() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('--- SETTINGS CHECK ---');
        const academicSetting = await Setting.findOne({ key: 'academic_year_config' });
        console.log('Academic Year Config in DB:', JSON.stringify(academicSetting?.value, null, 2));

        console.log('\n--- NOTES CENSUS ---');
        const noteYears = await Note.aggregate([
            { $group: { _id: "$anneeScolaire", count: { $sum: 1 } } }
        ]);
        console.log('Notes count by year:', noteYears);

        console.log('\n--- BULLETINS CENSUS ---');
        const bulletinYears = await Bulletin.aggregate([
            { $group: { _id: "$anneeScolaire", count: { $sum: 1 } } }
        ]);
        console.log('Bulletins count by year:', bulletinYears);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

runCensus();
