const express = require('express');
const {
    createNotes,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    validateNote,
    rejectNote,
    getPendingNotes,
    unblockNotes,
    submitNote,
    getMasterSheetData,
    getMasterSheetPDF
} = require('../controllers/noteController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { checkGradeDeadline } = require('../middleware/checkGradeDeadline');

// Routes publiques (nécessitent authentification)
router.use(protect);

router.route('/')
    .get(getNotes)
    .post(checkGradeDeadline, createNotes);

router.get('/pending', getPendingNotes);
router.get('/master-sheet/:classeId', getMasterSheetData);
router.get('/master-sheet/:classeId/pdf', getMasterSheetPDF);

router.route('/:id')
    .get(getNote)
    .put(checkGradeDeadline, updateNote)
    .delete(deleteNote);

router.post('/:id/validate', validateNote);
router.post('/:id/reject', rejectNote);
router.post('/:id/submit', checkGradeDeadline, submitNote);

module.exports = router;
