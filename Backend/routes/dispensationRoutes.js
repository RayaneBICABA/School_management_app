const express = require('express');
const router = express.Router();
const {
    getDispensations,
    createDispensation,
    deleteDispensation
} = require('../controllers/dispensationController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getDispensations)
    .post(createDispensation);

router.route('/:id')
    .delete(deleteDispensation);

module.exports = router;
