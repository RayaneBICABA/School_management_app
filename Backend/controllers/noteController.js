const Note = require('../models/Note');
const Dispensation = require('../models/Dispensation');
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

    const isAdmin = req.user.role === 'ADMIN';
    if (req.user.role !== 'PROFESSEUR' && !isAdmin) {
        return next(new ErrorResponse('Seuls les professeurs et administrateurs peuvent saisir des notes', 403));
    }

    let professeurId = req.user.id;
    if (isAdmin) {
        if (req.body.professeurId) {
            const profDoc = await User.findById(req.body.professeurId);
            if (!profDoc || profDoc.role !== 'PROFESSEUR') {
                return next(new ErrorResponse('Professeur non trouvé', 404));
            }
            professeurId = req.body.professeurId;
        } else if (classe && matiere) {
            const ClasseMatiere = require('../models/ClasseMatiere');
            const affectation = await ClasseMatiere.findOne({ classe, matiere }).select('professeur');
            if (affectation && affectation.professeur) {
                professeurId = affectation.professeur;
            }
        }
    }

    const matiereDoc = await Matiere.findById(matiere);
    if (!matiereDoc) return next(new ErrorResponse('Matière non trouvée', 404));

    const eleveDoc = await User.findById(eleve);
    if (!eleveDoc || eleveDoc.role !== 'ELEVE') return next(new ErrorResponse('Élève non trouvé', 404));

    const academicSetting = await Setting.findOne({ key: 'academic_year_config' });
    const currentYear = academicSetting ? (academicSetting.value.year || academicSetting.value.academicYear) : '2023-2024';

    const existingNote = await Note.findOne({
        eleve,
        matiere,
        periode,
        anneeScolaire: req.body.anneeScolaire || currentYear
    });

    if (existingNote) {
        return next(new ErrorResponse('Des notes existent déjà pour cet élève dans cette matière et période', 400));
    }

    let moyenne = undefined;
    if (isAdmin && notes && notes.length > 0) {
        let totalPoints = 0;
        let totalCoef = 0;
        notes.forEach(n => {
            const coef = n.coefficient || 1;
            totalPoints += n.valeur * coef;
            totalCoef += coef;
        });
        moyenne = totalCoef > 0 ? totalPoints / totalCoef : 0;
    }

    const noteData = {
        eleve,
        matiere,
        classe,
        professeur: professeurId,
        periode,
        notes,
        appreciation,
        anneeScolaire: req.body.anneeScolaire || currentYear
    };

    if (isAdmin) {
        noteData.statut = 'VALIDEE';
        noteData.validePar = req.user.id;
        noteData.dateValidation = Date.now();
        noteData.saisieParAdmin = true;
        noteData.moyenne = moyenne;
    }

    const note = await Note.create(noteData);
    await note.populate(['eleve', 'matiere', 'classe', 'professeur']);

    res.status(201).json({ success: true, data: note });
});

// @desc    Obtenir toutes les notes avec filtres
// @route   GET /api/v1/notes
// @access  Private
exports.getNotes = asyncHandler(async (req, res, next) => {
    const { classe, matiere, eleve, periode, statut, professeur } = req.query;
    let query = {};
    if (classe) query.classe = classe;
    if (matiere) query.matiere = matiere;
    if (eleve) query.eleve = eleve;
    if (periode) query.periode = periode;
    if (statut) query.statut = statut;
    if (professeur) query.professeur = professeur;
    if (req.user.role === 'PROFESSEUR') query.professeur = req.user.id;

    const notes = await Note.find(query)
        .populate('eleve', 'nom prenom matricule')
        .populate('matiere', 'nom coefficient')
        .populate('classe', 'niveau section filiere')
        .populate('professeur', 'nom prenom')
        .populate('validePar', 'nom prenom')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: notes.length, data: notes });
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

    if (!note) return next(new ErrorResponse('Note non trouvée', 404));
    res.status(200).json({ success: true, data: note });
});

