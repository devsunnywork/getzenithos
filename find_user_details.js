const mongoose = require('mongoose');
const User = require('./server/models/User');
const Skill = require('./server/models/Skill');
require('dotenv').config();

async function findUser() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}).limit(10);

    const results = users.map(u => ({
        id: u._id,
        username: u.username,
        fullName: u.profile?.personalInfo?.fullName,
        activeCareers: u.activeCareers,
        xp: u.xp
    }));

    console.log(JSON.stringify(results, null, 2));

    // Find user with active careers
    const user = users.find(u => u.activeCareers && u.activeCareers.length > 0);
    if (!user) {
        console.log('No user with active careers found');
        process.exit(0);
    }

    console.log('--- Selected User Detail ---');
    console.log(`Username: ${user.username}`);
    console.log(`XP: ${user.xp}`);

    for (const skillId of user.activeCareers) {
        const skill = await Skill.findById(skillId);
        if (skill) {
            console.log(`\nActive Career: ${skill.name} (${skill._id})`);
            skill.topics.forEach((t, idx) => {
                console.log(`${idx + 1}: ${t.title} (${t._id})`);
            });
        }
    }

    process.exit(0);
}

findUser().catch(err => {
    console.error(err);
    process.exit(1);
});
