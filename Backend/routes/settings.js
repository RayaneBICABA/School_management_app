const express = require('express');
const router = express.Router();
const { getSettings, getSettingByKey, updateSetting, uploadLogo } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getSettings);

router.post('/upload-logo', protect, authorize('ADMIN', 'PROVISEUR'), uploadLogo);

router.route('/:key')
    .get(getSettingByKey)
    .put(protect, authorize('ADMIN', 'PROVISEUR'), updateSetting);

module.exports = router;
