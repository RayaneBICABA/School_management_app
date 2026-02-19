const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: '../.env' }); // Adjust if script is run from Backend/scripts/, but we run from root usually.
// Actually, if we run `node Backend/scripts/deleteAllStudents.js` from root, path should be `Backend/.env`
// If we run from Backend/, path is `.env`.
// Let's try absolute path or relative to script execution.
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const deleteStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const result = await User.deleteMany({ role: 'ELEVE' });
        console.log(`Succès: ${result.deletedCount} élèves supprimés.`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

deleteStudents();
