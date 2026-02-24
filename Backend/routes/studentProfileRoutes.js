const express = require('express');
const { protect } = require('../middleware/auth');
const { selfAccess } = require('../middleware/selfAccess');
const { getStudentProfile, updateStudentProfile, exportStudentProfile, uploadStudentPhoto, addEmergencyContact } = require('../controllers/studentProfileController');
const upload = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

// Export student profile to PDF
router.get('/profile/:id/export', selfAccess, exportStudentProfile);

// Get student profile - allows students to access their own profile
// and authorized roles to access any student profile
router.get('/profile/:id', selfAccess, getStudentProfile);

// Update student profile - allows students to update their own profile
// and authorized roles to update any student profile
router.put('/profile/:id', selfAccess, updateStudentProfile);

// Upload student photo
router.put('/profile/:id/photo', selfAccess, upload.single('photo'), uploadStudentPhoto);

// Add emergency contact
router.post('/profile/:id/emergency-contacts', selfAccess, addEmergencyContact);


module.exports = router;
