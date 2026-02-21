const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { nom, prenom, email, telephone, password, role } = req.body;

        // Create user
        // If logic needed: prevent 'ADMIN' registration via public route
        // For now, we allow it for seeding or basic functionality, but usually ADMIN is manually created

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

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Veuillez fournir un email/matricule et un mot de passe' });
        }

        // Check for user by email OR matricule (case insensitive for matricule)
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
        console.log('User found:', user.email);

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Identifiants invalides' });
        }

        // Add login history
        if (!user.lastLogins) {
            user.lastLogins = [];
        }

        const loginData = {
            ip: req.ip || req.connection?.remoteAddress || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'Unknown',
            date: new Date()
        };

        user.lastLogins.unshift(loginData);
        // Keep only last 10
        if (user.lastLogins.length > 10) {
            user.lastLogins = user.lastLogins.slice(0, 10);
        }

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

        // Check current password
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
        console.log('📸 [uploadPhoto] Starting photo upload...');
        console.log('📸 [uploadPhoto] User ID:', req.user?._id);
        console.log('📸 [uploadPhoto] File received:', req.file ? 'Yes' : 'No');

        if (!req.file) {
            console.log('❌ [uploadPhoto] No file in request');
            return res.status(400).json({ success: false, error: 'Veuillez télécharger un fichier' });
        }

        console.log('📸 [uploadPhoto] File details:', {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        const photoUrl = `/uploads/profile/${req.file.filename}`;
        console.log('📸 [uploadPhoto] Photo URL:', photoUrl);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { photo: photoUrl },
            { new: true }
        );

        console.log('✅ [uploadPhoto] User updated successfully');

        res.status(200).json({
            success: true,
            data: photoUrl
        });
    } catch (err) {
        console.error('❌ [uploadPhoto] Error:', err);
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

        // Keep only the current session (the most recent login)
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
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ),
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
