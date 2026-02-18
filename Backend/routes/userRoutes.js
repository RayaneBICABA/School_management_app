const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    importStudents,
    bulkCreateStudents
} = require('../controllers/userController');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Merge params to allow re-routing from other routers if needed
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(authorize('ADMIN', 'CPE', 'PROVISEUR', 'CENSEUR', 'PROFESSEUR', 'SECRETAIRE'), getUsers)
    .post(authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), createUser);

router.post('/import', authorize('ADMIN'), upload.single('file'), importStudents);
router.post('/bulk-students', authorize('PROVISEUR', 'ADMIN'), bulkCreateStudents);

router
    .route('/:id')
    .get(authorize('ADMIN', 'CPE', 'PROVISEUR', 'CENSEUR', 'PROFESSEUR', 'SECRETAIRE', 'PARENT'), getUser)
    .put(authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), updateUser)
    .delete(authorize('ADMIN', 'PROVISEUR', 'CENSEUR', 'SECRETAIRE'), deleteUser);

module.exports = router;
