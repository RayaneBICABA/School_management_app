const express = require('express');
const { getProviseurStats, getSecretaireStats, getSuiviActiviteStats, getParentStats, getSuiviAvancementCenseur } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/proviseur', authorize('PROVISEUR', 'ADMIN'), getProviseurStats);
router.get('/secretaire', authorize('SECRETAIRE', 'ADMIN'), getSecretaireStats);
router.get('/suivi-activite', authorize('PROVISEUR', 'ADMIN'), getSuiviActiviteStats);
router.get('/suivi-avancement-censeur', authorize('CENSEUR', 'ADMIN'), getSuiviAvancementCenseur);
router.get('/parent', authorize('PARENT', 'ADMIN'), getParentStats);

module.exports = router;
