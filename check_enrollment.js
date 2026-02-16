const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ username: 'SYSTEM_ADMIN' });
        const course = await Course.findOne({ title: 'TAFL' });

        if (!user) console.log('User SYSTEM_ADMIN not found');
        if (!course) console.log('Course TAFL not found');

        if (user && course) {
            const isEnrolled = user.enrolledCourses.map(id => id.toString()).includes(course._id.toString());
            console.log(`User ${user.username} is enrolled in ${course.title}: ${isEnrolled}`);
            console.log('User Enrolled IDs:', user.enrolledCourses);
            console.log('Course ID:', course._id);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });
