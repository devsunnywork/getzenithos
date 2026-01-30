
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Skill = require('../server/models/Skill');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Path to the manual
const MANUAL_PATH = String.raw`C:\Users\advik\.gemini\antigravity\brain\f5790563-3b96-4484-b2b4-3cbbe6bde05a\unity_phase1_manual.md`;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
};

const parseManual = () => {
    if (!fs.existsSync(MANUAL_PATH)) {
        console.error("Manual not found at:", MANUAL_PATH);
        process.exit(1);
    }
    const text = fs.readFileSync(MANUAL_PATH, 'utf-8');

    // Split by header "## "
    // Note: The file starts with "# Unity..." so the first split might be general intro
    const sections = text.split(/^## /gm).slice(1); // Skip the first part (Title)

    const topics = sections.map(section => {
        // First line is Title: "001: Variables & Value Types"
        const endOfLine = section.indexOf('\n');
        const header = section.substring(0, endOfLine).trim();
        const content = section.substring(endOfLine + 1).trim();

        // Extract ID and pure Title
        // Format: "001: Variables & Value Types" or just title?
        const match = header.match(/^(\d{3}):\s*(.*)$/);
        let idStr = null;
        let titleClean = header;

        if (match) {
            idStr = match[1];
            titleClean = match[2];
        }

        // Extract Video Link if present for validation (optional, logic handles it in content)
        // Regex: **Video Lecture**: [Title](URL)
        const vidMatch = content.match(/\*\*Video Lecture\*\*:\s*\[(.*?)\]\((.*?)\)/);
        let videoUrl = null;
        let videoTitle = "Watch Lecture";
        if (vidMatch) {
            videoTitle = vidMatch[1];
            videoUrl = vidMatch[2];
        }

        return {
            fullHeader: header,
            id: idStr,
            title: titleClean,
            content: content, // Full markdown content
            videoUrl: videoUrl,
            videoTitle: videoTitle
        };
    });

    return topics;
};

const injectData = async () => {
    await connectDB();

    // Find the master skill
    const skill = await Skill.findOne({ name: /Unity/i });
    if (!skill) {
        console.error("Unity Skill not found!");
        process.exit(1);
    }
    console.log(`Targeting Skill: ${skill.name} (${skill.topics.length} topics)`);

    const manualTopics = parseManual();
    console.log(`Parsed ${manualTopics.length} topics from manual.`);

    let updates = 0;

    // Iterate manual topics and find matching DB topics
    manualTopics.forEach(mTopic => {
        // Try to match by "001: Title" OR just "Title"
        // Also DB title might comprise "001: Title"

        const dbTopicIndex = skill.topics.findIndex(t => {
            // Normalize for comparison
            const tTitle = t.title.toLowerCase().trim();
            const mFull = mTopic.fullHeader.toLowerCase().trim();
            const mClean = mTopic.title.toLowerCase().trim();

            return tTitle.includes(mClean) || tTitle === mFull;
        });

        if (dbTopicIndex !== -1) {
            // Update
            const t = skill.topics[dbTopicIndex];

            // Set Content
            t.content = mTopic.content;

            // Generate Lecture Object if URL exists
            if (mTopic.videoUrl) {
                // Remove existing lectures? Or append?
                // User said "Search on YouTube" button ui is dynamic now. 
                // But we should populate 'lectures' array as robust fallback/source.
                t.lectures = [{
                    title: mTopic.videoTitle,
                    videoUrl: mTopic.videoUrl,
                    notes: "Phase 1 Verified Source"
                }];
                // Also set legacy field for safety
                t.videoUrl = mTopic.videoUrl;
            }

            updates++;
            // console.log(`Updated [${mTopic.fullHeader}]`);
        } else {
            console.warn(`No DB match for manual topic: ${mTopic.fullHeader}`);
        }
    });

    console.log(`Committing ${updates} updates to database...`);
    await skill.save();
    console.log("Database Sync Complete!");
    process.exit();
};

injectData();
