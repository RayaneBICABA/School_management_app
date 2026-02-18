const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const Classe = require('./models/Classe');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Test Get All Classes
        const classes = await Classe.find().limit(1);
        console.log('Classes found:', classes.length);
        if (classes.length > 0) {
            const classId = classes[0]._id;
            console.log('Testing Get Single Class with ID:', classId);
            const classe = await Classe.findById(classId).populate('professeurPrincipal', 'nom prenom');
            console.log('Single Class populated:', !!classe);
        }

        // Test Get Users
        const users = await User.find({ role: 'ELEVE' }).limit(1);
        console.log('Students found:', users.length);

        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSTIC FAILED:');
        console.error(err);
        process.exit(1);
    }
};

run();
