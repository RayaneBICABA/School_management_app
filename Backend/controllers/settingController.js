const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.find();
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

exports.getSettingByKey = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(200).json({
                success: true,
                data: null
            });
        }
        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        let setting = await Setting.findOne({ key: req.params.key });

        if (setting) {
            setting.value = req.body.value;
            setting.updatedAt = Date.now();
            await setting.save();
        } else {
            setting = await Setting.create({
                key: req.params.key,
                value: req.body.value
            });
        }

        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

exports.uploadLogo = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, error: 'Aucune image fournie' });
        }

        // Directly save the Base64 string to the database instead of the file system
        // This is necessary for serverless environments (like Vercel) where the local filesystem is ephemeral
        let setting = await Setting.findOne({ key: 'school_config' });
        const configValue = setting ? setting.value : {};
        configValue.logo = image; // 'image' is already the Base64 string from the frontend

        if (setting) {
            setting.value = configValue;
            setting.updatedAt = Date.now();
            await setting.save();
        } else {
            setting = await Setting.create({
                key: 'school_config',
                value: configValue
            });
        }

        res.status(200).json({
            success: true,
            data: image // Return the Base64 string
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
