const express = require('express');
const {
    getAllClasseMatieres,
    getClasseMatieres,
    addMatiereToClasse,
    updateClasseMatiere,
    removeMatiereFromClasse,
    importClasseMatieres,
    getMyClasses
} = require('../controllers/classeMatiereController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/all')
    .get(protect, authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), getAllClasseMatieres);

router.get('/my-classes', protect, authorize('PROFESSEUR'), getMyClasses);

router.route('/')
    .get(protect, getClasseMatieres)
    .post(protect, authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), addMatiereToClasse);

router.post('/import', protect, authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), importClasseMatieres);

router.route('/:id')
    .put(protect, authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), updateClasseMatiere)
    .delete(protect, authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), removeMatiereFromClasse);

module.exports = router;
