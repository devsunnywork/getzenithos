const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const user = await User.findOne({ username: 'SYSTEM_ADMIN' });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        // Generate token for admin
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        console.log('Generated Token for Admin:', token);

        // We can't easily fetch from localhost:5000 here without the server running, 
        // but the server IS running in the background according to the user.
        // I'll try to fetch it.
        try {
            const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            console.log('Profile Response:');
            console.log(JSON.stringify(data.enrolledCourses, null, 2));
        } catch (e) {
            console.log('Fetch error (maybe server is on different port or not accessible):', e.message);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
