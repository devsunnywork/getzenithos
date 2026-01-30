const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Skill = require('../server/models/Skill');

// Hardcoded URI for reliability in this script context
const MONGO_URI = "mongodb+srv://procodefy_db_user:procodey123@procodefyv2.1ewf8xr.mongodb.net/?appName=procodefyv2";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error("DB Connection Failed:", err);
        process.exit(1);
    });

async function run() {
    try {
        console.log("Reading Manual...");
        const absoluteManualPath = 'C:/Users/advik/.gemini/antigravity/brain/f5790563-3b96-4484-b2b4-3cbbe6bde05a/unity_phase1_manual.md';

        if (!fs.existsSync(absoluteManualPath)) {
            console.error(`Manual file not found at: ${absoluteManualPath}`);
            process.exit(1);
        }

        const manualContent = fs.readFileSync(absoluteManualPath, 'utf8');
        const chunks = manualContent.split(/^## /gm);
        const topicMap = {};

        console.log(`Parsing ${chunks.length} chunks...`);

        chunks.forEach(chunk => {
            const lines = chunk.split('\n');
            const firstLine = lines[0].trim();
            const titleMatch = firstLine.match(/^(\d+):\s*(.*)$/);

            if (titleMatch) {
                const id = titleMatch[1];
                const videoMatch = chunk.match(/\*\*Video Lecture\*\*:\s*\[(.*?)\]\((.*?)\)/);
                const videoUrl = videoMatch ? videoMatch[2] : "";

                lines.shift();
                const content = lines.join('\n').trim();
                topicMap[id] = { content, videoUrl };
            }
        });

        console.log(`Mapped ${Object.keys(topicMap).length} topics.`);

        // Find Skill
        const skill = await Skill.findOne({ "topics.title": { $regex: /^001/ } });

        if (!skill) {
            console.log("Target Skill not found! Querying by name 'C# & Unity'...");
            const altSkill = await Skill.findOne({ name: { $regex: /C#/ } });
            if (altSkill) console.log("Found via name:", altSkill.name);
            else {
                console.log("Still not found. Exiting.");
                process.exit(1);
            }
        } else {
            console.log(`Found Skill: ${skill.name}`);
        }

        const targetSkill = skill || await Skill.findOne({ name: { $regex: /C#/ } });
        let updatedCount = 0;

        targetSkill.topics.forEach(topic => {
            const idMatch = topic.title.match(/^(\d+):/);
            if (idMatch) {
                const id = idMatch[1];
                if (topicMap[id]) {
                    topic.content = topicMap[id].content;
                    topic.videoUrl = topicMap[id].videoUrl;
                    if (topic.videoUrl) {
                        topic.lectures = [{
                            title: "Main Lecture",
                            videoUrl: topic.videoUrl,
                            notes: "Phase 1 Essentials"
                        }];
                    }
                    updatedCount++;
                }
            }
        });

        console.log(`Updating ${updatedCount} topics... Saving...`);
        await targetSkill.save();
        console.log(`SUCCESS: Saved changes.`);
        process.exit();

    } catch (e) {
        console.error("Script Error:", e);
        process.exit(1);
    }
}

run();
