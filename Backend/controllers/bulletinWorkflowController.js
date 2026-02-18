const mongoose = require('mongoose');
const Evaluation = require('../models/Evaluation');
const Note = require('../models/Note');
const Bulletin = require('../models/Bulletin');
const User = require('../models/User');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const Notification = require('../models/Notification');

// Étape 1: Professeur crée une évaluation
exports.createEvaluation = async (req, res) => {
    try {
        const { titre, type, classe, matiere, date, heureDebut, heureFin, salle, description } = req.body;

        const evaluation = await Evaluation.create({
            titre,
            type,
            classe,
            matiere,
            professeur: req.user.id,
            date,
            heureDebut,
            heureFin,
            salle,
            description
        });

        res.status(201).json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Étape 2: Professeur soumet les notes pour validation
exports.submitNotesForValidation = async (req, res) => {
    try {
        const { evaluationId, notes } = req.body;

        // Vérifier que l'évaluation existe et appartient au professeur
        const evaluation = await Evaluation.findById(evaluationId);
        if (!evaluation || evaluation.professeur.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Évaluation non trouvée ou accès non autorisé'
            });
        }

        // Créer les notes pour chaque élève
        const createdNotes = [];
        for (const noteData of notes) {
            const note = await Note.create({
                eleve: noteData.eleveId,
                matiere: evaluation.matiere,
                classe: evaluation.classe,
                professeur: req.user.id,
                periode: noteData.periode,
                notes: [{
                    valeur: noteData.valeur,
                    type: evaluation.titre,
                    coefficient: noteData.coefficient || 1,
                    date: evaluation.date
                }],
                statut: 'EN_ATTENTE',
                anneeScolaire: '2023-2024'
            });
            createdNotes.push(note);
        }

        // Mettre à jour le statut de l'évaluation
        evaluation.statut = 'VALIDE';
        await evaluation.save();

        // Notifier le censeur
        await Notification.create({
            utilisateur: await getCenseurId(),
            type: 'validation_notes',
            titre: 'Notes à valider',
            message: `Nouvelles notes à valider pour ${evaluation.titre} en ${await getMatiereNom(evaluation.matiere)}`,
            date: new Date(),
            lue: false
        });

        res.status(201).json({
            success: true,
            data: createdNotes,
            message: 'Notes soumises pour validation'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Étape 3: Censeur valide/rejette les notes
exports.validateNotes = async (req, res) => {
    try {
        const { noteIds, action, motif } = req.body;

        for (const noteId of noteIds) {
            const note = await Note.findById(noteId);
            if (!note) continue;

            if (action === 'valider') {
                note.statut = 'VALIDEE';
                note.validePar = req.user.id;
                note.dateValidation = new Date();
                note.moyenne = note.calculerMoyenne();
            } else if (action === 'rejeter') {
                note.statut = 'REJETEE';
                note.motifRejet = motif;
            }

            await note.save();
        }

        // Vérifier si toutes les notes de la classe sont validées pour la période
        await checkAndGenerateBulletins(req.body.classeId, req.body.periode);

        res.status(200).json({
            success: true,
            message: `Notes ${action === 'valider' ? 'validées' : 'rejetées'} avec succès`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Étape 4: Vérifier et générer les bulletins si prêts
const checkAndGenerateBulletins = async (classeId, periode) => {
    try {
        // Récupérer tous les élèves de la classe
        const eleves = await User.find({
            role: 'ELEVE',
            classe: classeId,
            status: 'ACTIF'
        });

        // Vérifier que chaque élève a au moins 3 évaluations validées
        let bulletinReady = true;
        for (const eleve of eleves) {
            const notesValidees = await Note.countDocuments({
                eleve: eleve._id,
                periode: periode,
                statut: 'VALIDEE'
            });

            if (notesValidees < 3) {
                bulletinReady = false;
                break;
            }
        }

        if (bulletinReady) {
            // Générer les bulletins pour tous les élèves
            for (const eleve of eleves) {
                await generateBulletin(eleve._id, classeId, periode);
            }

            // Notifier le proviseur et l'admin
            const classe = await Classe.findById(classeId);
            await Notification.create([
                {
                    utilisateur: await getProviseurId(),
                    type: 'bulletins_prets',
                    titre: 'Bulletins prêts',
                    message: `Les bulletins de ${classe.niveau} ${classe.section} sont prêts pour validation`,
                    date: new Date(),
                    lue: false
                },
                {
                    utilisateur: await getAdminId(),
                    type: 'bulletins_prets',
                    titre: 'Bulletins prêts',
                    message: `Les bulletins de ${classe.niveau} ${classe.section} sont prêts pour validation`,
                    date: new Date(),
                    lue: false
                }
            ]);
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des bulletins:', error);
    }
};

// Générer un bulletin pour un élève
const generateBulletin = async (eleveId, classeId, periode) => {
    try {
        const User = require('../models/User');
        const Note = require('../models/Note');
        const Bulletin = require('../models/Bulletin');
        const Matiere = require('../models/Matiere');
        const Attendance = require('../models/Attendance');

        const eleve = await User.findById(eleveId).populate('classe');
        if (!eleve) return;

        const allValidNotes = await Note.find({
            eleve: eleveId,
            periode: periode,
            statut: 'VALIDEE',
            anneeScolaire: eleve.classe.anneeScolaire || '2023-2024'
        }).populate('matiere');

        const bulletinsNotes = [];
        let totalPoints = 0;
        let totalCoeffs = 0;

        for (const noteDoc of allValidNotes) {
            const notes = noteDoc.notes || [];
            if (notes.length === 0) continue;

            const sum = notes.reduce((acc, n) => acc + n.valeur, 0);
            const count = notes.length;
            const avg = sum / count;
            const coeff = noteDoc.matiere.coefficient || 1;
            const weighted = avg * coeff;

            totalPoints += weighted;
            totalCoeffs += coeff;

            // Appreciation based on weighted note
            let appreciation = '';
            if (avg >= 16) appreciation = 'Excellent';
            else if (avg >= 14) appreciation = 'Très Bien';
            else if (avg >= 12) appreciation = 'Bien';
            else if (avg >= 10) appreciation = 'Assez Bien';
            else if (avg >= 8) appreciation = 'Passable';
            else if (avg >= 5) appreciation = 'Insuffisant';
            else if (avg >= 3) appreciation = 'Faible';
            else appreciation = 'Très Faible';

            bulletinsNotes.push({
                matiere: noteDoc.matiere._id,
                professeur: noteDoc.professeur,
                int: notes[0] ? notes[0].valeur : undefined,
                dev: notes[1] ? notes[1].valeur : undefined,
                compo: notes[2] ? notes[2].valeur : undefined,
                moyenneMatiere: avg,
                notePonderee: weighted,
                appreciation: appreciation,
                categorie: noteDoc.matiere.categorie
            });
        }

        const avgGen = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;

        // Absences
        const absencesJust = await Attendance.countDocuments({
            eleve: eleveId,
            statut: 'absent',
            observations: { $regex: /justifié/i }
        });
        const absencesNonJust = await Attendance.countDocuments({
            eleve: eleveId,
            statut: 'absent',
            observations: { $not: /justifié/i }
        });

        const bulletin = await Bulletin.findOneAndUpdate(
            { eleve: eleveId, periode: periode, anneeScolaire: eleve.classe.anneeScolaire || '2023-2024' },
            {
                eleve: eleveId,
                classe: classeId,
                periode: periode,
                notes: bulletinsNotes,
                totalPoints: totalPoints,
                totalCoefficients: totalCoeffs,
                moyenneGenerale: avgGen,
                absencesJustifiees: absencesJust,
                absencesNonJustifiees: absencesNonJust,
                statut: 'FINALISE',
                updatedAt: Date.now()
            },
            { upsert: true, new: true }
        );

        // Class Stats & Ranking
        const allBulletins = await Bulletin.find({
            classe: classeId,
            periode: periode,
            anneeScolaire: eleve.classe.anneeScolaire || '2023-2024'
        }).sort({ moyenneGenerale: -1 });

        const scores = allBulletins.map(b => b.moyenneGenerale);
        const best = Math.max(...scores);
        const worst = Math.min(...scores);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const effectif = scores.length;

        for (let i = 0; i < allBulletins.length; i++) {
            const b = allBulletins[i];
            const rang = (i + 1) + (i > 0 && allBulletins[i].moyenneGenerale === allBulletins[i - 1].moyenneGenerale ? ' ex' : (i === 0 ? 'er' : 'e'));

            await Bulletin.findByIdAndUpdate(b._id, {
                rang: rang,
                meilleureMoyenneClasse: best,
                pireMoyenneClasse: worst,
                moyenneClasse: mean,
                effectif: effectif
            });
        }

        return bulletin;
    } catch (error) {
        console.error('Erreur lors de la génération du bulletin:', error);
        throw error;
    }
};

// Étape 5: Proviseur/Admin valide les bulletins
exports.validateBulletins = async (req, res) => {
    try {
        const { bulletinIds, action } = req.body;

        for (const bulletinId of bulletinIds) {
            const bulletin = await Bulletin.findById(bulletinId);
            if (!bulletin) continue;

            if (req.user.role === 'PROVISEUR') {
                bulletin.signatureProviseur = action === 'valider';
            } else if (req.user.role === 'ADMIN') {
                bulletin.signatureCenseur = action === 'valider';
            }

            await bulletin.save();
        }

        // Vérifier si tous les bulletins de la classe sont signés
        const bulletin = await Bulletin.findById(bulletinIds[0]);
        const allSigned = await checkAllBulletinsSigned(bulletin.classe, bulletin.periode);

        if (allSigned) {
            // Notifier la secrétaire
            await Notification.create({
                utilisateur: await getSecretaireId(),
                type: 'bulletins_signes',
                titre: 'Bulletins signés',
                message: `Les bulletins sont prêts pour distribution`,
                date: new Date(),
                lue: false
            });

            // Notifier les parents et élèves
            await notifyParentsAndStudents(bulletin.classe, bulletin.periode);
        }

        res.status(200).json({
            success: true,
            message: `Bulletins ${action === 'valider' ? 'validés' : 'rejetés'} avec succès`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Étape 6: Secrétaire distribue les bulletins
exports.distributeBulletins = async (req, res) => {
    try {
        const { bulletinIds } = req.body;

        for (const bulletinId of bulletinIds) {
            await Bulletin.findByIdAndUpdate(bulletinId, {
                statut: 'DISTRIBUE',
                dateDistribution: new Date()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bulletins distribués avec succès'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Fonctions utilitaires
const getCenseurId = async () => {
    const censeur = await User.findOne({ role: 'CENSEUR' });
    return censeur ? censeur._id : null;
};

const getProviseurId = async () => {
    const proviseur = await User.findOne({ role: 'PROVISEUR' });
    return proviseur ? proviseur._id : null;
};

const getAdminId = async () => {
    const admin = await User.findOne({ role: 'ADMIN' });
    return admin ? admin._id : null;
};

const getSecretaireId = async () => {
    const secretaire = await User.findOne({ role: 'SECRETAIRE' });
    return secretaire ? secretaire._id : null;
};

const getMatiereNom = async (matiereId) => {
    const matiere = await Matiere.findById(matiereId);
    return matiere ? matiere.nom : 'Matière inconnue';
};

const checkAllBulletinsSigned = async (classeId, periode) => {
    const bulletins = await Bulletin.find({
        classe: classeId,
        periode: periode,
        statut: 'FINALISE'
    });

    return bulletins.every(b => b.signatureCenseur && b.signatureProviseur);
};

const notifyParentsAndStudents = async (classeId, periode) => {
    try {
        // Récupérer tous les élèves de la classe
        const eleves = await User.find({
            role: 'ELEVE',
            classe: classeId,
            status: 'ACTIF'
        });

        // Récupérer tous les parents
        const parents = await User.find({ role: 'PARENT', status: 'ACTIF' });

        for (const eleve of eleves) {
            await Notification.create({
                utilisateur: eleve._id,
                type: 'bulletin_disponible',
                titre: 'Bulletin disponible',
                message: `Votre bulletin du ${periode} est disponible`,
                date: new Date(),
                lue: false
            });
        }

        for (const parent of parents) {
            await Notification.create({
                utilisateur: parent._id,
                type: 'bulletin_disponible',
                titre: 'Bulletin disponible',
                message: `Le bulletin de votre enfant du ${periode} est disponible`,
                date: new Date(),
                lue: false
            });
        }
    } catch (error) {
        console.error('Erreur lors de la notification des parents et élèves:', error);
    }
};

// Obtenir les bulletins d'une classe
exports.getBulletinsByClass = async (req, res) => {
    try {
        const { classeId, periode } = req.params;

        const bulletins = await Bulletin.find({
            classe: classeId,
            periode: periode,
            anneeScolaire: '2023-2024'
        })
            .populate('eleve', 'nom prenom matricule')
            .populate('classe', 'niveau section')
            .populate('genereePar', 'nom prenom')
            .sort({ 'moyenneGenerale': -1 });

        res.status(200).json({
            success: true,
            data: bulletins
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Obtenir le bulletin d'un élève
exports.getBulletinByStudent = async (req, res) => {
    try {
        const { eleveId, periode } = req.params;

        const bulletin = await Bulletin.findOne({
            eleve: eleveId,
            periode: periode,
            anneeScolaire: '2023-2024'
        })
            .populate('eleve', 'nom prenom matricule dateNaissance')
            .populate('classe', 'niveau section filiere')
            .populate('notes')
            .populate({
                path: 'notes',
                populate: {
                    path: 'matiere',
                    select: 'nom coefficient'
                }
            });

        if (!bulletin) {
            return res.status(404).json({
                success: false,
                error: 'Bulletin non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: bulletin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
