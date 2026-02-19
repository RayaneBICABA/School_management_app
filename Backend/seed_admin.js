const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Setting = require('./models/Setting');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // --- 1. Seed Admin User ---
        // Check if admin exists
        let admin = await User.findOne({ email: 'admin@ecole.com' });

        if (admin) {
            console.log('Admin user already exists. Updating password...');
            // Update password to ensure it is correct (hashing handled by pre-save hook implied by save()?)
            // Actually, to trigger the hook on update, we need to find and save, 
            // but we need to assign the plain text password first.

            admin.password = 'password123';
            await admin.save(); // This triggers the pre('save') hook which hashes the password
            console.log('Admin password reset to: password123');
        } else {
            // Create new admin
            // user.create triggers the pre('save') hook automatically
            admin = await User.create({
                prenom: 'Admin',
                nom: 'Principal',
                email: 'admin@ecole.com',
                password: 'password123', // Plain text, let the hook hash it
                role: 'ADMIN',
                status: 'ACTIF'
            });
            console.log('Default Admin Created: admin@ecole.com / password123');
        }

        // --- 2. Seed Academic Year ---
        const academicYearKey = 'academic_year_config';
        let academicYearSetting = await Setting.findOne({ key: academicYearKey });

        if (!academicYearSetting) {
            await Setting.create({
                key: academicYearKey,
                value: {
                    year: '2025-2026',
                    startDate: '2025-09-01',
                    endDate: '2026-07-31',
                    currentTrimester: '1er Trimestre'
                }
            });
            console.log('Academic Year Setting Created: 2025-2026');
        } else {
            console.log('Academic Year Setting already exists.');
        }

        console.log('Seeding completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
