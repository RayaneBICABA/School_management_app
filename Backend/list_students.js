const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const listStudents = async () => {
    await connectDB();

    console.log('--- Listing Students ---');
    const students = await User.find({ role: 'ELEVE' }).sort({ createdAt: -1 }).limit(10);

    if (students.length === 0) {
        console.log('No students found.');
    } else {
        students.forEach(s => {
            console.log(`- Name: ${s.prenom} ${s.nom}`);
            console.log(`  Email: ${s.email}`);
            console.log(`  Matricule: ${s.matricule}`);
            console.log(`  ID: ${s._id}`);
            console.log('---');
        });
    }

    process.exit();
};

listStudents();
