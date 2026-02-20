const mongoose = require('mongoose');

// Disable Mongoose buffering to prevent 10s hangs on disconnected operations
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Fast fail if DB unreachable
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (err) {
        console.error(`❌ Database Error: ${err.message}`);
        console.log("⚠️  Proceeding without database connection (Buffering Disabled)");
        return false;
    }
};

module.exports = connectDB;
