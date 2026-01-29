const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // Adjust path if needed

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://zenith:zenith123@cluster0.yu8k7.mongodb.net/zenith-os?retryWrites=true&w=majority');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
};

const debug = async () => {
    await connectDB();

    console.log('\n--- ALL COURSES & SKILLS ---');
    const courses = await Course.find({});
    courses.forEach(c => {
        console.log(`Course: ${c.title} | Skills: ${JSON.stringify(c.skills)} | ID: ${c._id}`);
    });

    console.log('\n--- USER ENROLLMENTS ---');
    // Fetch a user (grab the first one or specific if known)
    const user = await User.findOne({}).populate('enrolledCourses.courseId');
    if (user) {
        console.log(`User: ${user.username}`);
        user.enrolledCourses.forEach(e => {
            const c = e.courseId;
            if (c) {
                console.log(` - Enrolled: ${c.title} | Skills: ${JSON.stringify(c.skills)}`);
            } else {
                console.log(` - Enrolled: [NULL/DELETED COURSE]`);
            }
        });
    } else {
        console.log('No users found.');
    }

    process.exit();
};

debug();
