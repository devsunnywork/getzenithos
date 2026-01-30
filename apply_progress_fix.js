const mongoose = require('mongoose');
const User = require('./server/models/User');
const Skill = require('./server/models/Skill');
require('dotenv').config();

async function updateProgress() {
    await mongoose.connect(process.env.MONGO_URI);

    // Find user with active careers
    const user = await User.findOne({ activeCareers: { $exists: true, $not: { $size: 0 } } });
    if (!user) {
        console.log('No user with active careers found');
        process.exit(1);
    }

    console.log('Found User:', user.username);
    const skillId = user.activeCareers[0];
    const skill = await Skill.findById(skillId);

    if (!skill) {
        console.log('Skill not found');
        process.exit(1);
    }

    // 3rd node is index 2
    const topic = skill.topics[2];
    if (!topic) {
        console.log('3rd topic not found');
        process.exit(1);
    }

    console.log(`Marking node "${topic.title}" (${topic._id}) as complete...`);

    // 1. Update skillProgress
    let sp = user.skillProgress.find(p => p.skill.toString() === skillId.toString());
    if (!sp) {
        user.skillProgress.push({
            skill: skillId,
            isUnlocked: true,
            completedTopics: [topic._id],
            xpEarned: topic.xp || 100
        });
    } else {
        if (!sp.completedTopics.some(id => id.toString() === topic._id.toString())) {
            sp.completedTopics.push(topic._id);
            sp.xpEarned += (topic.xp || 100);
        }
    }

    // 2. Increase global XP
    const xpIncrease = topic.xp || 100;
    user.xp += xpIncrease;
    console.log(`Increased XP by ${xpIncrease}. New XP: ${user.xp}`);

    // 3. Update courseProgress (as requested)
    // We'll find a course related to this skill if possible, or just create a mock entry if none exists
    // Actually, looking at Course model might help, but I'll check user.enrolledCourses
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
        const courseId = user.enrolledCourses[0];
        let cp = user.courseProgress.find(p => p.courseId.toString() === courseId.toString());
        if (cp) {
            cp.xp += xpIncrease;
        } else {
            user.courseProgress.push({
                courseId: courseId,
                xp: xpIncrease,
                completedLectures: []
            });
        }
    }

    user.markModified('skillProgress');
    user.markModified('courseProgress');
    await user.save();

    console.log('Progress updated successfully!');
    process.exit(0);
}

updateProgress().catch(err => {
    console.error(err);
    process.exit(1);
});
