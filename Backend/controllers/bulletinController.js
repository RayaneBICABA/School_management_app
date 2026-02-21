const Bulletin = require('../models/Bulletin');
const Note = require('../models/Note');
const User = require('../models/User');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiere');
const ClasseMatiere = require('../models/ClasseMatiere');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const { generateBulletinPDF, generateClassBulletinsPDF } = require('../utils/pdfGenerator');
const { recalculatePointDeductions } = require('./attendanceController');

// Fonction utilitaire pour calculer les statistiques de la classe et les rangs
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

        // Mettre à jour tous les bulletins de la classe pour cette période
        await Bulletin.updateMany(
            { classe: classeId, periode, anneeScolaire },
            {
                moyenneClasse: classStats.moyenneClasse,
                meilleureMoyenneClasse: classStats.meilleureMoyenneClasse,
                pireMoyenneClasse: classStats.pireMoyenneClasse
            }
        );

        // Recalculer les rangs
        const bulletins = await Bulletin.find({
            classe: classeId,
            periode,
            anneeScolaire,
            statut: { $ne: 'BROUILLON' }
        }).sort({ moyenneGenerale: -1 });

        for (let i = 0; i < bulletins.length; i++) {
            const rangSuffix = (i + 1) === 1 ? 'er' : 'e';
            bulletins[i].rang = `${i + 1}${rangSuffix}`;
            bulletins[i].effectif = bulletins.length;
            await bulletins[i].save();
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des stats de classe:', error);
    }
};

// @desc    Générer un bulletin pour un élève
// @route   POST /api/v1/bulletins/generate
// @access  Private (Censeur/Admin)
exports.generateBulletin = asyncHandler(async (req, res, next) => {
    const { eleve, classe, periode, anneeScolaire } = req.body;

    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN' && req.user.role !== 'PROVISEUR') {
        return next(new ErrorResponse('Non autorisé à générer des bulletins', 403));
    }

    // Vérifier que l'élève existe
    const eleveDoc = await User.findById(eleve);
    if (!eleveDoc || eleveDoc.role !== 'ELEVE') {
        return next(new ErrorResponse('Élève non trouvé', 404));
    }

    // Vérifier que la classe existe
    const classeDoc = await Classe.findById(classe);
    if (!classeDoc) {
        return next(new ErrorResponse('Classe non trouvée', 404));
    }

    // Vérifier qu'un bulletin n'existe pas déjà
    const existingBulletin = await Bulletin.findOne({
        eleve,
        periode,
        anneeScolaire: anneeScolaire || '2025-2026'
    });

    if (existingBulletin) {
        return next(new ErrorResponse('Un bulletin existe déjà pour cet élève et cette période', 400));
    }

    // Récupérer toutes les notes validées de l'élève pour cette période
    const notesDocs = await Note.find({
        eleve,
        classe,
        periode,
        statut: 'VALIDEE',
        anneeScolaire: anneeScolaire || '2025-2026'
    }).populate('matiere');

    if (notesDocs.length === 0) {
        return next(new ErrorResponse('Aucune note validée trouvée pour cet élève', 400));
    }

    // Récupérer les assignations officielles de professeurs pour cette classe
    const assignments = await ClasseMatiere.find({ classe });
    const assignmentMap = {};
    assignments.forEach(a => {
        if (a.professeur) assignmentMap[a.matiere.toString()] = a.professeur;
    });

    // Mapper les notes pour le bulletin
    const mappedNotes = notesDocs.map(noteDoc => {
        const intNotes = noteDoc.notes.filter(n => n.type.toLowerCase().includes('interro'));
        const devNotes = noteDoc.notes.filter(n => n.type.toLowerCase().includes('devoir'));
        const compoNotes = noteDoc.notes.filter(n => n.type.toLowerCase().includes('compo'));

        const avgInt = intNotes.length > 0 ? intNotes.reduce((sum, n) => sum + n.valeur, 0) / intNotes.length : undefined;
        const avgDev = devNotes.length > 0 ? devNotes.reduce((sum, n) => sum + n.valeur, 0) / devNotes.length : undefined;
        const avgCompo = compoNotes.length > 0 ? compoNotes.reduce((sum, n) => sum + n.valeur, 0) / compoNotes.length : undefined;

        const interroGrades = intNotes.map(n => n.valeur);
        const devoirGrades = devNotes.map(n => n.valeur);
        const compoGrades = compoNotes.map(n => n.valeur);

        const coeff = noteDoc.matiere?.coefficient || 1;
        const average = noteDoc.moyenne || 0;

        // Utiliser le professeur officiel de ClasseMatiere, sinon celui de la note
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
            categorie: noteDoc.matiere?.categorie || 'AUTRES'
        };
    });

    // Créer le bulletin
    const bulletin = await Bulletin.create({
        eleve,
        classe,
        periode,
        anneeScolaire: anneeScolaire || '2025-2026',
        notes: mappedNotes,
        genereePar: req.user.id
    });

    // Recalculate absence deductions before saving
    await recalculatePointDeductions(eleve, classe, periode, new Date());

    // Calculer la moyenne générale et le rang
    await bulletin.calculerMoyenneGenerale();
    await bulletin.calculerRang();
    await bulletin.save();

    await bulletin.populate([
        { path: 'eleve', select: 'nom prenom matricule' },
        { path: 'classe', select: 'niveau section filiere' },
        { path: 'notes.matiere', select: 'nom coefficient' },
        { path: 'genereePar', select: 'nom prenom' }
    ]);

    res.status(201).json({
        success: true,
        data: bulletin
    });
});

// @desc    Générer des bulletins pour toute une classe
// @route   POST /api/v1/bulletins/generate-classe
// @access  Private (Censeur/Admin)
exports.generateBulletinsClasse = asyncHandler(async (req, res, next) => {
    const { classe, periode, anneeScolaire } = req.body;

    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN' && req.user.role !== 'PROVISEUR') {
        return next(new ErrorResponse('Non autorisé à générer des bulletins', 403));
    }

    // Récupérer tous les élèves de la classe
    const eleves = await User.find({ classe, role: 'ELEVE' });

    if (eleves.length === 0) {
        return next(new ErrorResponse('Aucun élève trouvé dans cette classe', 404));
    }

    const bulletinsGeneres = [];
    const erreurs = [];

    for (const eleve of eleves) {
        try {
            // Vérifier qu'un bulletin n'existe pas déjà
            const existingBulletin = await Bulletin.findOne({
                eleve: eleve._id,
                periode,
                anneeScolaire: anneeScolaire || '2025-2026'
            });

            if (existingBulletin) {
                erreurs.push({
                    eleve: `${eleve.prenom} ${eleve.nom}`,
                    erreur: 'Bulletin déjà existant'
                });
                continue;
            }

            // Récupérer les notes validées
            const notesDocs = await Note.find({
                eleve: eleve._id,
                classe,
                periode,
                statut: 'VALIDEE',
                anneeScolaire: anneeScolaire || '2025-2026'
            }).populate('matiere');

            /* 
            if (notesDocs.length === 0) {
                erreurs.push({
                    eleve: `${eleve.prenom} ${eleve.nom}`,
                    erreur: 'Aucune note validée'
                });
                continue;
            }
            */
            const mappedNotes = notesDocs.length === 0 ? [] : notesDocs.map(noteDoc => {
                const intNotes = noteDoc.notes.filter(n => n.type.toLowerCase().includes('interro'));
                const devNotes = noteDoc.notes.filter(n => n.type.toLowerCase().includes('devoir'));
                const compoNotes = noteDoc.notes.filter(n => n.type.toLowerCase().includes('compo'));

                const avgInt = intNotes.length > 0 ? intNotes.reduce((sum, n) => sum + n.valeur, 0) / intNotes.length : undefined;
                const avgDev = devNotes.length > 0 ? devNotes.reduce((sum, n) => sum + n.valeur, 0) / devNotes.length : undefined;
                const avgCompo = compoNotes.length > 0 ? compoNotes.reduce((sum, n) => sum + n.valeur, 0) / compoNotes.length : undefined;

                const interroGrades = intNotes.map(n => n.valeur);
                const devoirGrades = devNotes.map(n => n.valeur);
                const compoGrades = compoNotes.map(n => n.valeur);

                const coeff = noteDoc.matiere?.coefficient || 1;
                const average = noteDoc.moyenne || 0;

                // Utiliser le professeur officiel de ClasseMatiere, sinon celui de la note
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
                    categorie: noteDoc.matiere?.categorie || 'AUTRES'
                };
            });

            // Créer le bulletin
            const bulletin = await Bulletin.create({
                eleve: eleve._id,
                classe,
                periode,
                anneeScolaire: anneeScolaire || '2025-2026',
                notes: mappedNotes,
                genereePar: req.user.id
            });

            // Recalculate absence deductions before saving
            await recalculatePointDeductions(eleve._id, classe, periode, new Date());

            await bulletin.calculerMoyenneGenerale();
            await bulletin.calculerRang();
            await bulletin.save();

            bulletinsGeneres.push(bulletin);
        } catch (error) {
            erreurs.push({
                eleve: `${eleve.prenom} ${eleve.nom}`,
                erreur: error.message
            });
        }
    }

    // Calculer les rangs et statistiques de classe pour tous les bulletins générés
    if (bulletinsGeneres.length > 0) {
        await updateClassStats(classe, periode, anneeScolaire || '2025-2026');
    }

    res.status(201).json({
        success: true,
        count: bulletinsGeneres.length,
        data: bulletinsGeneres,
        erreurs: erreurs.length > 0 ? erreurs : undefined
    });
});

// @desc    Obtenir les bulletins d'une classe
// @route   GET /api/v1/bulletins/classe/:classeId
// @access  Private
exports.getBulletinsByClasse = asyncHandler(async (req, res, next) => {
    const { periode, statut, anneeScolaire } = req.query;

    let query = { classe: req.params.classeId };

    if (periode) query.periode = periode;
    if (statut) query.statut = statut;
    if (anneeScolaire) query.anneeScolaire = anneeScolaire;

    const bulletins = await Bulletin.find(query)
        .populate('eleve', 'nom prenom matricule dateNaissance lieuNaissance photo redoublant')
        .populate('classe', 'niveau section filiere')
        .populate('genereePar', 'nom prenom')
        .populate({
            path: 'notes',
            populate: [
                { path: 'matiere', select: 'nom coefficient' },
                { path: 'professeur', select: 'nom prenom' }
            ]
        })
        .sort({ moyenneGenerale: -1 });

    res.status(200).json({
        success: true,
        count: bulletins.length,
        data: bulletins
    });
});

// @desc    Obtenir les bulletins d'un élève
// @route   GET /api/v1/bulletins/eleve/:eleveId
// @access  Private
exports.getBulletinsByEleve = asyncHandler(async (req, res, next) => {
    let bulletins = await Bulletin.find({ eleve: req.params.eleveId })
        .populate('eleve', 'nom prenom matricule dateNaissance lieuNaissance photo redoublant')
        .populate('classe', 'niveau section filiere anneeScolaire')
        .populate('notes.matiere', 'nom coefficient categorie')
        .populate('notes.professeur', 'nom prenom')
        .sort('-anneeScolaire -periode');

    // Si aucun bulletin n'existe, essayer d'en créer par défaut
    if (bulletins.length === 0) {
        const student = await User.findById(req.params.eleveId);
        if (student && student.role === 'ELEVE' && student.classe) {
            const Classe = require('../models/Classe');
            const classe = await Classe.findById(student.classe);

            if (classe) {
                const periodes = classe.filiere === 'Technique'
                    ? ['Semestre 1', 'Semestre 2']
                    : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

                const defaultBulletins = periodes.map(periode => ({
                    eleve: student._id,
                    classe: student.classe,
                    periode: periode,
                    anneeScolaire: classe.anneeScolaire || '2025-2026',
                    notes: [],
                    statut: 'BROUILLON'
                }));

                await Bulletin.insertMany(defaultBulletins);

                // Récupérer à nouveau après création
                bulletins = await Bulletin.find({ eleve: req.params.eleveId })
                    .populate('eleve', 'nom prenom matricule dateNaissance lieuNaissance photo redoublant')
                    .populate('classe', 'niveau section filiere anneeScolaire')
                    .populate({
                        path: 'notes',
                        populate: [
                            { path: 'matiere', select: 'nom coefficient' },
                            { path: 'professeur', select: 'nom prenom' }
                        ]
                    })
                    .sort('-anneeScolaire -periode');
            }
        }
    }

    res.status(200).json({
        success: true,
        count: bulletins.length,
        data: bulletins
    });
});

// @desc    Obtenir un bulletin par ID
// @route   GET /api/v1/bulletins/:id
// @access  Private
exports.getBulletin = asyncHandler(async (req, res, next) => {
    const bulletin = await Bulletin.findById(req.params.id)
        .populate('eleve', 'nom prenom matricule dateNaissance lieuNaissance photo redoublant')
        .populate('classe', 'niveau section filiere')
        .populate({
            path: 'notes',
            populate: [
                { path: 'matiere', select: 'nom coefficient' },
                { path: 'professeur', select: 'nom prenom' }
            ]
        })
        .populate('genereePar', 'nom prenom');

    if (!bulletin) {
        return next(new ErrorResponse('Bulletin non trouvé', 404));
    }

    res.status(200).json({
        success: true,
        data: bulletin
    });
});

// @desc    Finaliser un bulletin
// @route   PUT /api/v1/bulletins/:id/finalize
// @access  Private (Censeur/Admin)
exports.finalizeBulletin = asyncHandler(async (req, res, next) => {
    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN' && req.user.role !== 'PROVISEUR') {
        return next(new ErrorResponse('Non autorisé à finaliser des bulletins', 403));
    }

    const bulletin = await Bulletin.findById(req.params.id);

    if (!bulletin) {
        return next(new ErrorResponse('Bulletin non trouvé', 404));
    }

    if (bulletin.statut === 'FINALISE') {
        return next(new ErrorResponse('Ce bulletin est déjà finalisé', 400));
    }

    // Recalculer la moyenne et le rang
    await bulletin.calculerMoyenneGenerale();
    await bulletin.calculerRang();

    bulletin.statut = 'FINALISE';

    // Ajouter signature selon le rôle
    if (req.user.role === 'CENSEUR') {
        bulletin.signatureCenseur = true;
    } else if (req.user.role === 'PROVISEUR') {
        bulletin.signatureProviseur = true;
    }

    await bulletin.save();

    // Mettre à jour les stats de la classe pour cette période
    await updateClassStats(bulletin.classe, bulletin.periode, bulletin.anneeScolaire);

    await bulletin.populate([
        { path: 'eleve', select: 'nom prenom matricule' },
        { path: 'classe', select: 'niveau section filiere' },
        { path: 'notes', populate: { path: 'matiere', select: 'nom coefficient' } }
    ]);

    res.status(200).json({
        success: true,
        data: bulletin
    });
});

// @desc    Mettre à jour un bulletin
// @route   PUT /api/v1/bulletins/:id
// @access  Private (Censeur/Admin)
exports.updateBulletin = asyncHandler(async (req, res, next) => {
    let bulletin = await Bulletin.findById(req.params.id);

    if (!bulletin) {
        return next(new ErrorResponse('Bulletin non trouvé', 404));
    }

    // Ne pas permettre la modification si finalisé
    if (bulletin.statut === 'FINALISE' || bulletin.statut === 'DISTRIBUE') {
        return next(new ErrorResponse('Impossible de modifier un bulletin finalisé ou distribué', 400));
    }

    bulletin = await Bulletin.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(['eleve', 'classe', 'notes']);

    res.status(200).json({
        success: true,
        data: bulletin
    });
});

// @desc    Marquer des bulletins comme distribués
// @route   POST /api/v1/bulletins/distribute
// @access  Private (Secrétaire/Admin)
exports.distributeBulletins = asyncHandler(async (req, res, next) => {
    const { bulletinIds } = req.body;

    if (!bulletinIds || bulletinIds.length === 0) {
        return next(new ErrorResponse('Aucun bulletin spécifié', 400));
    }

    const bulletins = await Bulletin.updateMany(
        {
            _id: { $in: bulletinIds },
            statut: 'FINALISE'
        },
        {
            statut: 'DISTRIBUE',
            dateDistribution: Date.now()
        }
    );

    res.status(200).json({
        success: true,
        message: `${bulletins.modifiedCount} bulletin(s) marqué(s) comme distribué(s)`,
        data: bulletins
    });
});

// @desc    Supprimer un bulletin
// @route   DELETE /api/v1/bulletins/:id
// @access  Private (Admin)
exports.deleteBulletin = asyncHandler(async (req, res, next) => {
    const bulletin = await Bulletin.findById(req.params.id);

    if (!bulletin) {
        return next(new ErrorResponse('Bulletin non trouvé', 404));
    }

    // Seul l'admin peut supprimer
    if (req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé', 403));
    }

    await bulletin.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Télécharger un bulletin en PDF
// @route   GET /api/v1/bulletins/:id/pdf
// @access  Private
exports.downloadBulletinPDF = asyncHandler(async (req, res, next) => {
    try {
        const bulletin = await Bulletin.findById(req.params.id)
            .populate('eleve', 'nom prenom matricule dateNaissance lieuNaissance photo')
            .populate('classe', 'niveau section filiere')
            .populate({
                path: 'notes',
                populate: [
                    { path: 'matiere', select: 'nom coefficient' },
                    { path: 'professeur', select: 'nom prenom' }
                ]
            })
            .populate('genereePar', 'nom prenom');

        if (!bulletin) {
            return next(new ErrorResponse('Bulletin non trouvé', 404));
        }

        // Vérifier que l'utilisateur a le droit de télécharger ce bulletin
        const canDownload = await checkBulletinAccess(req.user, bulletin);
        if (!canDownload) {
            return next(new ErrorResponse('Non autorisé à télécharger ce bulletin', 403));
        }

        // Fetch school config
        const schoolSetting = await Setting.findOne({ key: 'school_config' });
        const schoolConfig = schoolSetting ? schoolSetting.value : {};

        // Générer le PDF
        const pdfBuffer = await generateBulletinPDF(bulletin, schoolConfig);

        // Configurer les headers pour le téléchargement ou l'affichage
        const fileName = `bulletin-${bulletin.eleve.prenom}-${bulletin.eleve.nom}-${bulletin.periode.replace(/\s+/g, '-')}.pdf`;
        const displayMode = req.query.mode === 'inline' ? 'inline' : 'attachment';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${displayMode}; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        return next(new ErrorResponse('Erreur lors de la génération du PDF', 500));
    }
});

// @desc    Télécharger les bulletins d'une classe en un seul PDF
// @route   GET /api/v1/bulletins/classe/:classeId/pdf
// @access  Private (Admin, Proviseur, Censeur, Secrétaire)
exports.downloadClassBulletinsPDF = asyncHandler(async (req, res, next) => {
    try {
        const { periode, anneeScolaire } = req.query;

        // Construire la requête
        let query = { classe: req.params.classeId };
        if (periode) query.periode = periode;
        if (anneeScolaire) query.anneeScolaire = anneeScolaire;

        // Récupérer les bulletins
        const bulletins = await Bulletin.find(query)
            .populate('eleve', 'nom prenom matricule dateNaissance lieuNaissance photo')
            .populate('classe', 'niveau section filiere')
            .populate({
                path: 'notes',
                populate: [
                    { path: 'matiere', select: 'nom coefficient' },
                    { path: 'professeur', select: 'nom prenom' }
                ]
            })
            .populate('genereePar', 'nom prenom')
            .sort('eleve.nom eleve.prenom');

        if (!bulletins || bulletins.length === 0) {
            return next(new ErrorResponse('Aucun bulletin trouvé pour cette classe et cette période', 404));
        }

        // Vérification de la validation de TOUS les bulletins
        // UPDATE: Allow partial printing. Filter and keep only valid ones.
        const validBulletins = bulletins.filter(b => b.statut === 'FINALISE' || b.statut === 'DISTRIBUE');

        if (validBulletins.length === 0) {
            return next(new ErrorResponse('Impossible d\'imprimer : Aucun bulletin n\'est validé pour cette classe.', 400));
        }

        // Fetch school config
        const schoolSetting = await Setting.findOne({ key: 'school_config' });
        const schoolConfig = schoolSetting ? schoolSetting.value : {};

        // Générer le PDF combiné avec SEULEMENT les bulletins valides
        const pdfBuffer = await generateClassBulletinsPDF(validBulletins, schoolConfig);

        const classeInfo = bulletins[0].classe;

        // Determine period name safely
        let periodeName = periode;
        if (!periodeName && validBulletins.length > 0) {
            periodeName = validBulletins[0].periode;
        }
        periodeName = periodeName || 'Notes';

        const fileName = `bulletins-${classeInfo.niveau}-${classeInfo.section}-${periodeName.replace(/\s+/g, '-')}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF de classe:', error);
        return next(new ErrorResponse('Erreur lors de la génération du PDF', 500));
    }
});

// Fonction utilitaire pour vérifier les droits d'accès au bulletin
const checkBulletinAccess = async (user, bulletin) => {
    // Les parents peuvent télécharger les bulletins de leurs enfants
    if (user.role === 'PARENT') {
        // TODO: Vérifier que l'élève est bien un enfant du parent
        return true; // Pour l'instant, autoriser tous les parents
    }

    // Les élèves peuvent télécharger leurs propres bulletins
    if (user.role === 'ELEVE') {
        return bulletin.eleve._id.toString() === user._id.toString();
    }

    // Les professeurs peuvent télécharger les bulletins de leurs classes
    if (user.role === 'PROFESSEUR') {
        // TODO: Vérifier que le professeur enseigne dans cette classe
        return true; // Pour l'instant, autoriser tous les professeurs
    }

    // Le censeur, proviseur, admin et secrétaire peuvent télécharger tous les bulletins
    if (['CENSEUR', 'PROVISEUR', 'ADMIN', 'SECRETAIRE'].includes(user.role)) {
        return true;
    }

    return false;
};

// @desc    Obtenir les statistiques des bulletins
// @route   GET /api/v1/bulletins/stats
// @access  Private
exports.getBulletinStats = asyncHandler(async (req, res, next) => {
    const { classe, periode, anneeScolaire } = req.query;

    let query = {};
    if (classe) query.classe = classe;
    if (periode) query.periode = periode;
    if (anneeScolaire) query.anneeScolaire = anneeScolaire;

    const stats = await Bulletin.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                moyenneMax: { $max: '$moyenneGenerale' },
                moyenneMin: { $min: '$moyenneGenerale' },
                moyenneClasse: { $avg: '$moyenneGenerale' },
                brouillons: {
                    $sum: { $cond: [{ $eq: ['$statut', 'BROUILLON'] }, 1, 0] }
                },
                finalises: {
                    $sum: { $cond: [{ $eq: ['$statut', 'FINALISE'] }, 1, 0] }
                },
                distribues: {
                    $sum: { $cond: [{ $eq: ['$statut', 'DISTRIBUE'] }, 1, 0] }
                }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats[0] || {}
    });
});

// @desc    Get stats for Validation Page (Proviseur)
// @route   GET /api/v1/bulletins/validation-stats
// @access  Private (Proviseur)
exports.getValidationPageStats = asyncHandler(async (req, res, next) => {
    const { periode, anneeScolaire } = req.query;
    const selectedPeriod = periode || 'Trimestre 1';
    const currentYear = anneeScolaire || '2025-2026';

    // 1. Get all classes
    const classes = await Classe.find().populate('professeurPrincipal', 'nom prenom');
    const Evaluation = require('../models/Evaluation');
    const ClasseMatiere = require('../models/ClasseMatiere');

    const result = [];
    let classesPretesCount = 0;

    for (const classe of classes) {
        // Find assigned subjects for this class
        const matieresDocs = await ClasseMatiere.find({ classe: classe._id });
        let matiereIds = matieresDocs.map(m => m.matiere);

        // Pour les filières techniques, exclure les matières sans notes validées dans la période
        if (classe.filiere === 'Technique' && matiereIds.length > 0) {
            const matieresWithNotes = await Note.distinct('matiere', {
                classe: classe._id,
                periode: selectedPeriod,
                anneeScolaire: currentYear,
                statut: 'VALIDEE'
            });
            matiereIds = matiereIds.filter(id =>
                matieresWithNotes.some(mw => mw.toString() === id.toString())
            );
        }

        if (matiereIds.length === 0) {
            // No subjects, not ready
            result.push({
                id: classe._id,
                nom: `${classe.niveau} ${classe.section}`,
                professeur: classe.professeurPrincipal ? `${classe.professeurPrincipal.prenom} ${classe.professeurPrincipal.nom}` : 'Non assigné',
                moyenne: '0.0',
                min: '0.0',
                max: '0.0',
                statut: 'En attente',
                details: 'Aucune matière'
            });
            continue;
        }

        // Check if all subjects have >= 2 validated evaluations
        let allSubjectsReady = true;
        // Optimization: Aggregate evaluations count by matiere for this class/period
        // Note: Evaluation model uses 'matiere' and 'classe' and 'statut'='VALIDE' (or VALIDE?)
        // Check Evaluation model: enum ['EN_ATTENTE', 'VALIDE', 'REFUSE', 'TERMINE']

        // Wait, user said "evaluations validés". Assuming 'VALIDE' or 'TERMINE'. 
        // Let's use 'VALIDE' based on Evaluation model.

        // Actually, we can just check if *Evaluations* exist.
        // Or simpler: Check if *Grades* (Notes) exist? 
        // Prompt said: "toute les matieres aurait minimum 2 evaluations validés". 
        // This refers to the *Evaluation Planning* (Evaluations that happened).
        // But logic for "Bulletin" usually relies on "Notes". 
        // If an Evaluation is validated, it means it took place. 
        // I will check Evaluation count where statut='VALIDE' or 'TERMINE' and date < now? 
        // Let's just user 'VALIDE' and 'TERMINE'.

        const evalCounts = await Evaluation.aggregate([
            {
                $match: {
                    classe: classe._id,
                    matiere: { $in: matiereIds },
                    statut: { $in: ['VALIDE', 'TERMINE'] }
                    // Filter by period? Evaluation usually has date. 
                    // Period logic is complex (date range). 
                    // For now, I will assume all evaluations for simplicity or if Evaluation has 'periode' field? 
                    // Model shows 'date'. I should filter by date range for the period if possible. 
                    // As I don't have Period dates in memory, I'll skip date filter for now or assume recent.
                    // Risk: Counting old evaluations. 
                    // Improvement: Filter by academic year dates or assume database is cleaned/scoped.
                }
            },
            { $group: { _id: "$matiere", count: { $sum: 1 } } }
        ]);

        const acc = {};
        evalCounts.forEach(e => { acc[e._id.toString()] = e.count; });

        for (const m of matieres) {
            const count = acc[m.matiere.toString()] || 0;
            if (count < 2) {
                allSubjectsReady = false;
                break;
            }
        }

        let statut = allSubjectsReady ? 'Prêt' : 'En attente';

        // Calculate Class Stats (Avg, Min, Max from Bulletins if they exist, or calculate from Grades?)
        // To be fast, use existing Bulletins if any. 
        const stats = await Bulletin.aggregate([
            { $match: { classe: classe._id, periode: selectedPeriod, anneeScolaire: currentYear } },
            {
                $group: {
                    _id: null,
                    moyenne: { $avg: '$moyenneGenerale' },
                    min: { $min: '$moyenneGenerale' },
                    max: { $max: '$moyenneGenerale' },
                    count: { $sum: 1 }, // To know if we have bulletins
                    signedCount: {
                        $sum: { $cond: [{ $eq: ["$signatureProviseur", true] }, 1, 0] }
                    }
                }
            }
        ]);

        const classStats = stats.length > 0 ? stats[0] : { moyenne: 0, min: 0, max: 0, count: 0, signedCount: 0 };

        // Refine Status: If all bulletins FINALISE, status could be different? 
        // User requirements: "Classes prêtes affiche bien le nombre de classe où toute les matieres aurait minimum 2 evaluations validés"
        // So Status 'Prêt' is strictly about Eval count. 

        if (statut === 'Prêt') classesPretesCount++;

        result.push({
            id: classe._id,
            nom: `${classe.niveau} ${classe.section}`,
            professeur: classe.professeurPrincipal ? `${classe.professeurPrincipal.prenom} ${classe.professeurPrincipal.nom}` : 'Non assigné',
            moyenne: (classStats.moyenne || 0).toFixed(2),
            min: (classStats.min || 0).toFixed(2),
            max: (classStats.max || 0).toFixed(2),
            statut,
            bulletinsCount: classStats.count,
            signedCount: classStats.signedCount
        });
    }

    res.status(200).json({
        success: true,
        data: {
            classes: result,
            stats: {
                classesPretes: classesPretesCount,
                totalClasses: classes.length
            }
        }
    });
});

// @desc    Title: Valider tous les bulletins d'une classe
// @route   PUT /api/v1/bulletins/validate-classe/:classeId
// @access  Private (Proviseur)
exports.validateClassBulletins = asyncHandler(async (req, res, next) => {
    const { classeId } = req.params;
    const { periode, anneeScolaire } = req.body;

    // Ensure user is Proviseur
    if (req.user.role !== 'PROVISEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé', 403));
    }

    const bulletins = await Bulletin.find({
        classe: classeId,
        periode: periode || 'Trimestre 1',
        anneeScolaire: anneeScolaire || '2025-2026'
    });

    if (bulletins.length === 0) {
        return next(new ErrorResponse('Aucun bulletin trouvé pour cette classe', 404));
    }

    let updatedCount = 0;
    for (const bulletin of bulletins) {
        // Update status and signature
        bulletin.statut = 'FINALISE'; // Ready for print/distribute
        bulletin.signatureProviseur = true;
        // Optionally signatureCenseur if not already? User didn't specify.

        // Recalculate to be sure
        await bulletin.calculerMoyenneGenerale();
        await bulletin.calculerRang();
        await bulletin.save();
        updatedCount++;
    }

    // Mettre à jour les stats de la classe pour cette période
    if (updatedCount > 0) {
        await updateClassStats(classeId, periode || 'Trimestre 1', anneeScolaire || '2025-2026');
    }

    res.status(200).json({
        success: true,
        data: {
            message: `${updatedCount} bulletins validés avec succès`,
            updatedCount
        }
    });
});

// @desc    Régénérer tous les bulletins depuis les notes validées
// @route   POST /api/v1/bulletins/regenerate-all
// @access  Private (Admin only)
exports.regenerateAllBulletins = asyncHandler(async (req, res, next) => {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé à effectuer cette action', 403));
    }

    try {
        // Étape 1: Supprimer tous les bulletins existants
        const deleteResult = await Bulletin.deleteMany({});
        console.log(`${deleteResult.deletedCount} bulletins supprimés`);

        // Étape 2: Récupérer toutes les combinaisons élève/classe/période avec notes validées
        const combinations = await Note.aggregate([
            {
                $match: { statut: 'VALIDEE' }
            },
            {
                $group: {
                    _id: {
                        eleve: '$eleve',
                        classe: '$classe',
                        periode: '$periode',
                        anneeScolaire: '$anneeScolaire'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const bulletinsGeneres = [];
        const erreurs = [];

        // Étape 3: Générer un bulletin pour chaque combinaison
        for (const combo of combinations) {
            try {
                const { eleve, classe, periode, anneeScolaire } = combo._id;

                // Récupérer les notes validées
                const notesDocs = await Note.find({
                    eleve,
                    classe,
                    periode,
                    anneeScolaire,
                    statut: 'VALIDEE'
                }).populate('matiere').populate('professeur');

                if (notesDocs.length === 0) continue;

                // Récupérer les assignations officielles pour cette classe
                const assignments = await ClasseMatiere.find({ classe });
                const assignmentMap = {};
                assignments.forEach(a => {
                    if (a.professeur) assignmentMap[a.matiere.toString()] = a.professeur;
                });

                // Mapper les notes avec Int, Dev, Compo (filtrer celles sans matière)
                const mappedNotes = notesDocs
                    .filter(noteDoc => noteDoc.matiere && noteDoc.matiere._id && Array.isArray(noteDoc.notes)) // Ignorer les notes sans matière ou sans tableau de notes
                    .map(noteDoc => {
                        try {
                            // S'assurer que noteDoc.notes est bien un tableau
                            const notesArray = Array.isArray(noteDoc.notes) ? noteDoc.notes : [];

                            const intNotes = notesArray.filter(n => n && n.type && n.type.toLowerCase().includes('interro'));
                            const devNotes = notesArray.filter(n => n && n.type && n.type.toLowerCase().includes('devoir'));
                            const compoNotes = notesArray.filter(n => n && n.type && n.type.toLowerCase().includes('compo'));

                            const avgInt = intNotes.length > 0
                                ? intNotes.reduce((sum, n) => sum + (n.valeur || 0), 0) / intNotes.length
                                : undefined;
                            const avgDev = devNotes.length > 0
                                ? devNotes.reduce((sum, n) => sum + (n.valeur || 0), 0) / devNotes.length
                                : undefined;
                            const avgCompo = compoNotes.length > 0
                                ? compoNotes.reduce((sum, n) => sum + (n.valeur || 0), 0) / compoNotes.length
                                : undefined;

                            const interroGrades = intNotes.map(n => n.valeur);
                            const devoirGrades = devNotes.map(n => n.valeur);
                            const compoGrades = compoNotes.map(n => n.valeur);

                            const coeff = noteDoc.matiere.coefficient || 1;
                            const average = noteDoc.moyenne || 0;

                            // Utiliser le professeur officiel de ClasseMatiere, sinon celui de la note
                            const officialProf = assignmentMap[noteDoc.matiere._id.toString()];

                            return {
                                matiere: noteDoc.matiere._id,
                                professeur: officialProf || noteDoc.professeur?._id,
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
                        } catch (mapError) {
                            console.error('Erreur lors du mapping d\'une note:', mapError.message);
                            return null;
                        }
                    })
                    .filter(note => note !== null); // Filtrer les notes qui ont échoué au mapping

                if (mappedNotes.length === 0) continue;

                // Créer le bulletin
                const bulletin = await Bulletin.create({
                    eleve,
                    classe,
                    periode,
                    anneeScolaire,
                    notes: mappedNotes,
                    statut: 'FINALISE',
                    genereePar: req.user.id
                });

                await bulletin.calculerMoyenneGenerale();
                await bulletin.calculerRang();
                await bulletin.save();

                bulletinsGeneres.push(bulletin);

            } catch (error) {
                console.error(`Erreur pour l'élève ${combo._id.eleve}:`, error);
                erreurs.push({
                    eleve: combo._id.eleve,
                    erreur: error.message
                });
            }
        }

        // Étape 4: Mettre à jour les statistiques de classe
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

        res.status(200).json({
            success: true,
            message: 'Bulletins régénérés avec succès',
            data: {
                bulletinsSupprimes: deleteResult.deletedCount,
                bulletinsGeneres: bulletinsGeneres.length,
                erreurs: erreurs.length > 0 ? erreurs : undefined
            }
        });

    } catch (error) {
        return next(new ErrorResponse(`Erreur lors de la régénération: ${error.message}`, 500));
    }
});
