const express = require('express');
const {
    getStudentsByClass,
    saveAttendance,
    getClassAttendanceStats,
    getDetailedAttendanceList,
    saveGroupedAbsences,
    getManageableAbsences,
    justifyAbsence,
    validateJustification,
    rejectJustification
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', authorize('PROFESSEUR', 'ADMIN'), saveAttendance);
router.post('/grouped', authorize('CPE', 'ADMIN'), saveGroupedAbsences);
router.get('/students/:classeId', getStudentsByClass);
router.get('/manageable', authorize('CPE', 'ADMIN'), getManageableAbsences);
router.put('/:id/justify', authorize('CPE', 'ADMIN'), justifyAbsence);
router.put('/:id/validate', authorize('CPE', 'ADMIN'), validateJustification);
router.put('/:id/reject', authorize('CPE', 'ADMIN'), rejectJustification);
router.get('/stats/:classeId', authorize('CPE', 'ADMIN', 'PROVISEUR', 'PROFESSEUR'), getClassAttendanceStats);
router.get('/list/:classeId', authorize('CPE', 'ADMIN', 'PROVISEUR', 'PROFESSEUR'), getDetailedAttendanceList);

module.exports = router;
