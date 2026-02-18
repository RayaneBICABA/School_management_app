const express = require('express');
const {
    exportStudentCalendar,
    exportClassCalendar,
    exportSchoolCalendar,
    getStudentEvents,
    getClassEvents
} = require('../controllers/calendarController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Routes publiques (nécessitent authentification)
router.use(protect);

// Routes d'export
router.get('/export/student/:eleveId', exportStudentCalendar);
router.get('/export/class/:classeId', exportClassCalendar);
router.get('/export/school', exportSchoolCalendar);

// Routes de consultation
router.get('/student/:eleveId', getStudentEvents);
router.get('/class/:classeId', getClassEvents);

module.exports = router;