// @desc    Mettre à jour une note
// @route   PUT /api/v1/notes/:id
// @access  Private (Professeur)
exports.updateNote = asyncHandler(async (req, res, next) => {
    let note = await Note.findById(req.params.id);
    if (!note) return next(new ErrorResponse('Note non trouvée', 404));

    if (note.professeur.toString() !== req.user.id && !['ADMIN', 'PROVISEUR', 'CENSEUR'].includes(req.user.role)) {
        return next(new ErrorResponse('Non autorisé à modifier cette note', 403));
    }

    if ((note.statut === 'VALIDEE' || note.statut === 'EN_ATTENTE') && req.user.role !== 'ADMIN') {
        const msg = note.statut === 'VALIDEE' ? 'Impossible de modifier une note déjà validée' : 'Impossible de modifier une note déjà soumise pour validation';
        return next(new ErrorResponse(msg, 400));
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(['eleve', 'matiere', 'classe', 'professeur']);

    res.status(200).json({ success: true, data: note });
});

// @desc    Supprimer une note
// @route   DELETE /api/v1/notes/:id
// @access  Private (Professeur/Admin)
exports.deleteNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id);
    if (!note) return next(new ErrorResponse('Note non trouvée', 404));

    if (note.professeur.toString() !== req.user.id && !['ADMIN', 'PROVISEUR', 'CENSEUR'].includes(req.user.role)) {
        return next(new ErrorResponse('Non autorisé à supprimer cette note', 403));
    }

    if ((note.statut === 'VALIDEE' || note.statut === 'EN_ATTENTE') && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Impossible de supprimer une note verrouillée', 400));
    }

    await note.deleteOne();
    res.status(200).json({ success: true, data: {} });
});

// @desc    Valider une note (Censeur)
// @route   POST /api/v1/notes/:id/validate
// @access  Private (Censeur/Admin)
exports.validateNote = asyncHandler(async (req, res, next) => {
    if (!['CENSEUR', 'ADMIN', 'PROVISEUR'].includes(req.user.role)) {
        return next(new ErrorResponse('Seul le censeur ou le proviseur peut valider les notes', 403));
    }

    const note = await Note.findById(req.params.id);
    if (!note) return next(new ErrorResponse('Note non trouvée', 404));
    if (!note.notes || note.notes.length === 0) return next(new ErrorResponse('Aucune note à valider', 400));

    note.moyenne = note.calculerMoyenne();
    note.statut = 'VALIDEE';
    note.validePar = req.user.id;
    note.dateValidation = Date.now();

    await note.save();
    await note.populate(['eleve', 'matiere', 'classe', 'professeur', 'validePar']);

    res.status(200).json({ success: true, data: note });
});

// @desc    Rejeter une note (Censeur)
// @route   POST /api/v1/notes/:id/reject
// @access  Private (Censeur/Admin)
exports.rejectNote = asyncHandler(async (req, res, next) => {
    const { motifRejet } = req.body;
    if (!['CENSEUR', 'ADMIN', 'PROVISEUR'].includes(req.user.role)) {
        return next(new ErrorResponse('Seul le censeur ou le proviseur peut rejeter les notes', 403));
    }
    if (!motifRejet) return next(new ErrorResponse('Le motif de rejet est requis', 400));

    const note = await Note.findById(req.params.id);
    if (!note) return next(new ErrorResponse('Note non trouvée', 404));

    note.statut = 'REJETEE';
    note.motifRejet = motifRejet;
    note.validePar = req.user.id;
    note.dateValidation = Date.now();

    await note.save();
    await note.populate(['eleve', 'matiere', 'classe', 'professeur', 'validePar']);

    res.status(200).json({ success: true, data: note });
});

// @desc    Obtenir les notes en attente de validation
// @route   GET /api/v1/notes/pending
// @access  Private (Censeur/Admin)
exports.getPendingNotes = asyncHandler(async (req, res, next) => {
    if (!['CENSEUR', 'ADMIN', 'PROVISEUR'].includes(req.user.role)) {
        return next(new ErrorResponse('Accès non autorisé', 403));
    }
    const filter = { statut: 'EN_ATTENTE' };
    if (req.query.classe) filter.classe = req.query.classe;
    if (req.query.matiere) filter.matiere = req.query.matiere;
    if (req.query.periode) filter.periode = req.query.periode;

    const notes = await Note.find(filter)
        .populate('eleve', 'nom prenom matricule')
        .populate('matiere', 'nom coefficient')
        .populate('classe', 'niveau section filiere')
        .populate('professeur', 'nom prenom')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: notes.length, data: notes });
});

// @desc    Soumettre des notes pour validation
// @route   POST /api/v1/notes/:id/submit
// @access  Private (Professeur)
exports.submitNote = asyncHandler(async (req, res, next) => {
    const note = await Note.findById(req.params.id);
    if (!note) return next(new ErrorResponse('Note non trouvée', 404));

    const canSubmit = note.professeur.toString() === req.user.id || ['ADMIN', 'CENSEUR', 'PROVISEUR'].includes(req.user.role);
    if (!canSubmit) return next(new ErrorResponse('Non autorisé à soumettre cette note', 403));
    if (note.notes.length === 0) return next(new ErrorResponse('Vous devez saisir au moins une note avant de soumettre', 400));

    note.statut = 'EN_ATTENTE';
    await note.save();
    await note.populate(['eleve', 'matiere', 'classe', 'professeur']);

    res.status(200).json({ success: true, message: 'Notes soumises pour validation', data: note });
});

// @desc    Soumettre toutes les notes d'une classe/matière en masse
exports.submitNotesBulk = asyncHandler(async (req, res, next) => {
    const { classe, matiere, periode } = req.body;
    if (!classe || !matiere || !periode) return next(new ErrorResponse('Veuillez fournir la classe, la matière et la période', 400));

    let filter = { classe, matiere, periode, statut: { $in: ['BROUILLON', 'REJETEE'] } };
    if (req.user.role === 'PROFESSEUR') filter.professeur = req.user.id;

    const result = await Note.updateMany(filter, { $set: { statut: 'EN_ATTENTE', updatedAt: Date.now() } });
    res.status(200).json({ success: true, message: `${result.modifiedCount} notes soumises pour validation`, count: result.modifiedCount });
});

// @desc    Valider des notes par lot
exports.validateNotesBulk = asyncHandler(async (req, res, next) => {
    const { classe, matiere, periode } = req.body;
    if (!classe || !matiere || !periode) return next(new ErrorResponse('Veuillez fournir la classe, la matière et la période', 400));

    const result = await Note.updateMany({ classe, matiere, periode, statut: 'EN_ATTENTE' }, { $set: { statut: 'VALIDEE', validePar: req.user.id, dateValidation: Date.now(), updatedAt: Date.now() } });
    res.status(200).json({ success: true, message: `${result.modifiedCount} notes validées avec succès`, count: result.modifiedCount });
});

// @desc    Rejeter des notes par lot
exports.rejectNotesBulk = asyncHandler(async (req, res, next) => {
    const { classe, matiere, periode, motifRejet } = req.body;
    if (!classe || !matiere || !periode || !motifRejet) return next(new ErrorResponse('Veuillez fournir la classe, la matière, la période et le motif de rejet', 400));

    const result = await Note.updateMany({ classe, matiere, periode, statut: 'EN_ATTENTE' }, { $set: { statut: 'REJETEE', motifRejet, updatedAt: Date.now() } });
    res.status(200).json({ success: true, message: `${result.modifiedCount} notes rejetées`, count: result.modifiedCount });
});

// @desc    Débloquer des notes validées (Admin)
exports.unblockNotes = asyncHandler(async (req, res, next) => {
    const { classe, matiere, periode } = req.body;
    if (!['ADMIN', 'CENSEUR', 'PROVISEUR'].includes(req.user.role)) return next(new ErrorResponse('Non autorisé', 403));
    if (!classe || !matiere || !periode) return next(new ErrorResponse('Veuillez fournir la classe, la matière et la période', 400));

    const result = await Note.updateMany({ classe, matiere, periode, statut: 'VALIDEE' }, { $set: { statut: 'BROUILLON', updatedAt: Date.now() } });
    res.status(200).json({ success: true, message: `${result.modifiedCount} notes ont été débloquées avec succès`, count: result.modifiedCount });
});

