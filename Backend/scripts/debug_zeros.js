const mongoose = require('mongoose');
const Bulletin = require('../models/Bulletin');
const Note = require('../models/Note');
const User = require('../models/User');
const Classe = require('../models/Classe');

async function debugData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/school_management');
        console.log('Connected to database');

        const classId = '69971d56a294b6e81246d88d'; // 6ème B
        // Wait, the user said they clicked on a class I created.
        // My test class was '699a248b7c9d6e80eb6eede5' (TEST) or something similar.
        // Let's find the latest created class with students.

        const noteStats = await Note.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]);
        console.log('\n--- Global Note Status Summary ---');
        noteStats.forEach(s => console.log(`Status: ${s._id || 'UNDEFINED'}, Count: ${s.count}`));

        const classes = await Classe.find({}).sort({ createdAt: -1 });

        for (const c of classes) {
            const studentCount = await User.countDocuments({ role: 'ELEVE', classe: c._id });

            const studentsWithNotes = [];
            const students = await User.find({ role: 'ELEVE', classe: c._id });
            for (const s of students) {
                const notes = await Note.find({ eleve: s._id });
                if (notes.length > 0) {
                    studentsWithNotes.push({ s, notes });
                }
            }

            if (studentsWithNotes.length > 0) {
                console.log(`\n--- Class: ${c.niveau} ${c.section} (${c._id}) - Students with notes: ${studentsWithNotes.length}/${studentCount} ---`);
                for (const item of studentsWithNotes) {
                    const { s, notes } = item;
                    const bulletins = await Bulletin.find({ eleve: s._id });

                    console.log(`  Student: ${s.nom} ${s.prenom} (${s._id})`);
                    console.log(`    Bulletins: ${bulletins.length}`);
                    bulletins.forEach(b => console.log(`      - Bulletin ${b._id}: Avg ${b.moyenneGenerale}, Period ${b.periode}, Status ${b.statut}`));

                    console.log(`    Notes: ${notes.length}`);
                    notes.forEach(n => console.log(`      - Note Subject ${n.matiere}: Status ${n.statut}, Avg ${n.moyenne}, Period ${n.periode}`));
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugData();
