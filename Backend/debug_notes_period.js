const mongoose = require('mongoose');
const Note = require('./models/Note');
const User = require('./models/User');

const debugNotes = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gestion-scolaire';
        await mongoose.connect(uri);

        console.log('Connected to DB. Fetching notes...');

        const note = await Note.findOne({ statut: 'VALIDEE' }).populate({
            path: 'eleve',
            populate: { path: 'classe' }
        });

        if (note && note.eleve && note.eleve.classe) {
            console.log('Student:', note.eleve.nom);
            console.log('Class:', note.eleve.classe.niveau, note.eleve.classe.section);
            console.log('Filiere:', JSON.stringify(note.eleve.classe.filiere));
            console.log('Note Period:', JSON.stringify(note.periode));
        } else {
            console.log('No validated note found with full student/class info.');
        }

    } catch (e) { console.error(e); }
    process.exit();
};

debugNotes();
