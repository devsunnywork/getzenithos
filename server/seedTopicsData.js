const mongoose = require('mongoose');
const Skill = require('./models/Skill');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const skills = [
    {
        name: 'The Frontend Core',
        category: 'Frontend',
        description: 'Master the building blocks of the web.',
        icon: 'fa-code',
        color: '#3b82f6',
        level: 1,
        topics: [
            {
                title: 'Semantic HTML5',
                description: 'Learn structure and accessibility.',
                xpReward: 150,
                content: '<h1>Semantic HTML</h1><p>Use tags like &lt;main&gt;, &lt;article&gt;, and &lt;section&gt; for better SEO and accessibility.</p>'
            },
            {
                title: 'CSS Custom Properties',
                description: 'Modern variable management in styling.',
                xpReward: 200,
                content: '<p>Learn to use :root { --primary-color: #ff0000; }</p>'
            },
            {
                title: 'DOM Manipulation',
                description: 'Taking control of the browser with JS.',
                xpReward: 300,
                content: '<p>Use document.querySelector and Event Listeners.</p>'
            }
        ]
    },
    {
        name: 'Neural Backend',
        category: 'Backend',
        description: 'Architect scalable server-side systems.',
        icon: 'fa-server',
        color: '#ef4444',
        level: 2,
        topics: [
            {
                title: 'Node.js Event Loop',
                description: 'Understand how non-blocking I/O works.',
                xpReward: 250,
                content: '<p>The heart of Node.js performance.</p>'
            },
            {
                title: 'RESTful API Design',
                description: 'Building standard communication layers.',
                xpReward: 300,
                content: '<p>Learn GET, POST, PUT, DELETE best practices.</p>'
            }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing skills to avoid duplicates in this demo
        await Skill.deleteMany({});
        console.log('Cleared existing skills');

        const insertedSkills = await Skill.insertMany(skills);
        console.log(`Successfully seeded ${insertedSkills.length} skills with topics!`);

        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
}

seed();
