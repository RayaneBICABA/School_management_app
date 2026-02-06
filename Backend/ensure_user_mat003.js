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

const ensureUser = async () => {
    await connectDB();

    const targetMatricule = 'mat003';
    // Case insensitive regex search
    const user = await User.findOne({ matricule: { $regex: new RegExp(`^${targetMatricule}$`, 'i') } });

    if (user) {
        console.log(`✅ Found user: ${user.prenom} ${user.nom} (Matricule: ${user.matricule})`);
        user.password = '123456';
        await user.save();
        console.log('✅ Password updated to "123456".');
    } else {
        console.log('❌ User mat003 not found. Creating new user...');
        const newUser = await User.create({
            nom: 'Test',
            prenom: 'Eleve',
            email: 'test.eleve.mat003@ecole.com',
            matricule: 'mat003',
            password: '123456',
            role: 'ELEVE',
            status: 'ACTIF'
        });
        console.log(`✅ Created user: ${newUser.prenom} ${newUser.nom} (Matricule: ${newUser.matricule}) with password "123456"`);
    }

    process.exit();
};

ensureUser();
