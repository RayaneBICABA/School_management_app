const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';

async function checkGrades() {
    await mongoose.connect(MONGO_URI);

    // Minimal schemes for debugging
    const Classe = mongoose.model('Classe', new mongoose.Schema({}, { strict: false }));
    const Note = mongoose.model('Note', new mongoose.Schema({
        matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere' }
    }, { strict: false }));
    const Matiere = mongoose.model('Matiere', new mongoose.Schema({}, { strict: false }));

    const testClasse = await Classe.findOne({ niveau: '1ère', section: 'TEST' });
    if (!testClasse) return console.log('Classe not found');

    const notes = await Note.find({ classe: testClasse._id }).populate('matiere');
    console.log(`Found ${notes.length} notes entries.`);
    if (notes.length > 0) {
        console.log("Sample Note structure:");
        console.log(JSON.stringify(notes[0], null, 2));
    }
    process.exit(0);
}
checkGrades().catch(console.error);
