const mongoose = require('mongoose');
const Bulletin = require('../models/Bulletin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion-scolaire');
        console.log('Connected to MongoDB');

        const result = await Bulletin.updateMany(
            { statut: 'FINALISE', signatureProviseur: false },
            { $set: { signatureProviseur: true } }
        );

        console.log(`Updated ${result.modifiedCount} bulletins to be visible (signed by Proviseur).`);
        process.exit(0);
    } catch (error) {
        console.error('Error during update:', error);
        process.exit(1);
    }
};

run();
