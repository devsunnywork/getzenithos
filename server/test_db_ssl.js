const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testConnection = async () => {
    console.log("Starting SSL Connection Diagnostic...");
    console.log("Target URI:", process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@")); // Mask password

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            tls: true,
            // Uncomment the line below ONLY for testing if you suspect local SSL issues
            // tlsAllowInvalidCertificates: true 
        });
        console.log("✅ Diagnostic Success: SSL Handshake and Connection Established.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Diagnostic Failure!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);

        if (err.message.includes('alert number 80') || err.message.includes('IP whitelist')) {
            console.log("\n--- TROUBLESHOOTING STEPS ---");
            console.log("1. Go to MongoDB Atlas -> Network Access.");
            console.log("2. REMOVE your existing IP entries.");
            console.log("3. Click 'ADD IP ADDRESS' -> 'Allow Access from Anywhere' (0.0.0.0/0).");
            console.log("4. Wait 1-2 minutes for Atlas to deploy the change.");
            console.log("5. Run this diagnostic again.");
        }
        process.exit(1);
    }
};

testConnection();
