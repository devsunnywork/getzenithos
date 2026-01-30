// Seed data for Explore Tree
// Run this script to populate initial skills, career paths, and achievements
// Usage: node seedExploreData.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Skill = require('./models/Skill');
const CareerPath = require('./models/CareerPath');
const Achievement = require('./models/Achievement');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

async function seedData() {
    try {
        console.log('🌱 Starting seed process...\n');

        // Clear existing data
        await Skill.deleteMany({});
        await CareerPath.deleteMany({});
        await Achievement.deleteMany({});
        console.log('🗑️  Cleared existing data\n');

        // ===== CREATE SKILLS =====
        console.log('📚 Creating skills...');

        const skills = await Skill.insertMany([
            // Frontend Skills
            { name: 'HTML & CSS', category: 'Frontend', description: 'Master the fundamentals of web structure and styling', icon: 'fa-code', color: '#e34c26', level: 1, xpRequired: 500, estimatedHours: 20, position: { x: 200, y: 50 } },
            {
                name: 'JavaScript',
                category: 'Frontend',
                description: 'The language of the web. Master it to build interactive sites.',
                icon: 'fa-js',
                color: '#f7df1e',
                level: 2,
                xpRequired: 1000,
                estimatedHours: 40,
                position: { x: 200, y: 200 },
                topics: [
                    // Root
                    { title: 'JS Fundamentals', type: 'main', description: 'Core concepts of JavaScript.', content: 'Introduction to the V8 engine and runtime.' },

                    // Level 1
                    { title: 'Variables & Scope', parent: 'JS Fundamentals', description: 'var, let, const and hoisting.' },
                    { title: 'Data Types', parent: 'JS Fundamentals', description: 'Primitives vs Objects.' },
                    { title: 'Operators', parent: 'JS Fundamentals', description: 'Arithmetic, logical, and comparison.' },

                    // Level 2 (Branches)
                    { title: 'Control Flow', parent: 'Variables & Scope', description: 'If-else, switch, and loops.' },
                    { title: 'Functions', parent: 'Variables & Scope', description: 'Declarations, expressions, and arrows.', type: 'branch' },
                    { title: 'Objects & Arrays', parent: 'Data Types', description: 'Manipulation and methods.', type: 'branch' },

                    // Level 3 (Advanced)
                    { title: 'Closures', parent: 'Functions', description: 'Lexical scoping mastery.', xp: 100 },
                    { title: 'The `this` Keyword', parent: 'Functions', description: 'Context and binding.', xp: 100 },
                    { title: 'Prototypes', parent: 'Objects & Arrays', description: 'Inheritance model.', xp: 150 },

                    // Level 4 (ES6+)
                    { title: 'ES6+ Features', parent: 'JavaScript Core', description: 'Modern syntax upgrades.', type: 'group' }, // Orphan, let's connect to Root
                    { title: 'Promises & Async', parent: 'ES6+ Features', description: 'Handling asynchronous operations.', xp: 200 },
                    { title: 'Modules', parent: 'ES6+ Features', description: 'Import/Export patterns.' },

                    // Fix: Ensure ES6+ connects to something or make it a separate root? 
                    // Let's connect ES6+ to JS Fundamentals
                    // Note: 'JavaScript Core' doesn't exist. Changing parent to 'JS Fundamentals'.
                ]
            },
            { name: 'React', category: 'Frontend', description: 'Build modern user interfaces with React', icon: 'fa-code', color: '#61dafb', level: 3, xpRequired: 1500, estimatedHours: 50, position: { x: 100, y: 350 } },
            { name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework', icon: 'fa-code', color: '#42b883', level: 3, xpRequired: 1500, estimatedHours: 50, position: { x: 300, y: 350 } },
            { name: 'TypeScript', category: 'Frontend', description: 'JavaScript with type safety', icon: 'fa-code', color: '#3178c6', level: 3, xpRequired: 1200, estimatedHours: 35, position: { x: 200, y: 500 } },

            // Backend Skills
            { name: 'Node.js', category: 'Backend', description: 'JavaScript runtime for server-side development', icon: 'fa-server', color: '#339933', level: 2, xpRequired: 1000, estimatedHours: 40, position: { x: 500, y: 200 } },
            { name: 'Express.js', category: 'Backend', description: 'Fast, minimalist web framework for Node.js', icon: 'fa-server', color: '#000000', level: 2, xpRequired: 800, estimatedHours: 30, position: { x: 500, y: 350 } },
            { name: 'Python', category: 'Backend', description: 'Versatile programming language', icon: 'fa-code', color: '#3776ab', level: 2, xpRequired: 1000, estimatedHours: 45, position: { x: 650, y: 200 } },
            { name: 'Django', category: 'Backend', description: 'High-level Python web framework', icon: 'fa-server', color: '#092e20', level: 3, xpRequired: 1500, estimatedHours: 50, position: { x: 650, y: 350 } },

            // Database Skills
            { name: 'SQL', category: 'Database', description: 'Relational database management', icon: 'fa-database', color: '#4479a1', level: 2, xpRequired: 800, estimatedHours: 30, position: { x: 800, y: 50 } },
            { name: 'MongoDB', category: 'Database', description: 'NoSQL document database', icon: 'fa-database', color: '#47a248', level: 2, xpRequired: 800, estimatedHours: 30, position: { x: 800, y: 200 } },
            { name: 'PostgreSQL', category: 'Database', description: 'Advanced open-source database', icon: 'fa-database', color: '#336791', level: 3, xpRequired: 1000, estimatedHours: 35, position: { x: 800, y: 350 } },

            // DevOps Skills
            { name: 'Git & GitHub', category: 'DevOps', description: 'Version control and collaboration', icon: 'fa-code', color: '#f05032', level: 1, xpRequired: 500, estimatedHours: 15, position: { x: 950, y: 50 } },
            { name: 'Docker', category: 'DevOps', description: 'Containerization platform', icon: 'fa-server', color: '#2496ed', level: 3, xpRequired: 1200, estimatedHours: 40, position: { x: 950, y: 200 } },
            { name: 'AWS', category: 'DevOps', description: 'Cloud computing services', icon: 'fa-cloud', color: '#ff9900', level: 4, xpRequired: 2000, estimatedHours: 60, position: { x: 950, y: 350 } },

            // AI/ML Skills
            { name: 'Machine Learning', category: 'AI/ML', description: 'Build intelligent systems', icon: 'fa-brain', color: '#ff6f00', level: 4, xpRequired: 2500, estimatedHours: 80, position: { x: 1100, y: 200 } },
            { name: 'TensorFlow', category: 'AI/ML', description: 'Deep learning framework', icon: 'fa-brain', color: '#ff6f00', level: 5, xpRequired: 3000, estimatedHours: 100, position: { x: 1100, y: 350 } },

            // Design Skills
            { name: 'UI/UX Design', category: 'Design', description: 'Create beautiful user experiences', icon: 'fa-paint-brush', color: '#ff3366', level: 2, xpRequired: 1000, estimatedHours: 40, position: { x: 50, y: 200 } },
            { name: 'Figma', category: 'Design', description: 'Collaborative design tool', icon: 'fa-paint-brush', color: '#f24e1e', level: 2, xpRequired: 800, estimatedHours: 25, position: { x: 50, y: 350 } },

            // Mobile Skills
            { name: 'React Native', category: 'Mobile', description: 'Build native mobile apps with React', icon: 'fa-mobile', color: '#61dafb', level: 4, xpRequired: 2000, estimatedHours: 60, position: { x: 350, y: 500 }, topics: [{ title: 'React Native Basics' }] },

            // New Premium Skill
            {
                name: 'Frontend Architecture',
                category: 'Frontend',
                description: 'Design scalable and performant frontend systems Strategy.',
                icon: 'fa-cubes',
                color: '#ec4899',
                level: 4,
                xpRequired: 2500,
                estimatedHours: 60,
                position: { x: 350, y: 50 },
                topics: [
                    { title: 'Architecture Patterns', type: 'main', description: 'Core design patterns for frontend.', position: { x: 0, y: 0 } },

                    { title: 'State Management', parent: 'Architecture Patterns', description: 'Managing complex application state.', position: { x: -400, y: 250 } },
                    { title: 'Client State', parent: 'State Management', description: 'Redux, Zustand, Context.', position: { x: -500, y: 500 } },
                    { title: 'Server State', parent: 'State Management', description: 'React Query, SWR.', position: { x: -300, y: 500 } },

                    { title: 'Performance', parent: 'Architecture Patterns', description: 'Optimizing rendering and loading.', position: { x: -150, y: 250 } },
                    { title: 'Code Splitting', parent: 'Performance', description: 'Lazy loading and bundles.', position: { x: -200, y: 500 } },
                    { title: 'Web Vitals', parent: 'Performance', description: 'LCP, CLS, FID metrics.', position: { x: -50, y: 500 } },

                    { title: 'Testing Strategy', parent: 'Architecture Patterns', description: 'Ensuring reliability.', position: { x: 150, y: 250 } },
                    { title: 'E2E Testing', parent: 'Testing Strategy', description: 'Cypress, Playwright.', position: { x: 50, y: 500 } },
                    { title: 'Unit Testing', parent: 'Testing Strategy', description: 'Jest, Vitest, Testing Library.', position: { x: 250, y: 500 } },

                    { title: 'Scalability', parent: 'Architecture Patterns', description: 'Growing the codebase.', position: { x: 400, y: 250 } },
                    { title: 'Micro-frontends', parent: 'Scalability', description: 'Module Federation.', position: { x: 350, y: 500 } },
                    { title: 'Monorepos', parent: 'Scalability', description: 'Nx, Turborepo.', position: { x: 500, y: 500 } }
                ]
            },
        ]);

        console.log(`✅ Created ${skills.length} skills\n`);

        // Set prerequisites
        const htmlCss = skills.find(s => s.name === 'HTML & CSS');
        const js = skills.find(s => s.name === 'JavaScript');
        const react = skills.find(s => s.name === 'React');
        const nodejs = skills.find(s => s.name === 'Node.js');
        const express = skills.find(s => s.name === 'Express.js');
        const python = skills.find(s => s.name === 'Python');
        const django = skills.find(s => s.name === 'Django');
        const typescript = skills.find(s => s.name === 'TypeScript');
        const reactNative = skills.find(s => s.name === 'React Native');
        const ml = skills.find(s => s.name === 'Machine Learning');
        const tensorflow = skills.find(s => s.name === 'TensorFlow');

        // Update prerequisites
        await Skill.findByIdAndUpdate(js._id, { prerequisites: [htmlCss._id] });
        await Skill.findByIdAndUpdate(react._id, { prerequisites: [js._id] });
        await Skill.findByIdAndUpdate(skills.find(s => s.name === 'Vue.js')._id, { prerequisites: [js._id] });
        await Skill.findByIdAndUpdate(typescript._id, { prerequisites: [js._id] });
        await Skill.findByIdAndUpdate(express._id, { prerequisites: [nodejs._id] });
        await Skill.findByIdAndUpdate(django._id, { prerequisites: [python._id] });
        await Skill.findByIdAndUpdate(reactNative._id, { prerequisites: [react._id] });
        await Skill.findByIdAndUpdate(tensorflow._id, { prerequisites: [ml._id, python._id] });

        console.log('🔗 Set skill prerequisites\n');

        // ===== CREATE CAREER PATHS =====
        console.log('🎯 Creating career paths...');

        const careerPaths = await CareerPath.insertMany([
            {
                name: 'Full Stack Developer',
                description: 'Master both frontend and backend development',
                icon: 'fa-laptop-code',
                color: '#8b5cf6',
                category: 'Development',
                requiredSkills: [
                    { skill: htmlCss._id, proficiencyLevel: 4 },
                    { skill: js._id, proficiencyLevel: 4 },
                    { skill: react._id, proficiencyLevel: 3 },
                    { skill: nodejs._id, proficiencyLevel: 4 },
                    { skill: express._id, proficiencyLevel: 3 },
                    { skill: skills.find(s => s.name === 'MongoDB')._id, proficiencyLevel: 3 },
                    { skill: skills.find(s => s.name === 'Git & GitHub')._id, proficiencyLevel: 3 }
                ],
                estimatedDuration: '6-8 months',
                averageSalary: '$70k - $120k',
                jobTitles: ['Full Stack Developer', 'Software Engineer', 'Web Developer'],
                companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Startups']
            },
            {
                name: 'Frontend Developer',
                description: 'Specialize in building beautiful user interfaces',
                icon: 'fa-palette',
                color: '#3b82f6',
                category: 'Development',
                requiredSkills: [
                    { skill: htmlCss._id, proficiencyLevel: 5 },
                    { skill: js._id, proficiencyLevel: 5 },
                    { skill: react._id, proficiencyLevel: 4 },
                    { skill: typescript._id, proficiencyLevel: 3 },
                    { skill: skills.find(s => s.name === 'UI/UX Design')._id, proficiencyLevel: 3 }
                ],
                estimatedDuration: '4-6 months',
                averageSalary: '$60k - $100k',
                jobTitles: ['Frontend Developer', 'UI Developer', 'React Developer'],
                companies: ['Airbnb', 'Netflix', 'Spotify', 'Adobe']
            },
            {
                name: 'Backend Developer',
                description: 'Build robust server-side applications',
                icon: 'fa-server',
                color: '#10b981',
                category: 'Development',
                requiredSkills: [
                    { skill: nodejs._id, proficiencyLevel: 5 },
                    { skill: express._id, proficiencyLevel: 4 },
                    { skill: skills.find(s => s.name === 'MongoDB')._id, proficiencyLevel: 4 },
                    { skill: skills.find(s => s.name === 'SQL')._id, proficiencyLevel: 4 },
                    { skill: skills.find(s => s.name === 'Git & GitHub')._id, proficiencyLevel: 3 }
                ],
                estimatedDuration: '5-7 months',
                averageSalary: '$75k - $130k',
                jobTitles: ['Backend Developer', 'API Developer', 'Node.js Developer'],
                companies: ['Uber', 'LinkedIn', 'PayPal', 'Stripe']
            },
            {
                name: 'Data Scientist',
                description: 'Analyze data and build ML models',
                icon: 'fa-chart-line',
                color: '#f59e0b',
                category: 'Data Science',
                requiredSkills: [
                    { skill: python._id, proficiencyLevel: 5 },
                    { skill: ml._id, proficiencyLevel: 4 },
                    { skill: tensorflow._id, proficiencyLevel: 3 },
                    { skill: skills.find(s => s.name === 'SQL')._id, proficiencyLevel: 4 }
                ],
                estimatedDuration: '8-12 months',
                averageSalary: '$90k - $150k',
                jobTitles: ['Data Scientist', 'ML Engineer', 'AI Researcher'],
                companies: ['Google AI', 'OpenAI', 'Meta AI', 'Tesla']
            },
            {
                name: 'Mobile App Developer',
                description: 'Create native mobile applications',
                icon: 'fa-mobile-alt',
                color: '#ec4899',
                category: 'Mobile',
                requiredSkills: [
                    { skill: js._id, proficiencyLevel: 4 },
                    { skill: react._id, proficiencyLevel: 4 },
                    { skill: reactNative._id, proficiencyLevel: 4 }
                ],
                estimatedDuration: '6-8 months',
                averageSalary: '$70k - $120k',
                jobTitles: ['Mobile Developer', 'React Native Developer', 'App Developer'],
                companies: ['Instagram', 'WhatsApp', 'Discord', 'Snapchat']
            }
        ]);

        console.log(`✅ Created ${careerPaths.length} career paths\n`);

        // ===== CREATE ACHIEVEMENTS =====
        console.log('🏆 Creating achievements...');

        const achievements = await Achievement.insertMany([
            // XP Milestones
            { name: 'First Steps', description: 'Earn your first 100 XP', icon: 'fa-star', color: '#fbbf24', category: 'XP', criteria: { type: 'xp_milestone', value: 100 }, reward: { xp: 50, badge: '🌟' }, rarity: 'Common' },
            { name: 'Rising Star', description: 'Reach 1,000 XP', icon: 'fa-star', color: '#fbbf24', category: 'XP', criteria: { type: 'xp_milestone', value: 1000 }, reward: { xp: 100, badge: '⭐' }, rarity: 'Rare' },
            { name: 'XP Master', description: 'Accumulate 10,000 XP', icon: 'fa-trophy', color: '#f59e0b', category: 'XP', criteria: { type: 'xp_milestone', value: 10000 }, reward: { xp: 500, badge: '🏆', title: 'XP Master' }, rarity: 'Epic' },
            { name: 'Legend', description: 'Reach 50,000 XP', icon: 'fa-crown', color: '#8b5cf6', category: 'XP', criteria: { type: 'xp_milestone', value: 50000 }, reward: { xp: 1000, badge: '👑', title: 'Legend' }, rarity: 'Legendary' },

            // Course Achievements
            { name: 'Course Starter', description: 'Complete your first course', icon: 'fa-graduation-cap', color: '#3b82f6', category: 'Course', criteria: { type: 'course_complete', value: 1 }, reward: { xp: 100, badge: '🎓' }, rarity: 'Common' },
            { name: 'Knowledge Seeker', description: 'Complete 5 courses', icon: 'fa-book', color: '#3b82f6', category: 'Course', criteria: { type: 'course_complete', value: 5 }, reward: { xp: 300, badge: '📚' }, rarity: 'Rare' },
            { name: 'Scholar', description: 'Complete 10 courses', icon: 'fa-user-graduate', color: '#8b5cf6', category: 'Course', criteria: { type: 'course_complete', value: 10 }, reward: { xp: 500, badge: '🎖️', title: 'Scholar' }, rarity: 'Epic' },

            // Skill Achievements
            { name: 'Skill Unlocked', description: 'Master your first skill', icon: 'fa-check-circle', color: '#10b981', category: 'Skill', criteria: { type: 'skill_master', value: 1 }, reward: { xp: 150, badge: '✅' }, rarity: 'Common' },
            { name: 'Multi-Talented', description: 'Master 5 skills', icon: 'fa-star', color: '#10b981', category: 'Skill', criteria: { type: 'skill_master', value: 5 }, reward: { xp: 400, badge: '🌟' }, rarity: 'Rare' },
            { name: 'Polymath', description: 'Master 10 skills', icon: 'fa-brain', color: '#8b5cf6', category: 'Skill', criteria: { type: 'skill_master', value: 10 }, reward: { xp: 800, badge: '🧠', title: 'Polymath' }, rarity: 'Epic' },

            // Streak Achievements
            { name: 'Consistent Learner', description: 'Maintain a 7-day streak', icon: 'fa-fire', color: '#f97316', category: 'Streak', criteria: { type: 'streak_days', value: 7 }, reward: { xp: 200, badge: '🔥' }, rarity: 'Rare' },
            { name: 'Dedicated Student', description: 'Maintain a 30-day streak', icon: 'fa-fire', color: '#f97316', category: 'Streak', criteria: { type: 'streak_days', value: 30 }, reward: { xp: 500, badge: '🔥🔥' }, rarity: 'Epic' },
            { name: 'Unstoppable', description: 'Maintain a 100-day streak', icon: 'fa-fire', color: '#dc2626', category: 'Streak', criteria: { type: 'streak_days', value: 100 }, reward: { xp: 1000, badge: '🔥🔥🔥', title: 'Unstoppable' }, rarity: 'Legendary' },

            // Special Achievements
            { name: 'Early Adopter', description: 'Join the platform', icon: 'fa-rocket', color: '#6366f1', category: 'Special', criteria: { type: 'custom', value: 0 }, reward: { xp: 50, badge: '🚀' }, rarity: 'Common' },
            { name: 'Night Owl', description: 'Complete a lecture after midnight', icon: 'fa-moon', color: '#6366f1', category: 'Special', criteria: { type: 'custom', value: 0 }, reward: { xp: 100, badge: '🦉' }, rarity: 'Rare', isSecret: true }
        ]);

        console.log(`✅ Created ${achievements.length} achievements\n`);

        console.log('🎉 Seed data created successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - ${skills.length} Skills`);
        console.log(`   - ${careerPaths.length} Career Paths`);
        console.log(`   - ${achievements.length} Achievements`);
        console.log('\n✅ You can now use the Explore Tree feature!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
