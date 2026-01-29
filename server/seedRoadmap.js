const mongoose = require('mongoose');
const Skill = require('./models/Skill');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Skill.deleteMany({});
        console.log('Cleared existing skills');

        const frontendRoadmap = new Skill({
            name: 'Frontend Mastery',
            category: 'Frontend',
            description: 'The ultimate path to becoming a modern frontend architect.',
            icon: 'fa-code',
            color: '#fbbf24',
            topics: []
        });

        // Define Nodes
        const nodes = [
            { title: 'Internet & How it works', type: 'main', parent: '' },
            { title: 'HTML', type: 'main', parent: 'Internet & How it works' },
            { title: 'CSS', type: 'main', parent: 'HTML' },
            { title: 'JavaScript', type: 'main', parent: 'CSS' },
            { title: 'Version Control (Git)', type: 'branch', parent: 'JavaScript' },
            { title: 'GitHub', type: 'sub', parent: 'Version Control (Git)' },
            { title: 'Package Managers', type: 'main', parent: 'JavaScript' },
            { title: 'npm', type: 'branch', parent: 'Package Managers' },
            { title: 'yarn', type: 'branch', parent: 'Package Managers' },
            { title: 'Frameworks', type: 'main', parent: 'Package Managers' },
            { title: 'React', type: 'branch', parent: 'Frameworks' },
            { title: 'Vue', type: 'branch', parent: 'Frameworks' }
        ];

        // Map titles to IDs for parent linking
        const nodeMap = {};
        for (const n of nodes) {
            const topicId = new mongoose.Types.ObjectId();
            frontendRoadmap.topics.push({
                _id: topicId,
                title: n.title,
                type: n.type,
                parent: n.parent ? nodeMap[n.parent] || n.parent : '', // Temporarily use title if ID not yet in map
                xpReward: 200
            });
            nodeMap[n.title] = topicId.toString();
        }

        // Finalize parent IDs
        frontendRoadmap.topics.forEach(t => {
            if (t.parent && nodeMap[t.parent]) {
                t.parent = nodeMap[t.parent];
            }
        });

        await frontendRoadmap.save();
        console.log('Hierarchical Frontend Roadmap seeded!');

        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
}

seed();
