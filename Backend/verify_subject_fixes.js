const mongoose = require('mongoose');
const Matiere = require('./models/Matiere');

async function verifyFixes() {
    console.log('--- Verification des correctifs ---');

    try {
        // Connect to DB (Modern mongoose doesn't need those options)
        await mongoose.connect('mongodb://localhost:27017/school_management');
        console.log('Connecté à la base de données.');

        // 1. Verifier le champ couleur dans Matiere
        const testName = 'Test Matiere Color ' + Date.now();
        const testMatiere = new Matiere({
            nom: testName,
            couleur: 'emerald'
        });
        await testMatiere.save();

        const saved = await Matiere.findOne({ nom: testName });
        if (saved && saved.couleur === 'emerald') {
            console.log('✓ Champ couleur persisté dans le modèle Matiere.');
        } else {
            console.log('✗ Echec de la persistance de la couleur.');
        }

        // 2. Verifier l'idempotence (Simulation du controleur)
        const name = 'Matiere Idempotence ' + Date.now();
        console.log(`Simulation de création de "${name}"...`);

        // Premiere creation
        const m1 = await Matiere.create({ nom: name, couleur: 'blue' });
        console.log('Creation 1: ' + m1._id);

        // Deuxieme creation (Idempotence)
        let m2;
        try {
            // Logic from controller:
            m2 = await Matiere.findOne({ nom: new RegExp(`^${name}$`, 'i') });
            if (!m2) {
                m2 = await Matiere.create({ nom: name });
            }
            console.log('Creation 2 (idempotente): ' + m2._id);

            if (m1._id.toString() === m2._id.toString()) {
                console.log('✓ Idempotence confirmée : le même objet a été récupéré.');
            } else {
                console.log('✗ Echec de l\'idempotence.');
            }
        } catch (e) {
            console.log('✗ Erreur lors de la creation 2: ' + e.message);
        }

        // Cleanup
        await Matiere.deleteOne({ _id: testMatiere._id });
        await Matiere.deleteOne({ _id: m1._id });

    } catch (err) {
        console.error('Erreur globale:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnecté.');
    }
}

verifyFixes();
