const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

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

const debugLogin = async () => {
    await connectDB();

    const matricule = 'mat003';
    const password = '123456';

    console.log(`Checking user with matricule: ${matricule}`);

    const user = await User.findOne({ matricule: matricule }).select('+password');

    if (!user) {
        console.log('❌ User not found via matricule field.');

        // Check if maybe it's in email field?
        const userByEmail = await User.findOne({ email: matricule });
        if (userByEmail) {
            console.log('✅ Found in EMAIL field though.');
        } else {
            console.log('❌ Not found in email field either.');
        }

        // List all users to see what exists
        const allUsers = await User.find({ role: 'ELEVE' }).limit(5);
        console.log('--- Sample Students ---');
        allUsers.forEach(u => console.log(`- ${u.prenom} ${u.nom} (Mat: ${u.matricule})`));

    } else {
        console.log(`✅ User found: ${user.prenom} ${user.nom}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Password Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log('✅ Password "123456" matches the hash.');
        } else {
            console.log('❌ Password "123456" DOES NOT match the hash.');

            // Generate valid hash for 123456
            const salt = await bcrypt.genSalt(10);
            const validHash = await bcrypt.hash(password, salt);
            console.log(`ℹ️ A valid hash for '123456' would be: ${validHash}`);

            // Update it?
            console.log('Updating password to 123456...');
            user.password = password; // Pre-save hook will hash it
            await user.save();
            console.log('✅ Password updated to 123456.');
        }
    }

    process.exit();
};

debugLogin();
