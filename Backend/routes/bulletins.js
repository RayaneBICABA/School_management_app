const express = require('express');
const {
    generateBulletin,
    generateBulletinsClasse,
    getBulletinsByClasse,
    getBulletinsByEleve,
    getBulletin,
    finalizeBulletin,
    updateBulletin,
    distributeBulletins,
    deleteBulletin,
    getBulletinStats,
    downloadBulletinPDF,
    downloadClassBulletinsPDF,
    getValidationPageStats,
    validateClassBulletins,
    regenerateAllBulletins
} = require('../controllers/bulletinController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Routes publiques (nécessitent authentification)
router.use(protect);

router.post('/generate', authorize('CENSEUR', 'ADMIN', 'PROVISEUR'), generateBulletin);
router.post('/generate-classe', authorize('CENSEUR', 'ADMIN', 'PROVISEUR'), generateBulletinsClasse);
router.post('/regenerate-all', authorize('ADMIN'), regenerateAllBulletins);
router.post('/distribute', authorize('SECRETAIRE', 'ADMIN'), distributeBulletins);
router.get('/stats', getBulletinStats);
router.get('/validation-stats', authorize('PROVISEUR', 'ADMIN', 'SECRETAIRE'), getValidationPageStats);
router.put('/validate-classe/:classeId', authorize('PROVISEUR', 'ADMIN'), validateClassBulletins);

router.get('/classe/:classeId', authorize('CENSEUR', 'ADMIN', 'PROVISEUR', 'PROFESSEUR', 'SECRETAIRE'), getBulletinsByClasse);
router.get('/eleve/:eleveId', authorize('PARENT', 'CENSEUR', 'ADMIN', 'PROVISEUR', 'PROFESSEUR', 'ELEVE', 'SECRETAIRE'), getBulletinsByEleve);

// PDF routes - must come before /:id routes to avoid conflicts
router.get('/classe/:classeId/pdf', authorize('CENSEUR', 'ADMIN', 'PROVISEUR', 'SECRETAIRE'), downloadClassBulletinsPDF);
router.get('/:id/pdf', authorize('PARENT', 'CENSEUR', 'ADMIN', 'PROVISEUR', 'PROFESSEUR', 'ELEVE', 'SECRETAIRE'), downloadBulletinPDF);

router.route('/:id')
    .get(getBulletin)
    .put(authorize('CENSEUR', 'ADMIN', 'PROVISEUR'), updateBulletin)
    .delete(authorize('ADMIN'), deleteBulletin);

router.put('/:id/finalize', authorize('CENSEUR', 'ADMIN', 'PROVISEUR'), finalizeBulletin);

module.exports = router;
