const express = require('express');
const {
    sendNotification,
    getNotifications,
    getSentNotifications,
    markAsRead,
    clearNotificationHistory
} = require('../controllers/notificationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getNotifications)
    .post(authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'CPE', 'PROFESSEUR', 'SECRETAIRE'), sendNotification);

router.delete('/history', authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'CPE', 'PROFESSEUR', 'SECRETAIRE'), clearNotificationHistory);

router.get('/sent', authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'CPE', 'PROFESSEUR', 'SECRETAIRE'), getSentNotifications);

router.put('/:id/read', markAsRead);

module.exports = router;