// @desc    Obtenir le relevé de notes récapitulatif d'une classe (Master Sheet)
exports.getMasterSheetData = asyncHandler(async (req, res, next) => {
    const { periode, anneeScolaire } = req.query;
    const { classeId } = req.params;
    if (!periode) return next(new ErrorResponse('La période est requise', 400));

    let year = anneeScolaire;
    if (!year) {
        const academicSetting = await Setting.findOne({ key: 'academic_year_config' });
        year = academicSetting ? (academicSetting.value.year || academicSetting.value.academicYear) : '2023-2024';
    }

    const classe = await Classe.findById(classeId);
    if (!classe) return next(new ErrorResponse('Classe non trouvée', 404));

    const eleves = await User.find({ classe: classeId, role: 'ELEVE' }).sort('nom prenom').select('nom prenom matricule');
    const ClasseMatiere = mongoose.model('ClasseMatiere');
    const matieresDocs = await ClasseMatiere.find({ classe: classeId }).populate('matiere');
    let matieres = matieresDocs.map(cm => cm.matiere).sort((a, b) => a.nom.localeCompare(b.nom));

    if (classe.filiere === 'Technique') {
        const matieresWithNotes = await Note.distinct('matiere', { classe: classeId, periode, anneeScolaire: year, statut: 'VALIDEE' });
        matieres = matieres.filter(m => matieresWithNotes.some(mw => mw.toString() === m._id.toString()));
    }

    const allNotes = await Note.find({ classe: classeId, periode, anneeScolaire: year, statut: 'VALIDEE' });
    const allDispensations = await Dispensation.find({ eleve: { $in: eleves.map(e => e._id) }, anneeScolaire: year });

    const matrix = eleves.map(eleve => {
        const studentGrades = {};
        let weightedSum = 0;
        let totalCoeffs = 0;

        matieres.forEach(matiere => {
            const isDispensed = allDispensations.some(d => d.eleve.toString() === eleve._id.toString() && d.matiere.toString() === matiere._id.toString());
            const noteDoc = allNotes.find(n => n.eleve.toString() === eleve._id.toString() && n.matiere.toString() === matiere._id.toString());
            const coeff = matiere.coefficient || 1;

            if (isDispensed) {
                studentGrades[matiere._id] = { notes: [], moyenne: null, coeff, isDispensed: true };
            } else if (noteDoc) {
                studentGrades[matiere._id] = { notes: noteDoc.notes.map(n => n.valeur), moyenne: noteDoc.moyenne, appreciation: noteDoc.appreciation, coeff, isDispensed: false };
                weightedSum += noteDoc.moyenne * coeff;
                totalCoeffs += coeff;
            } else {
                studentGrades[matiere._id] = { notes: [], moyenne: null, coeff, isDispensed: false };
            }
        });

        return { eleveId: eleve._id, nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule, matieres: studentGrades, moyenneGenerale: totalCoeffs > 0 ? weightedSum / totalCoeffs : 0 };
    });

    const studentAverages = matrix.map(row => row.moyenneGenerale).filter(m => m > 0);
    const overallStats = {
        classAverage: studentAverages.length > 0 ? studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length : 0,
        maxAverage: studentAverages.length > 0 ? Math.max(...studentAverages) : 0,
        minAverage: studentAverages.length > 0 ? Math.min(...studentAverages) : 0
    };

    const subjectStats = {};
    matieres.forEach(matiere => {
        const moyennes = matrix.map(row => row.matieres[matiere._id].moyenne).filter(m => m !== null);
        if (moyennes.length > 0) {
            subjectStats[matiere._id] = { avg: moyennes.reduce((a, b) => a + b, 0) / moyennes.length, min: Math.min(...moyennes), max: Math.max(...moyennes), successRate: (moyennes.filter(m => m >= 10).length / moyennes.length) * 100 };
        } else {
            subjectStats[matiere._id] = { avg: 0, min: 0, max: 0, successRate: 0 };
        }
    });

    res.status(200).json({ success: true, data: { classe, periode, anneeScolaire: year, matieres, matrix, subjectStats, overallStats } });
});

