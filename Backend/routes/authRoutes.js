const express = require('express');
const { register, login, getMe, updateDetails, updatePassword, uploadPhoto, clearHistory } = require('../controllers/authController');
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

// Upload photo - PUT (original with multer)
router.put('/photo', protect, upload.single('photo'), uploadPhoto);

// Upload photo - POST (alternative with multer)
router.post('/photo', protect, upload.single('photo'), uploadPhoto);

// Upload photo - Manual (without multer) - Simple base64 approach
router.post('/photo-manual', protect, async (req, res) => {
    try {
        console.log('📸 [photo-manual] Starting manual upload...');
        console.log('📸 [photo-manual] User ID:', req.user?._id);
        console.log('📸 [photo-manual] Content-Type:', req.headers['content-type']);

        // Get raw data
        let rawData = '';
        req.on('data', chunk => {
            rawData += chunk;
        });

        req.on('end', async () => {
            try {
                // Simple approach: look for base64 image data
                const base64Match = rawData.match(/data:image\/[^;]+;base64,([^\s]+)/);
                if (base64Match) {
                    const base64Data = base64Match[1];
                    const buffer = Buffer.from(base64Data, 'base64');

                    console.log('📸 [photo-manual] Base64 image found, size:', buffer.length);

                    // Generate filename
                    const timestamp = Date.now();
                    const filename = `user-${req.user._id}-${timestamp}.jpg`;
                    const uploadPath = `uploads/profile/${filename}`;

                    // Save file
                    const fs = require('fs').promises;
                    await fs.writeFile(uploadPath, buffer);

                    const photoUrl = `/uploads/profile/${filename}`;
                    console.log('✅ [photo-manual] File saved:', photoUrl);

                    // Update user
                    const User = require('../models/User');
                    await User.findByIdAndUpdate(req.user._id, { photo: photoUrl });

                    res.json({
                        success: true,
                        data: photoUrl
                    });
                } else {
                    console.log('❌ [photo-manual] No base64 image data found');
                    res.status(400).json({
                        success: false,
                        error: 'Format d\'image non supporté'
                    });
                }
            } catch (error) {
                console.error('❌ [photo-manual] Error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

    } catch (err) {
        console.error('❌ [photo-manual] Error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
