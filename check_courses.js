const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
        const courses = await Course.find({}, 'title price isFree isPublished');
        console.log('Courses:');
        courses.forEach(c => {
            console.log(`${c._id} | ${c.title} | Price: ${c.price} | Free: ${c.isFree} | Published: ${c.isPublished}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.log('Error:', err);
        process.exit(1);
    });
