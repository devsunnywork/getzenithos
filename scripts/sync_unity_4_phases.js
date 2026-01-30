
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Skill = require('../server/models/Skill');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SKILL_DATA_DIR = path.resolve(__dirname, '../skill_data/unity');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
};

const parseTopicMarkdown = (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return [];
    }
    const text = fs.readFileSync(filePath, 'utf-8');
    const sections = text.split(/^## /gm).slice(1);

    return sections.map(section => {
        const lines = section.split('\n');
        const header = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();

        const match = header.match(/^(\d{3}):\s*(.*)$/);
        let idStr = null;
        let titleClean = header;

        if (match) {
            idStr = match[1];
            titleClean = match[2];
        }

        // Extract video (if any)
        const vidMatch = content.match(/\*\*Video Lecture\*\*:\s*\[(.*?)\]\((.*?)\)/);
        let videoUrl = "";
        if (vidMatch) videoUrl = vidMatch[2];

        return {
            id: idStr,
            title: titleClean,
            content: content,
            description: content.substring(0, 200) + "...",
            videoUrl: videoUrl,
            xp: 250 // High density nodes give more XP
        };
    });
};

const syncMasteryRoadmap = async () => {
    await connectDB();

    const skill = await Skill.findOne({ name: /Unity/i });
    if (!skill) {
        console.error("Unity Skill not found in DB!");
        process.exit(1);
    }

    console.log(`Syncing ${skill.name}...`);

    const files = [
        'phase1_csharp_mastery.md',
        'phase2_unity_foundations.md',
        'phase3_advanced_unity.md',
        'phase4_deployment_portfolio.md'
    ];

    let allTopics = [];
    files.forEach(file => {
        const topics = parseTopicMarkdown(path.join(SKILL_DATA_DIR, file));
        allTopics = allTopics.concat(topics);
    });

    console.log(`Successfully parsed ${allTopics.length} high-density topics.`);

    // Map to new topic objects with hierarchy and spatial positioning
    const newTopics = allTopics.map((t, index) => {
        // Calculate a vertical roadmap layout with slight zig-zag
        const row = index;
        const xPos = 400 + (index % 2 === 0 ? 50 : -50); // Alternating offset
        const yPos = 150 + (index * 150); // 150px vertical spacing

        const topicObj = {
            _id: new mongoose.Types.ObjectId(),
            title: t.title,
            content: t.content,
            description: t.description,
            xp: t.xp,
            videoUrl: t.videoUrl,
            type: 'main',
            parents: [],
            position: { x: xPos, y: yPos }
        };

        // Create linear hierarchy: each node depends on the previous one
        if (index > 0) {
            topicObj.parents = [allTopics[index - 1].title];
        }

        return topicObj;
    });

    // Replace existing topics with the new elite 18 nodes
    skill.topics = newTopics;
    skill.updatedAt = Date.now();

    await skill.save();
    console.log(`🚀 MASTER SYNC COMPLETE: ${newTopics.length} nodes injected into ${skill.name}.`);
    process.exit();
};

syncMasteryRoadmap();
