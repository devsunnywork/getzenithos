const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const Course = mongoose.model('Course', new mongoose.Schema({
            title: String,
            units: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }]
        }));
        const Unit = mongoose.model('Unit', new mongoose.Schema({
            title: String,
            lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }]
        }));
        const Lecture = mongoose.model('Lecture', new mongoose.Schema({
            title: String,
            videoUrl: String,
            duration: String
        }));

        const tafl = await Course.findOne({ title: 'TAFL' });
        if (!tafl) {
            console.log('Course TAFL not found');
            process.exit(1);
        }

        const data = JSON.parse(require('fs').readFileSync('playlist_results.json', 'utf8'));

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

        async function createUnit(unitName, unitData) {
            const lectureIds = [];
            const count = Math.min(unitData.titles.length, unitData.videoIds.length);

            for (let i = 0; i < count; i++) {
                const rawTitle = unitData.titles[i];
                if (['Keyboard shortcuts', 'Playback', 'General', 'Comments', 'Subtitles'].some(kw => rawTitle.includes(kw))) continue;

                const title = cleanTitle(rawTitle);
                const videoId = unitData.videoIds[i];

                const lec = new Lecture({
                    title,
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    duration: '10:00' // Placeholder
                });
                await lec.save();
                lectureIds.push(lec._id);
            }

            const unit = new Unit({
                title: unitName,
                lectures: lectureIds
            });
            await unit.save();
            return unit._id;
        }

        console.log('Adding Unit 2...');
        const u2Id = await createUnit('Unit 2: Regular Expressions & Finite Automata', data.unit2);

        console.log('Adding Unit 3...');
        const u3Id = await createUnit('Unit 3: Context Free Grammar & Languages', data.unit3);

        console.log('Adding Unit 4...');
        const u4Id = await createUnit('Unit 4: Pushdown Automata (PDA)', data.unit4);

        tafl.units.push(u2Id, u3Id, u4Id);
        await tafl.save();

        console.log('TAFL Expansion Complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
