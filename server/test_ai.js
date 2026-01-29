const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "Yes (" + process.env.GEMINI_API_KEY.substr(0, 4) + "...)" : "No");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you online?");
        const response = result.response;
        console.log(`SUCCESS: ${modelName} responded: ${response.text()}`);
        return true;
    } catch (e) {
        console.log(`FAILED: ${modelName} error: ${e.message}`);
        return false;
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-pro");
    await testModel("gemini-1.0-pro");
}

run();
