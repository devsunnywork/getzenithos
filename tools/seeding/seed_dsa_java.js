
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../../server/models/Course');
const Unit = require('../../server/models/Unit');
const Lecture = require('../../server/models/Lecture');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB using URI from .env...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error("❌ DB Connection Error:", err.message);
        console.error("Full Error Details:", err);
        process.exit(1);
    }
};

const playlistVideos = [
    "Basics | Output, Input, Variables, Operators",
    "If Else in Java",
    "Loops in Java",
    "Pattern Printing in Java",
    "Methods in Java",
    "Arrays in Java",
    "Time & Space Complexity in Java",
    "Bubble, Selection & Insertion Sort",
    "Binary Search in Java",
    "Strings in Java",
    "2D Arrays in Java",
    "Recursion Part 1",
    "Recursion Part 2",
    "Merge Sort in Java",
    "Cyclic Sort in Java",
    "Object Oriented Programming | OOP",
    "Linked List Part 1",
    "Linked List Part 2",
    "Stacks in Java",
    "Queues in Java",
    "Binary Tree 01",
    "Binary Tree 02",
    "Binary Search Tree 01",
    "Binary Search Tree 02",
    "Heap 01",
    "Heap 02",
    "Hashmap 01",
    "Hashmap 02",
    "Bit Manipulation in Java",
    "DP 01 | Dynamic Programming",
    "DP 02 | Dynamic Programming",
    "DP 03 | Dynamic Programming",
    "Binary Search On Answer",
    "Backtracking in Java",
    "Graph 01"
];

const seedDSA = async () => {
    await connectDB();

    console.log("Cleaning existing DSA course if any...");
    const existingCourse = await Course.findOne({ title: 'DSA in Java' });
    if (existingCourse) {
        console.log("Removing previous course data...");
        // Find units and lectures to clean up
        const units = await Unit.find({ course: existingCourse._id });
        for (const unit of units) {
            await Lecture.deleteMany({ unit: unit._id });
        }
        await Unit.deleteMany({ course: existingCourse._id });
        await Course.deleteOne({ _id: existingCourse._id });
    }

    console.log("Creating DSA in Java Course...");
    const course = new Course({
        title: 'DSA in Java',
        description: 'Complete Data Structures and Algorithms in Java. From basics to advanced topics like DP and Graphs.',
        thumbnail: 'https://i.ytimg.com/vi/m3fg2PRY1u4/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBPb-op0jsCYx92vBMaFUXEl9-ynQ',
        price: 100,
        instructor: 'Raghav Sir',
        category: 'Academic',
        isFree: false,
        isPublished: true,
        features: ['35+ Lectures', 'Industry Standard DSA', 'Java Implementation', 'Problem Solving'],
        skills: ['Java', 'DSA', 'Algorithms', 'Data Structures']
    });

    await course.save();
    console.log(`Course created: ${course._id}`);

    const unit = new Unit({
        course: course._id,
        title: 'Complete DSA Protocol',
        order: 1
    });

    await unit.save();
    console.log(`Unit created: ${unit._id}`);

    const lectures = [];
    for (let i = 0; i < playlistVideos.length; i++) {
        const lecture = new Lecture({
            unit: unit._id,
            title: `LEC ${String(i + 1).padStart(2, '0')}: ${playlistVideos[i]}`,
            videoUrl: 'https://www.youtube.com/playlist?list=PLqM7alHXFySGwOTADxwHrgH8m_XpgrB-k', // Playlist link as placeholder
            content: `Deep dive into ${playlistVideos[i]} using Java. Mastering this module is essential for coding interviews.`,
            duration: "45:00", // Placeholder
            order: i + 1
        });
        await lecture.save();
        lectures.push(lecture._id);
        console.log(`Created Lecture ${i + 1}: ${lecture.title}`);
    }

    unit.lectures = lectures;
    await unit.save();

    course.units = [unit._id];
    await course.save();

    console.log("🚀 DSA IN JAVA COURSE SEEDED SUCCESSFULLY!");
    process.exit();
};

seedDSA();
