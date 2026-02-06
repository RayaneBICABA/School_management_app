const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });
if (!process.env.MONGO_URI) {
    // Fallback if running from root without config folder nearby
    dotenv.config({ path: './Backend/config/config.env' });
}

const User = require('./Backend/models/User');
const Schedule = require('./Backend/models/Schedule');
const Classe = require('./Backend/models/Classe');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lebian_db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugSchedules = async () => {
    await connectDB();

    console.log('\n--- Checking Student Users ---');
    const students = await User.find({ role: 'ELEVE' }).populate('classe');
    students.forEach(s => {
        console.log(`Student: ${s.nom} ${s.prenom}, Matricule: ${s.matricule}, Classe: ${s.classe ? s.classe._id : 'NONE'} (${s.classe ? s.classe.niveau + ' ' + s.classe.section : ''})`);
    });

    if (students.length > 0) {
        const student = students[0]; // Take the first student as example
        if (student.classe) {
            console.log(`\n--- Schedules for Class ${student.classe._id} ---`);
            const schedules = await Schedule.find({ classe: student.classe._id });
            console.log(`Found ${schedules.length} schedules.`);
            schedules.forEach(s => {
                console.log(`- Subject: ${s.matiere} (Populate this?), Day: "${s.jour}", Slot: "${s.creneau}"`);
            });
        }
    }

    console.log('\n--- All Schedules Sample (first 5) ---');
    const allScheds = await Schedule.find().limit(5);
    allScheds.forEach(s => {
        console.log(`- Class: ${s.classe}, Day: "${s.jour}", Slot: "${s.creneau}"`);
    });

    process.exit();
};

debugSchedules();
