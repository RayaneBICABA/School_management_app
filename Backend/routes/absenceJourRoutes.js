const express = require('express');
const { getTodayAbsences, updateAbsence } = require('../controllers/absenceJourController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN', 'CPE', 'PROVISEUR', 'SECRETAIRE'));

router.get('/', getTodayAbsences);
router.put('/:id', updateAbsence);

module.exports = router;
