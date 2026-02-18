const express = require('express');
const { 
    createEvaluation,
    submitNotesForValidation,
    validateNotes,
    validateBulletins,
    distributeBulletins,
    getBulletinsByClass,
    getBulletinByStudent
} = require('../controllers/bulletinWorkflowController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Routes pour les professeurs
router.post('/evaluations', authorize('PROFESSEUR'), createEvaluation);
router.post('/notes/submit', authorize('PROFESSEUR'), submitNotesForValidation);

// Routes pour le censeur
router.post('/notes/validate', authorize('CENSEUR'), validateNotes);

// Routes pour le proviseur et l'admin
router.post('/bulletins/validate', authorize(['PROVISEUR', 'ADMIN']), validateBulletins);

// Routes pour la secrétaire
router.post('/bulletins/distribute', authorize('SECRETAIRE'), distributeBulletins);

// Routes de consultation (tous les rôles autorisés selon leur contexte)
router.get('/bulletins/classe/:classeId/:periode', authorize(['PROVISEUR', 'ADMIN', 'CENSEUR', 'SECRETAIRE']), getBulletinsByClass);
router.get('/bulletins/eleve/:eleveId/:periode', authorize(['ELEVE', 'PARENT', 'PROVISEUR', 'ADMIN', 'CENSEUR', 'PROFESSEUR']), getBulletinByStudent);

module.exports = router;
