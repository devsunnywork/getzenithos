const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.resolve(__dirname, './.env') });

const User = require('./server/models/User');
// Register other models that might be populated
require('./server/models/Course');
require('./server/models/Skill');
require('./server/models/Achievement');
require('./server/models/Lecture');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            // Find any user
            const userRecord = await User.findOne();
            if (!userRecord) {
                console.log('No user found to test.');
                process.exit(0);
            }

            console.log(`Testing profile population for user: ${userRecord.username} (${userRecord._id})`);

            const populatedUser = await User.findById(userRecord._id)
                .select('-password')
                .populate('enrolledCourses')
                .populate('courseProgress.courseId')
                .populate('activeCareers');

            console.log('Population successful!');
            console.log('Enrolled Courses:', populatedUser.enrolledCourses.length);
            console.log('Active Careers:', populatedUser.activeCareers.length);

            process.exit(0);
        } catch (err) {
            console.error('Population Failed with Error:');
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });
