const Note = require('../models/Note');
const User = require('../models/User');
const Matiere = require('../models/Matiere');
const Classe = require('../models/Classe');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const { generateMasterGradeSheetPDF } = require('../utils/pdfGenerator');
const Setting = require('../models/Setting');

// @desc    Créer des notes pour un élève
// @route   POST /api/v1/notes
// @access  Private (Professeur)
exports.createNotes = asyncHandler(async (req, res, next) => {
    const { eleve, matiere, classe, periode, notes, appreciation } = req.body;

    // Vérifier que l'utilisateur est professeur
    if (req.user.role !== 'PROFESSEUR') {
        return next(new ErrorResponse('Seuls les professeurs peuvent saisir des notes', 403));
    }

    // Vérifier que la matière existe
    const matiereDoc = await Matiere.findById(matiere);
    if (!matiereDoc) {
        return next(new ErrorResponse('Matière non trouvée', 404));
    }

    // Note: La vérification de l'affectation professeur-matière-classe 
    // est gérée par le modèle ClasseMatiere, pas par Matiere.professeur

    // Vérifier que l'élève existe et est bien un élève
    const eleveDoc = await User.findById(eleve);
    if (!eleveDoc || eleveDoc.role !== 'ELEVE') {
        return next(new ErrorResponse('Élève non trouvé', 404));
    }

    // Vérifier qu'il n'existe pas déjà une note pour cet élève/matière/période
    const existingNote = await Note.findOne({
        eleve,
        matiere,
        periode,
        anneeScolaire: req.body.anneeScolaire || '2025-2026'
    });

    if (existingNote) {
        return next(new ErrorResponse('Des notes existent déjà pour cet élève dans cette matière et période', 400));
    }

    // Créer la note
    const note = await Note.create({
        eleve,
        matiere,
        classe,
        professeur: req.user.id,
        periode,
        notes,
        appreciation,
        anneeScolaire: req.body.anneeScolaire || '2025-2026'
    });

    await note.populate(['eleve', 'matiere', 'classe', 'professeur']);

    res.status(201).json({
        success: true,
        data: note
    });
});

// @desc    Obtenir toutes les notes avec filtres
// @route   GET /api/v1/notes
// @access  Private
exports.getNotes = asyncHandler(async (req, res, next) => {
    const { classe, matiere, eleve, periode, statut, professeur } = req.query;

    let query = {};

    // Filtres
    if (classe) query.classe = classe;
    if (matiere) query.matiere = matiere;
    if (eleve) query.eleve = eleve;
    if (periode) query.periode = periode;
    if (statut) query.statut = statut;
    if (professeur) query.professeur = professeur;

    // Si professeur, ne voir que ses notes
    if (req.user.role === 'PROFESSEUR') {
        query.professeur = req.user.id;
    }

    const notes = await Note.find(query)
        .populate('eleve', 'nom prenom matricule')
        .populate('matiere', 'nom coefficient')
        .populate('classe', 'niveau section filiere')
        .populate('professeur', 'nom prenom')
        .populate('validePar', 'nom prenom')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: notes.length,
        data: notes
    });
});

// @desc    Obtenir une note par ID
// @route   GET /api/v1/notes/:id
// @access  Private
exports.getNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id)
        .populate('eleve', 'nom prenom matricule')
        .populate('matiere', 'nom coefficient')
        .populate('classe', 'niveau section filiere')
        .populate('professeur', 'nom prenom')
        .populate('validePar', 'nom prenom');

    if (!note) {
        return next(new ErrorResponse('Note non trouvée', 404));
    }

    res.status(200).json({
        success: true,
        data: note
    });
});

// @desc    Mettre à jour une note
// @route   PUT /api/v1/notes/:id
// @access  Private (Professeur)
exports.updateNote = asyncHandler(async (req, res, next) => {
    let note = await Note.findById(req.params.id);

    if (!note) {
        return next(new ErrorResponse('Note non trouvée', 404));
    }

    // Vérifier que c'est le professeur qui a créé la note
    if (note.professeur.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé à modifier cette note', 403));
    }

    // Ne pas permettre la modification si la note est validée
    if (note.statut === 'VALIDEE') {
        return next(new ErrorResponse('Impossible de modifier une note validée', 400));
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(['eleve', 'matiere', 'classe', 'professeur']);

    res.status(200).json({
        success: true,
        data: note
    });
});

// @desc    Supprimer une note
// @route   DELETE /api/v1/notes/:id
// @access  Private (Professeur/Admin)
exports.deleteNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        return next(new ErrorResponse('Note non trouvée', 404));
    }

    // Vérifier les permissions
    if (note.professeur.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé à supprimer cette note', 403));
    }

    // Ne pas permettre la suppression si validée
    if (note.statut === 'VALIDEE') {
        return next(new ErrorResponse('Impossible de supprimer une note validée', 400));
    }

    await note.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Valider une note (Censeur)
// @route   POST /api/v1/notes/:id/validate
// @access  Private (Censeur/Admin)
exports.validateNote = asyncHandler(async (req, res, next) => {
    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Seul le censeur peut valider les notes', 403));
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
        return next(new ErrorResponse('Note non trouvée', 404));
    }

    // Vérifier qu'il y a au moins une note
    if (!note.notes || note.notes.length === 0) {
        return next(new ErrorResponse('Aucune note à valider', 400));
    }

    // Calculer la moyenne
    note.moyenne = note.calculerMoyenne();
    note.statut = 'VALIDEE';
    note.validePar = req.user.id;
    note.dateValidation = Date.now();

    await note.save();
    await note.populate(['eleve', 'matiere', 'classe', 'professeur', 'validePar']);

    res.status(200).json({
        success: true,
        data: note
    });
});

// @desc    Rejeter une note (Censeur)
// @route   POST /api/v1/notes/:id/reject
// @access  Private (Censeur/Admin)
exports.rejectNote = asyncHandler(async (req, res, next) => {
    const { motif } = req.body;

    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Seul le censeur peut rejeter les notes', 403));
    }

    if (!motif) {
        return next(new ErrorResponse('Le motif de rejet est requis', 400));
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
        return next(new ErrorResponse('Note non trouvée', 404));
    }

    note.statut = 'REJETEE';
    note.motifRejet = motif;
    note.validePar = req.user.id;
    note.dateValidation = Date.now();

    await note.save();
    await note.populate(['eleve', 'matiere', 'classe', 'professeur', 'validePar']);

    res.status(200).json({
        success: true,
        data: note
    });
});

// @desc    Obtenir les notes en attente de validation
// @route   GET /api/v1/notes/pending
// @access  Private (Censeur/Admin)
exports.getPendingNotes = asyncHandler(async (req, res, next) => {
    // Vérifier le rôle
    if (req.user.role !== 'CENSEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Accès non autorisé', 403));
    }

    // Construire le filtre
    const filter = { statut: 'EN_ATTENTE' };

    // Ajouter les filtres optionnels
    if (req.query.classe) filter.classe = req.query.classe;
    if (req.query.matiere) filter.matiere = req.query.matiere;
    if (req.query.periode) filter.periode = req.query.periode;

    const notes = await Note.find(filter)
        .populate('eleve', 'nom prenom matricule')
        .populate('matiere', 'nom coefficient')
        .populate('classe', 'niveau section filiere')
        .populate('professeur', 'nom prenom')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: notes.length,
        data: notes
    });
});

// @desc    Soumettre des notes pour validation
// @route   POST /api/v1/notes/:id/submit
// @access  Private (Professeur)
exports.submitNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        return next(new ErrorResponse('Note non trouvée', 404));
    }

    // Vérifier que c'est le professeur qui a créé la note
    if (note.professeur.toString() !== req.user.id) {
        return next(new ErrorResponse('Non autorisé', 403));
    }

    // Vérifier qu'il y a au moins une note
    if (note.notes.length === 0) {
        return next(new ErrorResponse('Vous devez saisir au moins une note avant de soumettre', 400));
    }

    // Le statut reste EN_ATTENTE mais on peut ajouter un flag
    note.statut = 'EN_ATTENTE';
    await note.save();

    await note.populate(['eleve', 'matiere', 'classe', 'professeur']);

    res.status(200).json({
        success: true,
        message: 'Notes soumises pour validation',
        data: note
    });
});

// @desc    Débloquer des notes validées (Admin)
// @route   POST /api/v1/notes/unblock
// @access  Private (Admin)
exports.unblockNotes = asyncHandler(async (req, res, next) => {
    const { classe, matiere, periode } = req.body;

    // Vérifier le rôle
    if (req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Seul l\'administrateur peut débloquer les notes', 403));
    }

    if (!classe || !matiere || !periode) {
        return next(new ErrorResponse('Veuillez fournir la classe, la matière et la période', 400));
    }

    // Mettre à jour toutes les notes correspondantes de VALIDEE à EN_ATTENTE
    const result = await Note.updateMany(
        { classe, matiere, periode, statut: 'VALIDEE' },
        {
            $set: {
                statut: 'EN_ATTENTE',
                updatedAt: Date.now()
            }
        }
    );

    res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notes ont été débloquées avec succès`,
        count: result.modifiedCount
    });
});
// @desc    Obtenir le relevé de notes récapitulatif d'une classe (Master Sheet)
// @route   GET /api/v1/notes/master-sheet/:classeId
// @access  Private (Administration)
exports.getMasterSheetData = asyncHandler(async (req, res, next) => {
    const { periode, anneeScolaire } = req.query;
    const { classeId } = req.params;

    if (!periode) {
        return next(new ErrorResponse('La période est requise', 400));
    }

    const year = anneeScolaire || '2025-2026';

    // 1. Récupérer la classe
    const classe = await Classe.findById(classeId);
    if (!classe) {
        return next(new ErrorResponse('Classe non trouvée', 404));
    }

    // 2. Récupérer tous les élèves de la classe
    const eleves = await User.find({ classe: classeId, role: 'ELEVE' }).sort('nom prenom').select('nom prenom matricule');

    // 3. Récupérer toutes les matières de la classe via ClasseMatiere
    const ClasseMatiere = mongoose.model('ClasseMatiere');
    const matieresDocs = await ClasseMatiere.find({ classe: classeId }).populate('matiere');
    const matieres = matieresDocs.map(cm => cm.matiere).sort((a, b) => a.nom.localeCompare(b.nom));

    // 4. Récupérer toutes les notes VALIDÉES pour cette classe/période/année
    const allNotes = await Note.find({
        classe: classeId,
        periode,
        anneeScolaire: year,
        statut: 'VALIDEE'
    });

    // 5. Construire la matrice de données
    const matrix = eleves.map(eleve => {
        const studentGrades = {};
        let weightedSum = 0;
        let totalCoeffs = 0;
        let countMatieresWithGrades = 0;

        matieres.forEach(matiere => {
            const noteDoc = allNotes.find(n =>
                n.eleve.toString() === eleve._id.toString() &&
                n.matiere.toString() === matiere._id.toString()
            );

            const coeff = matiere.coefficient || 1;
            if (noteDoc) {
                studentGrades[matiere._id] = {
                    notes: noteDoc.notes.map(n => n.valeur),
                    moyenne: noteDoc.moyenne,
                    appreciation: noteDoc.appreciation,
                    coeff
                };
                weightedSum += noteDoc.moyenne * coeff;
                totalCoeffs += coeff;
                countMatieresWithGrades++;
            } else {
                studentGrades[matiere._id] = { notes: [], moyenne: null, coeff };
            }
        });

        return {
            eleveId: eleve._id,
            nom: eleve.nom,
            prenom: eleve.prenom,
            matricule: eleve.matricule,
            matieres: studentGrades,
            moyenneGenerale: totalCoeffs > 0 ? weightedSum / totalCoeffs : 0
        };
    });

    // 6. Calculer les statistiques globales de la classe
    const studentAverages = matrix.map(row => row.moyenneGenerale).filter(m => m > 0);
    const overallStats = {
        classAverage: studentAverages.length > 0 ? studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length : 0,
        maxAverage: studentAverages.length > 0 ? Math.max(...studentAverages) : 0,
        minAverage: studentAverages.length > 0 ? Math.min(...studentAverages) : 0
    };

    // 7. Calculer les statistiques par matière
    const subjectStats = {};
    matieres.forEach(matiere => {
        const moyennes = matrix.map(row => row.matieres[matiere._id].moyenne).filter(m => m !== null);
        if (moyennes.length > 0) {
            subjectStats[matiere._id] = {
                avg: moyennes.reduce((a, b) => a + b, 0) / moyennes.length,
                min: Math.min(...moyennes),
                max: Math.max(...moyennes),
                successRate: (moyennes.filter(m => m >= 10).length / moyennes.length) * 100
            };
        } else {
            subjectStats[matiere._id] = { avg: 0, min: 0, max: 0, successRate: 0 };
        }
    });

    res.status(200).json({
        success: true,
        data: {
            classe,
            periode,
            anneeScolaire: year,
            matieres,
            matrix,
            subjectStats,
            overallStats
        }
    });
});

// @desc    Générer le PDF du relevé de notes récapitulatif (Master Sheet)
// @route   GET /api/v1/notes/master-sheet/:classeId/pdf
// @access  Private (Administration)
exports.getMasterSheetPDF = asyncHandler(async (req, res, next) => {
    const { periode, anneeScolaire } = req.query;
    const { classeId } = req.params;

    if (!periode) {
        return next(new ErrorResponse('La période est requise', 400));
    }

    const year = anneeScolaire || '2025-2026';
    const schoolSetting = await Setting.findOne({ key: 'school_config' });
    const schoolConfig = schoolSetting ? schoolSetting.value : {};

    let classesToProcess = [];
    if (classeId === 'all') {
        classesToProcess = await Classe.find().sort('niveau section');
    } else {
        const classe = await Classe.findById(classeId);
        if (!classe) return next(new ErrorResponse('Classe non trouvée', 404));
        classesToProcess = [classe];
    }

    const allSheetsData = [];

    const ClasseMatiere = mongoose.model('ClasseMatiere');

    for (const classe of classesToProcess) {
        // Reproduce aggregation logic for each class
        const eleves = await User.find({ classe: classe._id, role: 'ELEVE' }).sort('nom prenom').select('nom prenom matricule');
        if (eleves.length === 0) continue;

        const matieresDocs = await ClasseMatiere.find({ classe: classe._id }).populate('matiere');
        const matieres = matieresDocs.map(cm => cm.matiere).sort((a, b) => a.nom.localeCompare(b.nom));

        const allNotes = await Note.find({
            classe: classe._id,
            periode,
            anneeScolaire: year,
            statut: 'VALIDEE'
        });

        const matrix = eleves.map(eleve => {
            const studentGrades = {};
            let weightedSum = 0;
            let totalCoeffs = 0;
            let countMatieresWithGrades = 0;

            matieres.forEach(matiere => {
                const noteDoc = allNotes.find(n =>
                    n.eleve.toString() === eleve._id.toString() &&
                    n.matiere.toString() === matiere._id.toString()
                );

                const coeff = matiere.coefficient || 1;
                if (noteDoc) {
                    studentGrades[matiere._id] = {
                        notes: noteDoc.notes.map(n => n.valeur),
                        moyenne: noteDoc.moyenne,
                        appreciation: noteDoc.appreciation,
                        coeff
                    };
                    weightedSum += noteDoc.moyenne * coeff;
                    totalCoeffs += coeff;
                    countMatieresWithGrades++;
                } else {
                    studentGrades[matiere._id] = { notes: [], moyenne: null, coeff };
                }
            });

            return {
                eleveId: eleve._id,
                nom: eleve.nom,
                prenom: eleve.prenom,
                matricule: eleve.matricule,
                matieres: studentGrades,
                moyenneGenerale: totalCoeffs > 0 ? weightedSum / totalCoeffs : 0
            };
        });

        const subjectStats = {};
        matieres.forEach(matiere => {
            const moyennes = matrix.map(row => row.matieres[matiere._id].moyenne).filter(m => m !== null);
            if (moyennes.length > 0) {
                subjectStats[matiere._id] = {
                    avg: moyennes.reduce((a, b) => a + b, 0) / moyennes.length,
                    min: Math.min(...moyennes),
                    max: Math.max(...moyennes),
                    successRate: (moyennes.filter(m => m >= 10).length / moyennes.length) * 100
                };
            } else {
                subjectStats[matiere._id] = { avg: 0, min: 0, max: 0, successRate: 0 };
            }
        });

        const studentAverages = matrix.map(row => row.moyenneGenerale).filter(m => m > 0);
        const overallStats = {
            classAverage: studentAverages.length > 0 ? studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length : 0,
            maxAverage: studentAverages.length > 0 ? Math.max(...studentAverages) : 0,
            minAverage: studentAverages.length > 0 ? Math.min(...studentAverages) : 0
        };

        allSheetsData.push({
            classe,
            periode,
            anneeScolaire: year,
            matieres,
            matrix,
            subjectStats,
            overallStats
        });
    }

    if (allSheetsData.length === 0) {
        return next(new ErrorResponse('Aucune donnée à exporter', 404));
    }

    // We need a loop in pdfGenerator to handle multiple sheets if possible,
    // or just generate multiple and merge.
    // For now, let's assume generateMasterGradeSheetPDF handles data as an ARRAY if we modify it,
    // or we call it multiple times.
    // Actually, it's easier to modify generateMasterGradeSheetPDF to accept an array of classes.

    const { generateBulkMasterGradeSheetPDF } = require('../utils/pdfGenerator');
    const pdfBuffer = await generateBulkMasterGradeSheetPDF(allSheetsData, schoolConfig);

    res.contentType("application/pdf");
    res.send(pdfBuffer);
});
