const mongoose = require('mongoose');
const Setting = require('./models/Setting');
require('dotenv').config();

const updateConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion-scolaire');
        console.log('Connected to MongoDB');

        const newConfig = {
            year: '2025-2026',
            periods: [
                { name: 'Trimestre 1', start: '2025-09-01', end: '2025-12-20' },
                { name: 'Trimestre 2', start: '2026-01-05', end: '2026-03-31' },
                { name: 'Trimestre 3', start: '2026-04-10', end: '2026-06-30' }
            ]
        };

        const setting = await Setting.findOneAndUpdate(
            { key: 'academic_year_config' },
            { value: newConfig },
            { upsert: true, new: true }
        );

        console.log('Academic year configuration updated to 2025-2026');
        console.log(JSON.stringify(setting.value, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error updating config:', error);
        process.exit(1);
    }
};

updateConfig();
