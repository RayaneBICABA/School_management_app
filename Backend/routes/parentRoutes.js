const express = require('express');
const {
    addChild,
    getChildren,
    searchStudents,
    getChild,
    updateChild,
    getChildTeachers,
    getChildEmergencyContacts,
    addEmergencyContact,
    getChildYearlyStats,
    getChildDocuments,
    getChildDisciplineStats,
    getChildAttendance,
    getChildPendingAbsences,
    getChildDisciplinaryLogs,
    submitAbsenceJustification,
    getChildCalendarEvents,
    getChildNextClasses
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/justificatifs/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers JPEG, JPG, PNG et PDF sont autorisés'));
        }
    }
});

const router = express.Router();

router.use(protect);
router.use(authorize('PARENT'));

// Children routes
router.route('/children')
    .post(addChild)
    .get(getChildren);

router.route('/children/:id')
    .get(getChild)
    .put(updateChild);

// Child-specific routes
router.get('/children/:id/teachers', getChildTeachers);
router.get('/children/:id/emergency-contacts', getChildEmergencyContacts);
router.get('/children/:id/stats', getChildYearlyStats);
router.get('/children/:id/documents', getChildDocuments);

// Discipline routes
router.get('/children/:id/discipline/stats', getChildDisciplineStats);
router.get('/children/:id/discipline/logs', getChildDisciplinaryLogs);

// Attendance routes
router.get('/children/:id/attendance', getChildAttendance);
router.get('/children/:id/absences/pending', getChildPendingAbsences);
router.post('/children/:id/absences/justify', upload.single('justificatif'), submitAbsenceJustification);

// Calendar routes
router.get('/children/calendar/events', getChildCalendarEvents);
router.get('/children/calendar/next-classes', getChildNextClasses);

// Emergency contacts
router.post('/emergency-contacts', addEmergencyContact);

// Search
router.get('/search-students', searchStudents);

module.exports = router;
