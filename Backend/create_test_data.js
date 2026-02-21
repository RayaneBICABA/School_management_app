const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Classe = require('./models/Classe');
const Matiere = require('./models/Matiere');
const ClasseMatiere = require('./models/ClasseMatiere');
const Note = require('./models/Note');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_db';

const createTestData = async () => {
    try {
        console.log('Connexion à MongoDB...', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connecté à MongoDB.');

        // 1. Créer une classe Test
        const anneeScolaire = '2025-2026';
        let testClasse = await Classe.findOne({ niveau: '1ère', section: 'TEST', anneeScolaire });
        if (!testClasse) {
            testClasse = await Classe.create({
                niveau: '1ère',
                section: 'TEST',
                serie: 'C',
                filiere: 'Générale',
                anneeScolaire,
                capacite: 30
            });
            console.log('Classe TEST créée.');
        } else {
            console.log('Classe TEST existait déjà.');
        }

        // 2. Créer 10 élèves
        const students = [];
        for (let i = 1; i <= 10; i++) {
            const email = `eleve.test${i}@lebian.com`;
            let student = await User.findOne({ email });
            if (!student) {
                student = await User.create({
                    nom: `Testeur`,
                    prenom: `Élève ${i}`,
                    email,
                    matricule: `TEST_MAT_${i}`,
                    password: 'password123',
                    role: 'ELEVE',
                    classe: testClasse._id,
                    status: 'ACTIF'
                });
            } else {
                student.classe = testClasse._id;
                await student.save();
            }
            students.push(student);
        }
        console.log('10 Élèves créés et affectés à la classe TEST.');

        // 3. Créer une matière
        let matiere = await Matiere.findOne({ nom: 'Physique-Test' });
        if (!matiere) {
            matiere = await Matiere.create({
                nom: 'Physique-Test',
                code: 'PHY-TEST',
                categorie: 'MATIÈRES SCIENTIFIQUES',
                coefficient: 4
            });
            console.log('Matière Physique-Test créée.');
        }

        // 4. Créer un professeur
        let professeur = await User.findOne({ email: 'prof.test@lebian.com' });
        if (!professeur) {
            professeur = await User.create({
                nom: 'Prof',
                prenom: 'Test',
                email: 'prof.test@lebian.com',
                password: 'password123',
                role: 'PROFESSEUR',
                status: 'ACTIF'
            });
            console.log('Professeur de test créé.');
        }

        // 5. Associer matière à la classe (ClasseMatiere)
        let classeMatiere = await ClasseMatiere.findOne({ classe: testClasse._id, matiere: matiere._id });
        if (!classeMatiere) {
            classeMatiere = await ClasseMatiere.create({
                classe: testClasse._id,
                matiere: matiere._id,
                coefficient: 4,
                professeur: professeur._id,
                heuresParSemaine: 4
            });
            console.log('Association Classe/Matière créée.');
        }

        // 6. Ajouter des notes avec 2 évaluations ('Devoir 1' et 'Devoir 2') pour chaque élève
        // Pour simuler la structure { matiere, eleve, periode, notes: [{type, valeur...}] }
        const periode = 'Trimestre 1';
        let notesCreated = 0;
        
        for (const student of students) {
            let noteDoc = await Note.findOne({
                eleve: student._id,
                matiere: matiere._id,
                periode,
                anneeScolaire
            });

            const valeurD1 = Math.floor(Math.random() * 11) + 10; // entre 10 et 20
            const valeurD2 = Math.floor(Math.random() * 11) + 10;

            const notesArray = [
                { type: 'Devoir 1', valeur: valeurD1, coefficient: 1 },
                { type: 'Devoir 2', valeur: valeurD2, coefficient: 2 }
            ];

            if (!noteDoc) {
                noteDoc = new Note({
                    eleve: student._id,
                    matiere: matiere._id,
                    classe: testClasse._id,
                    professeur: professeur._id,
                    periode,
                    anneeScolaire,
                    notes: notesArray,
                    statut: 'EN_ATTENTE'
                });
                noteDoc.moyenne = noteDoc.calculerMoyenne();
                await noteDoc.save();
                notesCreated++;
            } else {
                noteDoc.notes = notesArray;
                noteDoc.moyenne = noteDoc.calculerMoyenne();
                noteDoc.statut = 'EN_ATTENTE';
                await noteDoc.save();
            }
        }
        
        console.log(`${notesCreated} relevés de notes créés (avec 2 évaluations chacun).`);
        console.log('-- TERMINE --');
        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
};

createTestData();
