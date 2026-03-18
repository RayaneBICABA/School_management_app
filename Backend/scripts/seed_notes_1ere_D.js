const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const ClasseMatiere = require('../models/ClasseMatiere');
const Note = require('../models/Note');
const NoteColumn = require('../models/NoteColumn');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedNotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding Notes');

        const anneeScolaire = '2025-2026';
        const periode = 'Semestre 1';

        // 1. Find Class 1ere D'
        const classe = await Classe.findOne({ niveau: '1ere', section: 'D\'', anneeScolaire });
        if (!classe) {
            console.error('Class 1ere D\' not found');
            process.exit(1);
        }

        // 2. Find All Students in Class
        const students = await User.find({ classe: classe._id, role: 'ELEVE' });
        console.log(`Found ${students.length} students in 1ere D'`);

        // 3. Find All Subjects for Class
        const cms = await ClasseMatiere.find({ classe: classe._id }).populate('matiere');
        console.log(`Found ${cms.length} subjects for 1ere D'`);

        // 4. Find Admin for validation
        const admin = await User.findOne({ role: 'ADMIN' });

        for (const cm of cms) {
            if (!cm.matiere) continue;
            
            console.log(`Processing subject: ${cm.matiere.nom}`);

            // Create NoteColumns if they don't exist
            const columnNames = ['Devoir 1', 'Examen'];
            for (let i = 0; i < columnNames.length; i++) {
                let nc = await NoteColumn.findOne({
                    nom: columnNames[i],
                    matiere: cm.matiere._id,
                    classe: classe._id,
                    periode,
                    anneeScolaire
                });
                if (!nc) {
                    await NoteColumn.create({
                        nom: columnNames[i],
                        matiere: cm.matiere._id,
                        classe: classe._id,
                        professeur: cm.professeur,
                        periode,
                        anneeScolaire,
                        ordre: i
                    });
                    console.log(`Created NoteColumn: ${columnNames[i]} for ${cm.matiere.nom}`);
                }
            }

            // Create Notes for each student
            for (const student of students) {
                let noteDoc = await Note.findOne({
                    eleve: student._id,
                    matiere: cm.matiere._id,
                    periode,
                    anneeScolaire
                });

                if (!noteDoc) {
                    // Generate random grades
                    const v1 = Math.floor(Math.random() * 11) + 8; // 8 to 18
                    const v2 = Math.floor(Math.random() * 11) + 7; // 7 to 17
                    
                    const notesArray = [
                        { valeur: v1, type: 'Devoir 1', coefficient: 1 },
                        { valeur: v2, type: 'Examen', coefficient: 2 }
                    ];

                    const moyennes = (v1 * 1 + v2 * 2) / 3;

                    await Note.create({
                        eleve: student._id,
                        matiere: cm.matiere._id,
                        classe: classe._id,
                        professeur: cm.professeur,
                        periode,
                        notes: notesArray,
                        statut: 'VALIDEE',
                        validePar: admin ? admin._id : null,
                        dateValidation: Date.now(),
                        saisieParAdmin: true,
                        moyenne: moyennes,
                        anneeScolaire,
                        appreciation: moyennes >= 10 ? 'Travail satisfaisant' : 'Doit redoubler d\'efforts'
                    });
                    console.log(`Created validated notes for ${student.email} in ${cm.matiere.nom}`);
                }
            }
        }

        console.log('Seeding of notes for 1ere D\' completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding notes:', error);
        process.exit(1);
    }
};

seedNotes();
