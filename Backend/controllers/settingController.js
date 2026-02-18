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
            if (req.params.key === 'school_config') {
                return res.status(200).json({
                    success: true,
                    data: null
                });
            }
            return res.status(404).json({
                success: false,
                error: 'Réglage non trouvé'
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

        const base64Match = image.match(/data:image\/[^;]+;base64,([^\s]+)/);
        if (!base64Match) {
            return res.status(400).json({ success: false, error: 'Format d\'image non supporté' });
        }

        const buffer = Buffer.from(base64Match[1], 'base64');
        const fs = require('fs').promises;
        const path = require('path');

        const uploadDir = path.join(__dirname, '..', 'uploads', 'school');
        // Ensure directory exists
        const fsNormal = require('fs');
        if (!fsNormal.existsSync(uploadDir)) {
            fsNormal.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `logo-${Date.now()}.png`;
        const uploadPath = path.join(uploadDir, filename);
        await fs.writeFile(uploadPath, buffer);

        const logoUrl = `/uploads/school/${filename}`;

        // Update school_config setting
        let setting = await Setting.findOne({ key: 'school_config' });
        const configValue = setting ? setting.value : {};
        configValue.logo = logoUrl;

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
            data: logoUrl
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
