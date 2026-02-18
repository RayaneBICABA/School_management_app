const NoteColumn = require('../models/NoteColumn');
const Note = require('../models/Note');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const xlsx = require('xlsx');

// @desc    Créer une colonne de note
// @route   POST /api/v1/note-columns
// @access  Private (Professeur)
exports.createNoteColumn = asyncHandler(async (req, res, next) => {
    const { nom, matiere, classe, periode } = req.body;

    // Vérifier que l'utilisateur est professeur
    if (req.user.role !== 'PROFESSEUR' && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Seuls les professeurs peuvent créer des colonnes', 403));
    }

    // Obtenir le nombre de colonnes existantes pour définir l'ordre
    const existingColumns = await NoteColumn.countDocuments({
        matiere,
        classe,
        periode,
        anneeScolaire: req.body.anneeScolaire || '2025-2026'
    });

    const column = await NoteColumn.create({
        nom,
        matiere,
        classe,
        professeur: req.user.id,
        periode,
        ordre: existingColumns,
        anneeScolaire: req.body.anneeScolaire || '2025-2026'
    });

    await column.populate(['matiere', 'classe', 'professeur']);

    res.status(201).json({
        success: true,
        data: column
    });
});

// @desc    Obtenir toutes les colonnes avec filtres
// @route   GET /api/v1/note-columns
// @access  Private
exports.getNoteColumns = asyncHandler(async (req, res, next) => {
    const { classe, matiere, periode, professeur } = req.query;

    let query = {};

    if (classe) query.classe = classe;
    if (matiere) query.matiere = matiere;
    if (periode) query.periode = periode;
    if (professeur) query.professeur = professeur;

    // Si professeur, ne voir que ses colonnes
    if (req.user.role === 'PROFESSEUR') {
        query.professeur = req.user.id;
    }

    const columns = await NoteColumn.find(query)
        .populate('matiere', 'nom')
        .populate('classe', 'niveau section')
        .populate('professeur', 'nom prenom')
        .sort('ordre');

    res.status(200).json({
        success: true,
        count: columns.length,
        data: columns
    });
});

// @desc    Mettre à jour une colonne
// @route   PUT /api/v1/note-columns/:id
// @access  Private (Professeur)
exports.updateNoteColumn = asyncHandler(async (req, res, next) => {
    let column = await NoteColumn.findById(req.params.id);

    if (!column) {
        return next(new ErrorResponse('Colonne non trouvée', 404));
    }

    // Vérifier que c'est le professeur qui a créé la colonne
    if (column.professeur.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé', 403));
    }

    column = await NoteColumn.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(['matiere', 'classe', 'professeur']);

    res.status(200).json({
        success: true,
        data: column
    });
});

// @desc    Supprimer une colonne
// @route   DELETE /api/v1/note-columns/:id
// @access  Private (Professeur)
exports.deleteNoteColumn = asyncHandler(async (req, res, next) => {
    const column = await NoteColumn.findById(req.params.id);

    if (!column) {
        return next(new ErrorResponse('Colonne non trouvée', 404));
    }

    // Vérifier les permissions
    if (column.professeur.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé', 403));
    }

    // Vérifier s'il existe des notes en attente de validation ou soumises pour cette évaluation
    const notesWithPendingValidation = await Note.find({
        matiere: column.matiere,
        classe: column.classe,
        periode: column.periode,
        $or: [
            { statut: 'EN_ATTENTE' },
            { statut: 'SOUMISE' }
        ],
        'notes.evaluation': column._id
    });

    if (notesWithPendingValidation.length > 0) {
        return next(new ErrorResponse(
            'Impossible de supprimer cette évaluation car des notes sont en attente de validation ou ont été soumises. Veuillez d\'abord les valider ou les rejeter.',
            400
        ));
    }

    // Supprimer toutes les notes associées à cette colonne
    await Note.updateMany(
        {
            matiere: column.matiere,
            classe: column.classe,
            periode: column.periode
        },
        {
            $pull: {
                notes: { evaluation: column._id }
            }
        }
    );

    await column.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Importer des notes depuis Excel
// @route   POST /api/v1/note-columns/:id/import
// @access  Private (Professeur)
exports.importNotesFromExcel = asyncHandler(async (req, res, next) => {
    const column = await NoteColumn.findById(req.params.id);

    if (!column) {
        return next(new ErrorResponse('Colonne non trouvée', 404));
    }

    // Vérifier les permissions
    if (column.professeur.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ErrorResponse('Non autorisé', 403));
    }

    if (!req.files || !req.files.file) {
        return next(new ErrorResponse('Veuillez fournir un fichier Excel', 400));
    }

    const file = req.files.file;

    // Vérifier le type de fichier
    if (!file.mimetype.includes('spreadsheet') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        return next(new ErrorResponse('Veuillez fournir un fichier Excel valide', 400));
    }

    try {
        // Lire le fichier Excel
        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const importedNotes = [];
        const errors = [];

        // Traiter chaque ligne
        for (const row of data) {
            const matricule = row.Matricule || row.matricule;
            const noteValue = parseFloat(row.Note || row.note);

            if (!matricule) {
                errors.push({ row, error: 'Matricule manquant' });
                continue;
            }

            if (isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
                errors.push({ row, error: 'Note invalide (doit être entre 0 et 20)' });
                continue;
            }

            // Trouver l'élève
            const eleve = await User.findOne({ matricule, role: 'ELEVE', classe: column.classe });

            if (!eleve) {
                errors.push({ row, error: `Élève non trouvé avec matricule ${matricule}` });
                continue;
            }

            // Créer ou mettre à jour la note
            let noteDoc = await Note.findOne({
                eleve: eleve._id,
                matiere: column.matiere,
                classe: column.classe,
                periode: column.periode,
                anneeScolaire: column.anneeScolaire
            });

            if (!noteDoc) {
                noteDoc = await Note.create({
                    eleve: eleve._id,
                    matiere: column.matiere,
                    classe: column.classe,
                    professeur: req.user.id,
                    periode: column.periode,
                    notes: [],
                    anneeScolaire: column.anneeScolaire
                });
            }

            // Vérifier si une note existe déjà pour cette colonne
            const existingNoteIndex = noteDoc.notes.findIndex(n => n.type === column.nom);

            if (existingNoteIndex >= 0) {
                // Mettre à jour
                noteDoc.notes[existingNoteIndex].valeur = noteValue;
            } else {
                // Ajouter
                noteDoc.notes.push({
                    valeur: noteValue,
                    type: column.nom,
                    date: Date.now(),
                    coefficient: 1
                });
            }

            await noteDoc.save();
            importedNotes.push({ matricule, note: noteValue });
        }

        res.status(200).json({
            success: true,
            message: `${importedNotes.length} note(s) importée(s)`,
            imported: importedNotes.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Erreur import Excel:', error);
        return next(new ErrorResponse('Erreur lors de l\'import du fichier Excel', 500));
    }
});
