const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const { getValidationPageStats } = require('../Backend/controllers/bulletinController');
const Setting = require('../Backend/models/Setting');

async function testStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const req = {
            query: {
                // periode: 'Trimestre 1' // Omitting to trigger the async IIFE
            }
        };
        const res = {
            status: function (code) {
                console.log('Status set to:', code);
                return this;
            },
            json: function (data) {
                console.log('Response JSON:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
            }
        };
        const next = function (err) {
            console.error('Next called with error:', err);
        };

        console.log('Calling getValidationPageStats...');
        await getValidationPageStats(req, res, next);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Caught error in test:', error);
    }
}

testStats();
