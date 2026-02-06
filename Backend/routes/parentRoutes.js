const express = require('express');
const { addChild, getChildren } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('PARENT'));

router.route('/children')
    .post(addChild)
    .get(getChildren);

module.exports = router;
