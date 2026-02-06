const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Classe = require('./models/Classe');

const connectDB = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gestion-scolaire';
        console.log(`Connecting to: ${uri}`);
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugSchedules = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gestion-scolaire';
        await mongoose.connect(uri);

        const count = await Schedule.countDocuments({});
        console.log(`Total Schedules in DB: ${count}`);

        if (count > 0) {
            const scheds = await Schedule.find({}).limit(5).populate('classe');
            scheds.forEach(s => console.log(`- Class: ${s.classe ? s.classe.niveau + ' ' + s.classe.section : s.classe}, Slot: ${s.creneau}`));
        }
    } catch (e) { console.error(e); }
    process.exit();
};

debugSchedules();
