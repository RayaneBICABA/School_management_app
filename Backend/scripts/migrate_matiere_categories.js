const mongoose = require('mongoose');
const Matiere = require('../models/Matiere');
const Classe = require('../models/Classe');
const ClasseMatiere = require('../models/ClasseMatiere');
const Bulletin = require('../models/Bulletin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion-scolaire');
        console.log('Connected to MongoDB');

        // 1. Define General subjects keywords (normalized)
        const generalKeywords = [
            'mathematiques', 'physique-chimie', 'anglais', 'francais', 'svt',
            'histoire-geographie', 'philosophie', 'eps'
        ];

        const normalize = (str) => {
            return str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[^a-z]/g, ''); // Remove non-alphabetical chars
        };

        const normalizedKeywords = generalKeywords.map(normalize);

        const isGeneralSubject = (name) => {
            const normName = normalize(name);
            // Check if any keyword matches or is contained in the normalized name
            return normalizedKeywords.some(kw => normName.includes(kw) || kw.includes(normName));
        };

        // 2. Update all Matieres
        const allMatieres = await Matiere.find({});
        for (const matiere of allMatieres) {
            const isGeneral = isGeneralSubject(matiere.nom);
            matiere.categorie = isGeneral ? 'ENSEIGNEMENT GÉNÉRAL' : 'ENSEIGNEMENT TECHNIQUE';
            await matiere.save();
        }
        console.log(`Updated ${allMatieres.length} subjects based on user-provided list.`);

        // 3. Update all Bulletins (snapshots in notes array)
        const bulletins = await Bulletin.find({});
        let updatedBulletinsCount = 0;

        for (const bulletin of bulletins) {
            let modified = false;
            for (let i = 0; i < bulletin.notes.length; i++) {
                const note = bulletin.notes[i];
                if (note.matiere) {
                    const matiereDoc = await Matiere.findById(note.matiere);
                    if (matiereDoc && note.categorie !== matiereDoc.categorie) {
                        note.categorie = matiereDoc.categorie;
                        modified = true;
                    }
                }
            }
            if (modified) {
                await bulletin.save();
                updatedBulletinsCount++;
            }
        }
        console.log(`Updated snapshots in ${updatedBulletinsCount} bulletins.`);

        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

run();
