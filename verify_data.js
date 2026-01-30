const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

const Skill = require('./server/models/Skill');
const CareerPath = require('./server/models/CareerPath');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const skills = await Skill.find({});
        console.log(`Skills Found: ${skills.length}`);
        skills.forEach(s => console.log(`- ${s.name} (${s.category})`));

        const paths = await CareerPath.find({});
        console.log(`\nCareer Paths Found: ${paths.length}`);
        paths.forEach(p => console.log(`- ${p.name}`));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
