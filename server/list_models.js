const https = require('https');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Querying Gemini API for available models...");

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error.message);
            } else if (json.models) {
                console.log("\nAVAILABLE MODELS:");
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name}`); // e.g., models/gemini-pro
                    }
                });
            } else {
                console.log("No models found or unexpected format:", json);
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Request Error:", err.message);
});
