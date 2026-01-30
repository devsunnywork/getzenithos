const mongoose = require('mongoose');
const User = require('./server/models/User');
const Skill = require('./server/models/Skill');
require('dotenv').config();

async function debugProgress() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ activeCareers: { $exists: true, $not: { $size: 0 } } })
        .populate('activeCareers')
        .populate('skillProgress.skill');

    if (!user) {
        console.log('No user with active careers found');
        process.exit(1);
    }

    const responseData = {
        user: {
            name: user.profile?.personalInfo?.fullName || user.username,
            avatar: user.profile?.avatar,
            email: user.email,
            xp: user.xp,
            level: Math.floor(user.xp / 1000) + 1
        },
        activeCareers: user.activeCareers,
        skillProgress: user.skillProgress,
        changesLeft: 3 - (user.careerChangeMeta?.changesThisMonth || 0)
    };

    console.log('--- API RESPONSE EMULATION ---');
    console.log('User Name:', responseData.user.name);
    console.log('User XP:', responseData.user.xp);
    console.log('Avatar:', responseData.user.avatar);
    console.log('Active Career ID:', responseData.activeCareers[0]?._id);
    console.log('Skill Progress Count:', responseData.skillProgress.length);

    if (responseData.activeCareers[0]) {
        const activeSkillId = responseData.activeCareers[0]._id.toString();
        const progress = responseData.skillProgress.find(p => {
            const pId = p.skill?._id ? p.skill._id.toString() : p.skill?.toString();
            return pId === activeSkillId;
        });
        console.log('Progress for Active Career found:', !!progress);
        if (progress) {
            console.log('Completed Topics Count:', progress.completedTopics.length);
            console.log('Completed Topics IDs:', progress.completedTopics);
        }
    }

    process.exit(0);
}

debugProgress().catch(err => {
    console.error(err);
    process.exit(1);
});
