const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Note = require('../Backend/models/Note');
const Setting = require('../Backend/models/Setting');
const Classe = require('../Backend/models/Classe');

const MONGO_URI = 'mongodb://localhost:27017/school_db';

async function checkDB() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const setting = await Setting.findOne({ key: 'academic_year_config' });
        console.log('Setting academic_year_config:', JSON.stringify(setting, null, 2));

        const noteCount = await Note.countDocuments();
        console.log('Total Notes count:', noteCount);

        const samples = await Note.find().limit(5).populate('classe', 'niveau section filiere').populate('matiere', 'nom');
        console.log('Samples:', JSON.stringify(samples, null, 2));

        const periods = await Note.distinct('periode');
        console.log('Distinct periods in Notes:', periods);

        const years = await Note.distinct('anneeScolaire');
        console.log('Distinct academic years in Notes:', years);

        const firstClass = await Classe.findOne();
        if (firstClass) {
            console.log('First class:', firstClass.nom, 'filiere:', firstClass.filiere);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
