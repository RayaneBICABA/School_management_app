const express = require('express');
const {
    sendMessage,
    getMessages,
    getConversation,
    getMessage,
    repondreMessage,
    marquerCommeLu,
    supprimerMessage,
    getMessagesNonLus,
    getMessageStats,
    uploadPieceJointe
} = require('../controllers/messageController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Routes publiques (nécessitent authentification)
router.use(protect);

// Routes principales de messagerie
router.post('/', sendMessage);
router.get('/', getMessages);
router.get('/non-lus', getMessagesNonLus);
router.get('/stats', getMessageStats);
router.post('/upload', uploadPieceJointe);

// Routes de conversation
router.get('/conversation/:userId', getConversation);

// Routes spécifiques à un message
router.get('/:id', getMessage);
router.post('/:id/repondre', repondreMessage);
router.put('/:id/lire', marquerCommeLu);
router.delete('/:id', supprimerMessage);

module.exports = router;
