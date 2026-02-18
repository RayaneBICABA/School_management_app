const mongoose = require('mongoose');
const Bulletin = require('../models/Bulletin');
const Note = require('../models/Note');
const User = require('../models/User');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const ClasseMatiere = require('../models/ClasseMatiere');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Helper function to update class stats (copied from controller to keep script standalone)
const updateClassStats = async (classeId, periode, anneeScolaire) => {
    try {
        const stats = await Bulletin.aggregate([
            {
                $match: {
                    classe: new mongoose.Types.ObjectId(classeId),
                    periode,
                    anneeScolaire,
                    statut: { $ne: 'BROUILLON' }
                }
            },
            {
                $group: {
                    _id: null,
                    moyenneClasse: { $avg: '$moyenneGenerale' },
                    meilleureMoyenneClasse: { $max: '$moyenneGenerale' },
                    pireMoyenneClasse: { $min: '$moyenneGenerale' }
                }
            }
        ]);

        const classStats = stats.length > 0 ? stats[0] : {
            moyenneClasse: 0,
            meilleureMoyenneClasse: 0,
            pireMoyenneClasse: 0
        };

        await Bulletin.updateMany(
            { classe: classeId, periode, anneeScolaire },
            {
                moyenneClasse: classStats.moyenneClasse,
                meilleureMoyenneClasse: classStats.meilleureMoyenneClasse,
                pireMoyenneClasse: classStats.pireMoyenneClasse
            }
        );

        // Recalculate ranks
        const bulletins = await Bulletin.find({ classe: classeId, periode, anneeScolaire, statut: { $ne: 'BROUILLON' } })
            .sort({ moyenneGenerale: -1 });

        for (let i = 0; i < bulletins.length; i++) {
            bulletins[i].rang = i + 1;
            await bulletins[i].save();
        }
    } catch (error) {
        console.error('Erreur updateClassStats:', error);
    }
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion-scolaire');
        console.log('Connected to MongoDB');

        // 1. Delete all existing bulletins
        const deleteResult = await Bulletin.deleteMany({});
        console.log(`${deleteResult.deletedCount} bulletins deleted.`);

        // 2. Get all student/class/period combinations with validated notes
        const combinations = await Note.aggregate([
            { $match: { statut: 'VALIDEE' } },
            {
                $group: {
                    _id: {
                        eleve: '$eleve',
                        classe: '$classe',
                        periode: '$periode',
                        anneeScolaire: '$anneeScolaire'
                    }
                }
            }
        ]);

        console.log(`Found ${combinations.length} combinations to process.`);

        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (!adminUser) {
            console.error('No ADMIN user found to attribute generation to.');
            process.exit(1);
        }

        for (let i = 0; i < combinations.length; i++) {
            const { eleve, classe, periode, anneeScolaire } = combinations[i]._id;
            process.stdout.write(`Processing ${i + 1}/${combinations.length}...\r`);

            const notesDocs = await Note.find({
                eleve,
                classe,
                periode,
                anneeScolaire,
                statut: 'VALIDEE'
            }).populate('matiere');

            // Get official assignments
            const assignments = await ClasseMatiere.find({ classe });
            const assignmentMap = {};
            assignments.forEach(a => {
                if (a.professeur) assignmentMap[a.matiere.toString()] = a.professeur;
            });

            const mappedNotes = notesDocs
                .filter(noteDoc => noteDoc.matiere && noteDoc.matiere._id && Array.isArray(noteDoc.notes))
                .map(noteDoc => {
                    const notesArray = noteDoc.notes;
                    const intNotes = notesArray.filter(n => n && n.type && n.type.toLowerCase().includes('interro'));
                    const devNotes = notesArray.filter(n => n && n.type && n.type.toLowerCase().includes('devoir'));
                    const compoNotes = notesArray.filter(n => n && n.type && n.type.toLowerCase().includes('compo'));

                    const avgInt = intNotes.length > 0 ? intNotes.reduce((sum, n) => sum + (n.valeur || 0), 0) / intNotes.length : undefined;
                    const avgDev = devNotes.length > 0 ? devNotes.reduce((sum, n) => sum + (n.valeur || 0), 0) / devNotes.length : undefined;
                    const avgCompo = compoNotes.length > 0 ? compoNotes.reduce((sum, n) => sum + (n.valeur || 0), 0) / compoNotes.length : undefined;

                    const interroGrades = intNotes.map(n => n.valeur);
                    const devoirGrades = devNotes.map(n => n.valeur);
                    const compoGrades = compoNotes.map(n => n.valeur);

                    const coeff = noteDoc.matiere.coefficient || 1;
                    const average = noteDoc.moyenne || 0;
                    const officialProf = assignmentMap[noteDoc.matiere._id.toString()];

                    return {
                        matiere: noteDoc.matiere._id,
                        professeur: officialProf || noteDoc.professeur,
                        int: avgInt,
                        dev: avgDev,
                        compo: avgCompo,
                        interroGrades,
                        devoirGrades,
                        compoGrades,
                        moyenneMatiere: average,
                        coeff: coeff,
                        notePonderee: average * coeff,
                        appreciation: noteDoc.appreciation,
                        categorie: noteDoc.matiere.categorie || 'AUTRES'
                    };
                });

            if (mappedNotes.length > 0) {
                const bulletin = await Bulletin.create({
                    eleve,
                    classe,
                    periode,
                    anneeScolaire,
                    notes: mappedNotes,
                    statut: 'FINALISE',
                    signatureProviseur: true,
                    genereePar: adminUser._id
                });
                await bulletin.calculerMoyenneGenerale();
                await bulletin.save();
            }
        }

        console.log('\nRecalculating class stats and ranks...');
        const classCombinations = await Bulletin.aggregate([
            {
                $group: {
                    _id: {
                        classe: '$classe',
                        periode: '$periode',
                        anneeScolaire: '$anneeScolaire'
                    }
                }
            }
        ]);

        for (const combo of classCombinations) {
            const { classe, periode, anneeScolaire } = combo._id;
            await updateClassStats(classe, periode, anneeScolaire);
        }

        console.log('All bulletins regenerated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error during regeneration:', error);
        process.exit(1);
    }
};

run();
