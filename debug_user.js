const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./server/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Find the user (assuming arbitrary first user or specific username if known, defaulting to first found)
        const user = await User.findOne({});

        if (!user) {
            console.log("No user found.");
            process.exit();
        }

        console.log(`User Found: ${user.username}`);
        console.log("Raw Active Careers:", user.activeCareers);

        // Force Wipe
        console.log("Wiping active careers...");
        user.activeCareers = [];
        await user.save();
        console.log("Active careers wiped.");

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
