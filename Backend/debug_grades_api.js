const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';

async function authAdmin() {
    await mongoose.connect(MONGO_URI);

    // Default admin email
    const email = 'admin@edumanager.com';
    const admin = await User.findOne({ email });
    if (!admin) {
        console.log("Admin account not found");
        process.exit(1);
    }
    const token = admin.getSignedJwtToken();

    const axios = require('axios');
    try {
        const res = await axios.get('http://localhost:5000/api/v1/notes', { headers: { Authorization: 'Bearer ' + token } });
        const notes = res.data.data;
        const testNotes = notes.filter(n => n.classe && n.classe.niveau === '1ère' && n.classe.section === 'TEST');
        console.log(`Found ${testNotes.length} test notes via API.`);
        if (testNotes.length > 0) {
            console.log("Sample Note structure from API:");
            console.log(JSON.stringify(testNotes[0], null, 2));
        }
    } catch (e) {
        console.log("API Error:", e.message);
    }
    process.exit(0);
}
authAdmin().catch(console.error);