// @desc    Générer le PDF du relevé de notes récapitulatif (Master Sheet)
exports.getMasterSheetPDF = asyncHandler(async (req, res, next) => {
    const { periode, anneeScolaire } = req.query;
    const { classeId } = req.params;
    if (!periode) return next(new ErrorResponse('La période est requise', 400));

    let year = anneeScolaire;
    if (!year) {
        const academicSetting = await Setting.findOne({ key: 'academic_year_config' });
        year = academicSetting ? (academicSetting.value.year || academicSetting.value.academicYear) : '2025-2026';
    }
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
        const eleves = await User.find({ classe: classe._id, role: 'ELEVE' }).sort('nom prenom').select('nom prenom matricule');
        if (eleves.length === 0) continue;

        const matieresDocs = await ClasseMatiere.find({ classe: classe._id }).populate('matiere');
        let matieres = matieresDocs.map(cm => cm.matiere).sort((a, b) => a.nom.localeCompare(b.nom));

        if (classe.filiere === 'Technique') {
            const matieresWithNotes = await Note.distinct('matiere', { classe: classe._id, periode, anneeScolaire: year, statut: 'VALIDEE' });
            matieres = matieres.filter(m => matieresWithNotes.some(mw => mw.toString() === m._id.toString()));
        }

        const allNotes = await Note.find({ classe: classe._id, periode, anneeScolaire: year, statut: 'VALIDEE' });
        const allDispensations = await Dispensation.find({ eleve: { $in: eleves.map(e => e._id) }, anneeScolaire: year });

        const matrix = eleves.map(eleve => {
            const studentGrades = {};
            let weightedSum = 0;
            let totalCoeffs = 0;

            matieres.forEach(matiere => {
                const isDispensed = allDispensations.some(d => d.eleve.toString() === eleve._id.toString() && d.matiere.toString() === matiere._id.toString());
                const noteDoc = allNotes.find(n => n.eleve.toString() === eleve._id.toString() && n.matiere.toString() === matiere._id.toString());
                const coeff = matiere.coefficient || 1;

                if (isDispensed) {
                    studentGrades[matiere._id] = { notes: [], moyenne: null, coeff, isDispensed: true };
                } else if (noteDoc) {
                    studentGrades[matiere._id] = { notes: noteDoc.notes.map(n => n.valeur), moyenne: noteDoc.moyenne, appreciation: noteDoc.appreciation, coeff, isDispensed: false };
                    weightedSum += noteDoc.moyenne * coeff;
                    totalCoeffs += coeff;
                } else {
                    studentGrades[matiere._id] = { notes: [], moyenne: null, coeff, isDispensed: false };
                }
            });

            return { eleveId: eleve._id, nom: eleve.nom, prenom: eleve.prenom, matricule: eleve.matricule, matieres: studentGrades, moyenneGenerale: totalCoeffs > 0 ? weightedSum / totalCoeffs : 0 };
        });

        const subjectStats = {};
        matieres.forEach(matiere => {
            const moyennes = matrix.map(row => row.matieres[matiere._id].moyenne).filter(m => m !== null);
            if (moyennes.length > 0) {
                subjectStats[matiere._id] = { avg: moyennes.reduce((a, b) => a + b, 0) / moyennes.length, min: Math.min(...moyennes), max: Math.max(...moyennes), successRate: (moyennes.filter(m => m >= 10).length / moyennes.length) * 100 };
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

        allSheetsData.push({ classe, periode, anneeScolaire: year, matieres, matrix, subjectStats, overallStats });
    }

    if (allSheetsData.length === 0) return next(new ErrorResponse('Aucune donnée trouvée', 404));

    const pdfBuffer = await generateMasterGradeSheetPDF(allSheetsData, schoolConfig);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=MasterSheet.pdf', 'Content-Length': pdfBuffer.length });
    res.end(pdfBuffer);
});
