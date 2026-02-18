const express = require('express');
const {
    getExamens,
    createExamen,
    updateExamen,
    deleteExamen,
    getExamen
} = require('../controllers/examenController');

const router = express.Router();

// Middleware d'authentification
const { protect } = require('../middleware/auth');
router.use(protect);

// Routes pour les examens
router.route('/')
    .get(getExamens)
    .post(createExamen);

router.route('/:id')
    .get(getExamen)
    .put(updateExamen)
    .delete(deleteExamen);

module.exports = router;
