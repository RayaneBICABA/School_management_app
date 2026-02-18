const express = require('express');
const {
    getStudentStats,
    getTodaySchedule,
    getWeeklySchedule,
    getNotes,
    getBulletins,
    getDiscipline,
    getNotifications,
    getAttendance,
    getStudentTeachers,
    getStudentEmergencyContacts,
    getStudentEvents
} = require('../controllers/studentController');

const router = express.Router();

// Middleware d'authentification
const { protect } = require('../middleware/auth');
const { selfAccess } = require('../middleware/selfAccess');

router.use(protect);

// Routes pour les élèves (avec selfAccess pour permettre aux élèves d'accéder à leurs propres données)
router.get('/:id/stats', selfAccess, getStudentStats);
router.get('/:id/schedule/today', selfAccess, getTodaySchedule);
router.get('/:id/schedule/week', selfAccess, getWeeklySchedule);
router.get('/:id/notes', selfAccess, getNotes);
router.get('/:id/bulletins', selfAccess, getBulletins);
router.get('/:id/discipline', selfAccess, getDiscipline);
router.get('/:id/notifications', selfAccess, getNotifications);
router.get('/:id/attendance', selfAccess, getAttendance);
router.get('/:id/teachers', selfAccess, getStudentTeachers);
router.get('/:id/emergency-contacts', selfAccess, getStudentEmergencyContacts);
router.get('/:id/events', selfAccess, getStudentEvents);

module.exports = router;
