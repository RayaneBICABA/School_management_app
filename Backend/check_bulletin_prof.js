const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management_app');
        require('./models/User');
        require('./models/Matiere');
        const Bulletin = require('./models/Bulletin');

        console.log("Fetching a sample bulletin with notes...");
        const bulletin = await Bulletin.findOne({ "notes.0": { $exists: true } })
            .populate('notes.matiere', 'nom')
            .populate('notes.professeur', 'nom prenom civilite')
            .lean();

        if (!bulletin) {
            console.log("No bulletins with notes found.");
            return;
        }

        console.log(`Bulletin ID: ${bulletin._id}, Period: ${bulletin.periode}`);

        for (const note of bulletin.notes) {
            console.log(`Matiere: ${note.matiere?.nom || 'N/A'}`);
            console.log(`Professeur ID original: ${note.professeur?._id || note.professeur}`);
            console.log(`Professeur data:`, note.professeur);
            console.log('---');
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}
check();
