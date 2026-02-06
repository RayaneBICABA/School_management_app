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

const resetPassword = async () => {
    await connectDB();

    const matricule = 'mat003';
    const newPassword = '123456';

    console.log(`Resetting password for matricule: ${matricule}`);

    const user = await User.findOne({ matricule: matricule });

    if (!user) {
        console.log('❌ User not found via matricule field.');
        // Try creating one for testing if not found? No, assuming user exists per user report.

        // Try finding by email just in case 'mat003' was put in email field by mistake?
        const userByEmail = await User.findOne({ email: matricule });
        if (userByEmail) {
            console.log('✅ Found user where email matches matricule. Updating password...');
            userByEmail.password = newPassword;
            await userByEmail.save();
            console.log('✅ Password updated successfully!');
        } else {
            console.log('❌ User absolutely not found.');
        }

    } else {
        console.log(`✅ User found: ${user.prenom} ${user.nom}`);
        user.password = newPassword;
        await user.save();
        console.log('✅ Password updated successfully to "123456"!');
    }

    process.exit();
};

resetPassword();
