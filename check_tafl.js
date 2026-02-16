const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
        const tafl = await Course.findOne({ title: 'TAFL' });
        console.log('TAFL Course:');
        console.log(JSON.stringify(tafl, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });
