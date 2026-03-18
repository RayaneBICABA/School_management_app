const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Classe = require('../models/Classe');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateBirthdays = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Updating Birthdays');

        const anneeScolaire = '2025-2026';
        const classe = await Classe.findOne({ niveau: '1ere', section: 'D\'', anneeScolaire });

        if (!classe) {
            console.error('Class 1ere D\' not found');
            process.exit(1);
        }

        const students = await User.find({ classe: classe._id, role: 'ELEVE' });
        console.log(`Found ${students.length} students in 1ere D'`);

        for (const student of students) {
            // Random date between 2008-01-01 and 2009-12-31
            const start = new Date(2008, 0, 1).getTime();
            const end = new Date(2009, 11, 31).getTime();
            const randomDate = new Date(start + Math.random() * (end - start));
            
            student.dateNaissance = randomDate;
            await student.save();
            console.log(`Updated ${student.email} with birth date: ${randomDate.toISOString().split('T')[0]}`);
        }

        console.log('Birth dates updated successfully!');
        process.exit();
    } catch (error) {
        console.error('Error updating birthdays:', error);
        process.exit(1);
    }
};

updateBirthdays();
