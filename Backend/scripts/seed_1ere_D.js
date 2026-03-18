const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const ClasseMatiere = require('../models/ClasseMatiere');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seed1ereD = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding 1ere D\'');

        const anneeScolaire = '2025-2026';

        // 1. Create/Find Subjects
        const matieresData = [
            { nom: 'Français', code: 'FRA', categorie: 'ENSEIGNEMENT GÉNÉRAL', coefficient: 3, couleur: 'blue' },
            { nom: 'Mathématiques', code: 'MATH', categorie: 'ENSEIGNEMENT GÉNÉRAL', coefficient: 5, couleur: 'red' },
            { nom: 'Histoire-Géographie', code: 'HG', categorie: 'ENSEIGNEMENT GÉNÉRAL', coefficient: 2, couleur: 'green' },
            { nom: 'Philosophie', code: 'PHILO', categorie: 'ENSEIGNEMENT GÉNÉRAL', coefficient: 2, couleur: 'purple' },
            { nom: 'Électronique', code: 'ELEC', categorie: 'ENSEIGNEMENT TECHNIQUE', coefficient: 4, couleur: 'orange' },
            { nom: 'Mécanique', code: 'MECA', categorie: 'ENSEIGNEMENT TECHNIQUE', coefficient: 4, couleur: 'teal' }
        ];

        const matieres = [];
        for (const mData of matieresData) {
            let matiere = await Matiere.findOne({ code: mData.code });
            if (!matiere) {
                matiere = await Matiere.create(mData);
                console.log(`Subject created: ${matiere.nom}`);
            }
            matieres.push(matiere);
        }

        // 2. Create/Find Teachers
        const teachers = [];
        for (let i = 0; i < matieres.length; i++) {
            const email = `prof.${matieres[i].code.toLowerCase()}@ecole.com`;
            let teacher = await User.findOne({ email });
            if (!teacher) {
                teacher = await User.create({
                    nom: `Prof ${matieres[i].nom}`,
                    prenom: 'Expert',
                    email,
                    password: 'password123',
                    role: 'PROFESSEUR',
                    status: 'ACTIF'
                });
                console.log(`Teacher created: ${teacher.email}`);
            }
            teachers.push(teacher);
        }

        // 3. Create Class "1ere D'"
        let classe = await Classe.findOne({ niveau: '1ere', section: 'D\'', anneeScolaire });
        if (!classe) {
            classe = await Classe.create({
                niveau: '1ere',
                section: 'D\'',
                serie: 'D',
                filiere: 'Technique', // Since it has technical subjects
                anneeScolaire,
                capacite: 30
            });
            console.log(`Class created: ${classe.niveau} ${classe.section}`);
        }

        // 4. Link Subjects to Class with Teachers
        for (let i = 0; i < matieres.length; i++) {
            let cm = await ClasseMatiere.findOne({ classe: classe._id, matiere: matieres[i]._id });
            if (!cm) {
                await ClasseMatiere.create({
                    classe: classe._id,
                    matiere: matieres[i]._id,
                    coefficient: matieres[i].coefficient,
                    professeur: teachers[i]._id,
                    heuresParSemaine: 4
                });
                console.log(`Linked ${matieres[i].nom} to ${classe.niveau} ${classe.section} with ${teachers[i].email}`);
            }
        }

        // 5. Create 16 Students
        const students = [];
        for (let i = 1; i <= 16; i++) {
            const email = `eleve.d${i}@ecole.com`;
            let student = await User.findOne({ email });
            if (!student) {
                student = await User.create({
                    nom: `NOM${i}`,
                    prenom: `Prenom${i}`,
                    email,
                    password: 'password123',
                    role: 'ELEVE',
                    status: 'ACTIF',
                    matricule: `MAT${2025000 + i}`,
                    classe: classe._id,
                    sexe: i % 2 === 0 ? 'M' : 'F'
                });
                console.log(`Student created: ${student.email}`);
            }
            students.push(student);
        }

        console.log('Seeding of 1ere D\' completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding 1ere D\':', error);
        process.exit(1);
    }
};

seed1ereD();
