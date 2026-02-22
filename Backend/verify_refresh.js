const mongoose = require('mongoose');
const User = require('./models/User');
const Bulletin = require('./models/Bulletin');
const Note = require('./models/Note');
const Matiere = require('./models/Matiere');
const Classe = require('./models/Classe');
const ClasseMatiere = require('./models/ClasseMatiere');
const Setting = require('./models/Setting');
require('dotenv').config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management');
        console.log('Connected to MongoDB');

        // 1. Setup Data
        const classObj = await Classe.findOne() || new Classe({ nom: 'RefreshTest', niveau: '6eme', section: 'General', anneeScolaire: '2025-2026' });
        if (classObj.isNew) await classObj.save();

        const student = await User.findOne({ role: 'ELEVE', classe: classObj._id }) || new User({
            nom: 'Test', prenom: 'Refresh', role: 'ELEVE', classe: classObj._id, matricule: 'REFRESH001', password: 'password123', email: 'refresh@test.com'
        });
        if (student.isNew) await student.save();

        const matiere = await Matiere.findOne() || new Matiere({ nom: 'Maths', coefficient: 4, categorie: 'FONDAMENTAL' });
        if (matiere.isNew) await matiere.save();

        const prof = await User.findOne({ role: 'PROFESSEUR' }) || new User({
            nom: 'Prof', prenom: 'Test', role: 'PROFESSEUR', email: 'prof@test.com', password: 'password123'
        });
        if (prof.isNew) await prof.save();

        // Ensure assignment
        let assignment = await ClasseMatiere.findOne({ classe: classObj._id, matiere: matiere._id });
        if (!assignment) {
            assignment = await ClasseMatiere.create({ classe: classObj._id, matiere: matiere._id, professeur: prof._id });
        }

        const periode = 'Trimestre 1';
        const year = '2025-2026';

        // 2. Create a GRADE
        await Note.deleteMany({ eleve: student._id, periode });
        const note = await Note.create({
            eleve: student._id,
            matiere: matiere._id,
            classe: classObj._id,
            professeur: prof._id,
            periode,
            anneeScolaire: year,
            statut: 'VALIDEE',
            notes: [{ type: 'Interro 1', valeur: 15, coefficient: 1 }],
            moyenne: 15
        });

        // 3. Create a STALE bulletin (Draft with 0 average)
        await Bulletin.deleteMany({ eleve: student._id, periode });
        const bulletin = await Bulletin.create({
            eleve: student._id,
            classe: classObj._id,
            periode,
            anneeScolaire: year,
            notes: [], // Empty notes
            moyenneGenerale: 0,
            statut: 'BROUILLON'
        });

        console.log('Initial Bulletin State:');
        console.log(`- Notes count: ${bulletin.notes.length}`);
        console.log(`- Average: ${bulletin.moyenneGenerale}`);

        // 4. Simulate Proactive Refresh
        const { createOrUpdateBulletin } = require('./controllers/bulletinController');

        console.log('\nRefreshing bulletin...');
        const updatedBulletin = await createOrUpdateBulletin(student._id, classObj._id, periode, year, null);

        console.log('\nUpdated Bulletin State:');
        console.log(`- Notes count: ${updatedBulletin.notes.length}`);
        console.log(`- Average: ${updatedBulletin.moyenneGenerale}`);

        if (updatedBulletin.notes.length > 0 && updatedBulletin.moyenneGenerale === 15) {
            console.log('\nSUCCESS: Bulletin was proactively updated with real data!');
        } else {
            console.log('\nFAILURE: Bulletin was not updated correctly.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

verify();
