const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Note = require('../Backend/models/Note');
const Bulletin = require('../Backend/models/Bulletin');
const Classe = require('../Backend/models/Classe');
const User = require('../Backend/models/User');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const currentYear = '2025-2026';
        const currentPeriode = 'Trimestre 1';

        // Find 2nde C' class
        const classe = await Classe.findOne({ niveau: '2nde', section: "C'" });
        if (!classe) {
            console.log("Classe 2nde C' not found");
            return;
        }
        console.log(`Found Classe: ${classe.niveau} ${classe.section} (${classe._id})`);

        // Check Notes for this class
        const noteCount = await Note.countDocuments({
            classe: classe._id,
            periode: currentPeriode,
            anneeScolaire: currentYear
        });
        const validatedNoteCount = await Note.countDocuments({
            classe: classe._id,
            periode: currentPeriode,
            anneeScolaire: currentYear,
            statut: 'VALIDEE'
        });
        console.log(`Notes Found: ${noteCount} total, ${validatedNoteCount} validated`);

        if (validatedNoteCount > 0) {
            const sampleNote = await Note.findOne({
                classe: classe._id,
                periode: currentPeriode,
                anneeScolaire: currentYear,
                statut: 'VALIDEE'
            }).populate('eleve matiere');
            console.log('Sample Validated Note:');
            console.log(`  Eleve: ${sampleNote.eleve.nom} ${sampleNote.eleve.prenom}`);
            console.log(`  Matiere: ${sampleNote.matiere.nom}`);
            console.log(`  Notes Array Length: ${sampleNote.notes.length}`);
            console.log(`  Statut: ${sampleNote.statut}`);
        }

        // Check Bulletins for this class
        const bulletinCount = await Bulletin.countDocuments({
            classe: classe._id,
            periode: currentPeriode,
            anneeScolaire: currentYear
        });
        console.log(`Bulletins Found: ${bulletinCount}`);

        if (bulletinCount > 0) {
            const sampleBulletin = await Bulletin.findOne({
                classe: classe._id,
                periode: currentPeriode,
                anneeScolaire: currentYear
            }).populate('eleve');
            console.log('Sample Bulletin:');
            console.log(`  Eleve: ${sampleBulletin.eleve.nom} ${sampleBulletin.eleve.prenom}`);
            console.log(`  Notes Array Length: ${sampleBulletin.notes.length}`);
            console.log(`  Statut: ${sampleBulletin.statut}`);
            console.log(`  Moyenne: ${sampleBulletin.moyenneGenerale}`);

            if (sampleBulletin.notes.length > 0) {
                console.log('First note in bulletin:');
                console.log(JSON.stringify(sampleBulletin.notes[0], null, 2));
            }
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
