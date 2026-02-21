const Notification = require('../models/Notification');
const User = require('../models/User');
const Classe = require('../models/Classe');

// @desc    Send a notification
// @route   POST /api/v1/notifications
// @access  Private (Staff only)
exports.sendNotification = async (req, res, next) => {
    try {
        const { subject, content, type, targetClasses, targetRoles, channels } = req.body;

        let recipientIds = [];

        if (type === 'classe') {
            // Find all students in selected classes
            const students = await User.find({
                role: 'ELEVE',
                classe: { $in: targetClasses }
            }).select('_id');
            const studentIds = students.map(s => s._id);

            // Find parents who have these students as children
            const parents = await User.find({
                role: 'PARENT',
                children: { $in: studentIds }
            }).select('_id');
            const parentIds = parents.map(p => p._id);

            // Combine students and parents
            let allRecipientIds = [...studentIds, ...parentIds];

            // Find professeur principal for each class
            const classes = await Classe.find({ _id: { $in: targetClasses } }).select('professeurPrincipal');
            const profPrincipalIds = classes
                .map(c => c.professeurPrincipal)
                .filter(id => id); // Remove null/undefined

            allRecipientIds = [...allRecipientIds, ...profPrincipalIds];

            // Ensure unique IDs
            recipientIds = [...new Set(allRecipientIds.map(id => id.toString()))];
        } else if (type === 'role') {
            // Find all users with selected roles
            const users = await User.find({
                role: { $in: targetRoles }
            }).select('_id');
            let allRecipientIds = users.map(u => u._id);

            // If students are included, also include parents
            if (targetRoles.includes('ELEVE')) {
                const parents = await User.find({
                    role: 'PARENT',
                    children: { $exists: true, $not: { $size: 0 } }
                }).select('_id');
                allRecipientIds = [...allRecipientIds, ...parents.map(p => p._id)];
            }

            recipientIds = [...new Set(allRecipientIds.map(id => id.toString()))];
        }

        const recipients = recipientIds.map(id => ({ user: id }));

        const notification = await Notification.create({
            sender: req.user._id,
            subject,
            content,
            type,
            targetClasses,
            targetRoles,
            recipients,
            channels,
            status: 'Envoyé'
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get notifications for logged in user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            'recipients.user': req.user._id
        })
            .populate('sender', 'nom prenom role')
            .sort({ createdAt: -1 });

        // Format response to include read status specifically for this user
        const formattedNotifications = notifications.map(notif => {
            const userRecipient = notif.recipients.find(r => r.user.toString() === req.user._id.toString());
            return {
                _id: notif._id,
                subject: notif.subject,
                content: notif.content,
                sender: notif.sender,
                createdAt: notif.createdAt,
                read: userRecipient ? userRecipient.read : false,
                readAt: userRecipient ? userRecipient.readAt : null
            };
        });

        res.status(200).json({
            success: true,
            count: formattedNotifications.length,
            data: formattedNotifications
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get notifications sent by logged in user
// @route   GET /api/v1/notifications/sent
// @access  Private
exports.getSentNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            sender: req.user._id,
            deletedBySender: { $ne: true }
        })
            .populate('targetClasses', 'niveau section')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notificationId = req.params.id;

        // Handle both string IDs and ObjectIds
        let notification;
        try {
            notification = await Notification.findById(notificationId);
        } catch (error) {
            // If ID format is invalid, return 404
            return res.status(404).json({ success: false, error: 'Notification non trouvée' });
        }

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification non trouvée' });
        }

        // Find the recipient entry for this user and mark as read
        const recipient = notification.recipients.find(r => r.user.toString() === req.user._id.toString());
        if (recipient) {
            recipient.read = true;
            recipient.readAt = new Date();
            await notification.save();
        }

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Clear sent notification history for logged in user
// @route   DELETE /api/v1/notifications/history
// @access  Private
exports.clearNotificationHistory = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { sender: req.user._id },
            { $set: { deletedBySender: true } }
        );

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
