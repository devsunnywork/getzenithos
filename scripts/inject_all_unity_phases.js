
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Skill = require('../server/models/Skill');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DATA_DIR = path.resolve(__dirname, '../data/unity_roadmap');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
};

const parseManual = (filePath) => {
    if (!fs.existsSync(filePath)) {
        console.error("Manual not found at:", filePath);
        return [];
    }
    const text = fs.readFileSync(filePath, 'utf-8');
    const sections = text.split(/^## /gm).slice(1);

    return sections.map(section => {
        const endOfLine = section.indexOf('\n');
        const header = section.substring(0, endOfLine).trim();
        const content = section.substring(endOfLine + 1).trim();

        const match = header.match(/^(\d{3}):\s*(.*)$/);
        let idStr = null;
        let titleClean = header;

        if (match) {
            idStr = match[1];
            titleClean = match[2];
        }

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
            content: content,
            videoUrl: videoUrl,
            videoTitle: videoTitle
        };
    });
};

const injectAllPhases = async () => {
    await connectDB();

    const skill = await Skill.findOne({ name: /Unity/i });
    if (!skill) {
        console.error("Unity Skill not found!");
        process.exit(1);
    }
    console.log(`Targeting Skill: ${skill.name} (${skill.topics.length} topics)`);

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} manual files.`);

    let totalUpdates = 0;

    for (const file of files) {
        console.log(`\n--- Processing ${file} ---`);
        const manualTopics = parseManual(path.join(DATA_DIR, file));
        console.log(`Parsed ${manualTopics.length} topics.`);

        let fileUpdates = 0;

        manualTopics.forEach(mTopic => {
            const dbTopicIndex = skill.topics.findIndex(t => {
                const tTitle = t.title.toLowerCase().trim();
                const mFull = mTopic.fullHeader.toLowerCase().trim();
                const mClean = mTopic.title.toLowerCase().trim();

                // Match by full header "001: Variables..." or just the topic ID "001" or the title "Variables..."
                return tTitle.includes(mClean) || tTitle === mFull || (mTopic.id && tTitle.includes(mTopic.id));
            });

            if (dbTopicIndex !== -1) {
                const t = skill.topics[dbTopicIndex];
                t.content = mTopic.content;
                if (mTopic.videoUrl) {
                    t.lectures = [{
                        title: mTopic.videoTitle,
                        videoUrl: mTopic.videoUrl,
                        notes: `Injected from ${file}`
                    }];
                    t.videoUrl = mTopic.videoUrl;
                }
                fileUpdates++;
            }
        });

        console.log(`Updated ${fileUpdates} topics from ${file}.`);
        totalUpdates += fileUpdates;
    }

    console.log(`\nCommitting ${totalUpdates} total updates to database...`);
    await skill.save();
    console.log("Database Sync Complete!");
    process.exit();
};

injectAllPhases();
