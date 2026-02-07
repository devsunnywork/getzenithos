
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Skill = require('../server/models/Skill');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const listSkills = async () => {
    await connectDB();
    // Select name and topics array.
    const skills = await Skill.find({}, 'name topics');

    console.log('--- AVAILABLE SKILLS ---');
    skills.forEach(s => {
        console.log(`Name: ${s.name} | ID: ${s._id} | Topics Count: ${s.topics ? s.topics.length : 0}`);
        if (s.topics && s.topics.length > 0) {
            // Print first topic to inspect structure
            const t = s.topics[0];
            console.log('Use Title Check:', t.title);
            console.log('Use Name Check:', t.name);
            console.log('First Topic Dump:', JSON.stringify(t, null, 2));
        }
    });
    process.exit();
};

listSkills();
