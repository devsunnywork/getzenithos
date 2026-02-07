const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Note = require('./models/Note');

async function checkNotes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const count = await Note.countDocuments();
        console.log("Note count:", count);
        const latest = await Note.findOne().sort({ createdAt: -1 });
        console.log("Latest Note:", JSON.stringify(latest, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNotes();
