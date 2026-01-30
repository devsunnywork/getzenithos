const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config();

async function checkUser() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ activeCareers: { $exists: true, $not: { $size: 0 } } });
    if (!user) {
        console.log('No user with active careers found');
        process.exit(1);
    }

    console.log('User:', user.username);
    console.log('Full Name:', user.profile?.personalInfo?.fullName);
    console.log('Avatar:', user.profile?.avatar);
    console.log('XP:', user.xp);

    // If Full Name or Avatar is missing, let's set them for testing if the user wants them
    // But the user said "from the database", so maybe they expect them to be there or I should set them.
    // Wait, the user said "i want user full name and avtar in the dashbaord form the datbase".
    // This could mean "ensure the code fetches it from the database".

    process.exit(0);
}

checkUser().catch(err => {
    console.error(err);
    process.exit(1);
});
