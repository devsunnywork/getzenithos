const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const Lecture = mongoose.model('Lecture', new mongoose.Schema({
            title: String
        }));

        const lectures = await Lecture.find({}); // Find all lectures to be safe or filter by TAFL ones

        function cleanTitle(t) {
            let s = t.split('|')[0].trim();
            s = s.replace(/UNIT \d+/gi, '');
            s = s.replace(/AKTU/gi, '');
            s = s.replace(/Automata Theory/gi, '');
            s = s.replace(/#TAFL/gi, '');
            s = s.replace(/#TOC/gi, '');
            s = s.replace(/TOC/gi, '');
            s = s.replace(/in \s*$/gi, '');
            s = s.replace(/#learnCSwithArshi/gi, '');
            return s.trim();
        }

        let updated = 0;
        for (const lec of lectures) {
            const newTitle = cleanTitle(lec.title);
            if (newTitle !== lec.title) {
                lec.title = newTitle;
                await lec.save();
                updated++;
            }
        }

        console.log(`Cleaned ${updated} lecture titles.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
