const express = require('express');
const {
    getClasses,
    getClasse,
    createClasse,
    updateClasse,
    deleteClasse,
    renameNiveau,
    deleteNiveau,
    renameSpecialite,
    deleteSpecialite
} = require('../controllers/classeController');

const router = express.Router();


const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Re-route into other resource routers (must be after protect)
const classeMatiereRouter = require('./classeMatiereRoutes');
router.use('/:classeId/matieres', classeMatiereRouter);

router
    .route('/')
    .get(getClasses)
    .post(authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), createClasse);

// Routes pour la gestion en lot des niveaux et spécialités
router.put('/niveaux', authorize('ADMIN'), renameNiveau);
router.delete('/niveaux/:name', authorize('ADMIN'), deleteNiveau);
router.put('/specialites', authorize('ADMIN'), renameSpecialite);
router.delete('/specialites/:name', authorize('ADMIN'), deleteSpecialite);

router
    .route('/:id')
    .get(getClasse)
    .put(authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), updateClasse)
    .delete(authorize('ADMIN', 'PROVISEUR', 'CENSEUR'), deleteClasse);

module.exports = router;
