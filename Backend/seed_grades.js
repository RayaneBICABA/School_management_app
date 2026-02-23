const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load models
const User = require('./models/User');
const Classe = require('./models/Classe');
const Matiere = require('./models/Matiere');
const ClasseMatiere = require('./models/ClasseMatiere');
const Note = require('./models/Note');
const Setting = require('./models/Setting');

dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        console.log('Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connecté à MongoDB.');

        // 1. Obtenir la configuration de l'année scolaire
        const academicSetting = await Setting.findOne({ key: 'academic_year_config' });
        const currentYear = academicSetting ? (academicSetting.value.year || academicSetting.value.academicYear) : '2025-2026';
        console.log(`Année scolaire cible : ${currentYear}`);

        // 2. Récupérer tous les élèves affectés à une classe
        const students = await User.find({ role: 'ELEVE', classe: { $ne: null } }).populate('classe');
        console.log(`${students.length} élèves trouvés avec une classe.`);

        if (students.length === 0) {
            console.log('Aucun élève trouvé. Fin du script.');
            process.exit(0);
        }

        let totalNotesCreated = 0;

        for (const student of students) {
            const classe = student.classe;
            // Déterminer les périodes selon la filière
            const periodes = classe.filiere === 'Technique' ? ['Semestre 1'] : ['Trimestre 1'];

            // Récupérer les matières de la classe
            const classeMatieres = await ClasseMatiere.find({ classe: classe._id }).populate('matiere');

            for (const cm of classeMatieres) {
                if (!cm.matiere) continue;

                for (const periode of periodes) {
                    // Vérifier si une note existe déjà
                    const existingNote = await Note.findOne({
                        eleve: student._id,
                        matiere: cm.matiere._id,
                        periode,
                        anneeScolaire: currentYear
                    });

                    if (existingNote) {
                        // console.log(`Note déjà existante pour ${student.nom} en ${cm.matiere.nom} (${periode})`);
                        continue;
                    }

                    // Générer 2 notes aléatoires
                    const val1 = Math.floor(Math.random() * 11) + 8; // 8-18
                    const val2 = Math.floor(Math.random() * 11) + 9; // 9-19

                    const notesArray = [
                        { type: 'Devoir 1', valeur: val1, coefficient: 1, date: new Date() },
                        { type: 'Devoir 2', valeur: val2, coefficient: 2, date: new Date() }
                    ];

                    const newNote = new Note({
                        eleve: student._id,
                        matiere: cm.matiere._id,
                        classe: classe._id,
                        professeur: cm.professeur || student._id, // Fallback si pas de prof
                        periode,
                        anneeScolaire: currentYear,
                        notes: notesArray,
                        statut: 'VALIDEE',
                        validePar: student._id, // Auto-validé pour le test
                        dateValidation: new Date(),
                        appreciation: val1 + val2 > 25 ? 'Très bon travail' : 'Travail satisfaisant'
                    });

                    newNote.moyenne = newNote.calculerMoyenne();
                    await newNote.save();
                    totalNotesCreated++;
                }
            }
            process.stdout.write('.'); // Progrès
        }

        console.log(`\nSuccès ! ${totalNotesCreated} relevés de notes créés.`);
        process.exit(0);
    } catch (err) {
        console.error('ERREUR LORS DU SEEDING :');
        console.error(err);
        process.exit(1);
    }
};

run();
