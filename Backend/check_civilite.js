const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management');
    const db = mongoose.connection.db;

    // Check professors and their civilite
    const profs = await db.collection('users').find({ role: 'PROFESSEUR' }, { projection: { nom: 1, prenom: 1, civilite: 1 } }).toArray();
    console.log('\n=== PROFESSEURS ET CIVILITÉ ===');
    profs.forEach(p => {
        console.log(`  ${p.prenom} ${p.nom} → civilite: ${p.civilite || 'NON DÉFINIE'}`);
    });

    // Check if bulletins' notes.professeur has civilite populated
    const bulletins = await db.collection('bulletins').find({}, {
        projection: { 'notes.professeur': 1, periode: 1, anneeScolaire: 1, eleve: 1 }
    }).limit(2).toArray();

    console.log('\n=== BULLETINS - PROFESSEURS DANS LES NOTES ===');
    for (const b of bulletins) {
        console.log(`Bulletin: ${b.anneeScolaire} - ${b.periode}`);
        const uniqueProfs = [...new Set((b.notes || []).map(n => n.professeur?.toString()).filter(Boolean))];
        console.log(`  Professeur IDs dans notes: ${uniqueProfs.join(', ')}`);

        for (const profId of uniqueProfs) {
            const prof = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(profId) }, { projection: { nom: 1, prenom: 1, civilite: 1 } });
            if (prof) {
                console.log(`  → ${prof.prenom} ${prof.nom}: civilite = ${prof.civilite || 'NON DÉFINIE'}`);
            }
        }
    }

    await mongoose.disconnect();
    console.log('\nDone.');
}

check().catch(console.error);
