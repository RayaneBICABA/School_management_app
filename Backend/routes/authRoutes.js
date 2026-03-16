const express = require('express');
const { register, login, getMe, updateDetails, updatePassword, uploadPhoto, deletePhoto, clearHistory } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current logged in user
router.get('/me', protect, getMe);

// Update user details
router.put('/updatedetails', protect, updateDetails);

// Update password
router.put('/updatepassword', protect, updatePassword);

// Clear connection history
router.delete('/history', protect, clearHistory);

// Upload photo
router.put('/photo', protect, uploadPhoto);
router.post('/photo', protect, uploadPhoto);
router.delete('/photo', protect, deletePhoto);

// photo-manual route removed in favor of standardized uploadPhoto

module.exports = router;
