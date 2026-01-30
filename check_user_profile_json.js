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

    console.log(JSON.stringify({
        username: user.username,
        profile: user.profile,
        xp: user.xp
    }, null, 2));

    process.exit(0);
}

checkUser().catch(err => {
    console.error(err);
    process.exit(1);
});
