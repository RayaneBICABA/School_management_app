const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Setting = require('../Backend/models/Setting');

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const settings = await Setting.find({});
        console.log('Settings Found:');
        settings.forEach(s => {
            console.log(`Key: ${s.key}, Value: ${JSON.stringify(s.value)}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSettings();
