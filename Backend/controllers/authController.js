const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { nom, prenom, email, telephone, password, role } = req.body;

        const user = await User.create({
            nom,
            prenom,
            email,
            telephone,
            password,
            role: 'ELEVE' // Force role to ELEVE for public registration
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Veuillez fournir un email/matricule et un mot de passe' });
        }

        const user = await User.findOne({
            $or: [
                { email: email },
                { matricule: { $regex: new RegExp(`^${email}$`, 'i') } }
            ]
        }).select('+password');

        if (!user) {
            console.log('User not found for identifier:', email);
            return res.status(401).json({ success: false, error: 'Identifiants invalides' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Identifiants invalides' });
        }

        if (!user.lastLogins) {
            user.lastLogins = [];
        }

        const loginData = {
            ip: req.ip || req.connection?.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'Unknown',
            date: new Date()
        };

        user.lastLogins.unshift(loginData);
        if (user.lastLogins.length > 10) user.lastLogins = user.lastLogins.slice(0, 10);

        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Login Error:', err);
        res.status(401).json({ success: false, error: 'Une erreur est survenue lors de la connexion' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            telephone: req.body.telephone
        };

        const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Upload photo for user
// @route   PUT /api/v1/auth/photo
// @access  Private
exports.uploadPhoto = async (req, res, next) => {
    try {
        console.log('🖼️ [authController] Photo upload request received');
        if (!req.files || !req.files.photo) {
            console.log('❌ [authController] No file provided');
            return res.status(400).json({ success: false, error: 'Veuillez télécharger un fichier' });
        }

        const file = req.files.photo;
        console.log(`📄 [authController] File: ${file.name}, Size: ${file.size}, Mimetype: ${file.mimetype}`);

        // Check file type
        if (!file.mimetype.startsWith('image')) {
            return res.status(400).json({ success: false, error: 'Veuillez télécharger une image' });
        }

        const uploadPath = path.join(__dirname, '..', 'uploads', 'profile');
        
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const filename = `user-${req.user._id}-${Date.now()}${path.extname(file.name)}`;
        const filePath = path.join(uploadPath, filename);

        await file.mv(filePath);

        const photoUrl = `/uploads/profile/${filename}`;

        console.log(`✅ [authController] File saved to ${photoUrl}, updating user database record...`);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { photo: photoUrl },
            { new: true }
        );

        if (!updatedUser) {
             console.log('❌ [authController] User not found during update');
             return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        console.log('✅ [authController] Database updated successfully');

        res.status(200).json({
            success: true,
            data: photoUrl
        });
    } catch (err) {
        console.error('❌ [authController] Photo upload error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete photo for user
// @route   DELETE /api/v1/auth/photo
// @access  Private
exports.deletePhoto = async (req, res, next) => {
    try {
        console.log('🗑️ [authController] Photo deletion request received');
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }
        
        // Delete old file from disk if it's not the default
        if (user.photo && user.photo !== 'no-photo.jpg') {
            const oldPath = path.join(__dirname, '..', user.photo);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                    console.log(`🗑️ [authController] Old photo deleted from disk: ${user.photo}`);
                } catch (unlinkErr) {
                    console.error(`⚠️ [authController] Failed to delete old photo from disk: ${unlinkErr.message}`);
                }
            }
        }

        user.photo = 'no-photo.jpg';
        await user.save({ validateBeforeSave: false });

        console.log('✅ [authController] Photo record reset to default');

        res.status(200).json({
            success: true,
            data: 'no-photo.jpg'
        });
    } catch (err) {
        console.error('❌ [authController] Photo deletion error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Clear connection history for user
// @route   DELETE /api/v1/auth/history
// @access  Private
exports.clearHistory = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        if (user.lastLogins && user.lastLogins.length > 0) {
            user.lastLogins = [user.lastLogins[0]];
        } else {
            user.lastLogins = [];
        }

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            data: user.lastLogins
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        });
};
