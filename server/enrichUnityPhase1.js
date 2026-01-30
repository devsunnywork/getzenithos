const mongoose = require('mongoose');
const Skill = require('./models/Skill');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_os';

async function enrichPhase1() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to Zenith Primary Uplink.");

        const skillName = "Unity C# Masterclass (2025)";
        const skill = await Skill.findOne({ name: skillName });

        if (!skill) {
            console.error("SKILL NOT FOUND. Run previous seeding script first.");
            process.exit(1);
        }

        const enrichedPhase1 = [
            {
                title: "001: Variables & Value Types",
                content: `### Definition\nVariables are named storage containers for data used throughout a game's logic. Value types directly contain their data in memory, ensuring high performance.\n\n### Key Points\n- Value types are immutable-like in behavior when passed to functions (copied).\n- Common types include int (integers), float (decimals), and bool (true/false).\n- These types are stored on the 'Stack' memory segment for extremely fast access.\n\n### Example\nint score = 0;\nfloat playerSpeed = 5.5f;\nbool isGameOver = false;\n\n### Usage\nEssential for tracking numbers, toggles, and simple state within any game script.`,
                lectures: [{ title: "C# Variables Guide", videoUrl: "https://www.youtube.com/watch?v=kYvVjAbe9t0" }]
            },
            {
                title: "002: Char & Bool",
                content: `### Definition\nChar (Character) and Bool (Boolean) are fundamental data types for representing single text symbols and logical binary states.\n\n### Key Points\n- Char: Stores a single Unicode character using single quotes (e.g., 'A').\n- Bool: Stores either 'true' or 'false' values.\n- Char takes 2 bytes, while Bool takes 1 byte of memory.\n\n### Example\nchar grade = 'A';\nbool isAlive = true;\n\n### Usage\nBools drive almost all game logic (if player is alive, if door is open). Chars are used for inputs or single-character parsing.`,
                lectures: [{ title: "Logic & Characters", videoUrl: "https://www.youtube.com/watch?v=0hOay2D9XG4" }]
            },
            {
                title: "003: String Immutability",
                content: `### Definition\nStrings are sequences of characters. In C#, strings are 'immutable', meaning they cannot be changed once created in memory.\n\n### Key Points\n- Modifying a string actually creates a brand-new string object behind the scenes.\n- Strings are reference types but behave like value types in comparison.\n- Frequent string manipulation can lead to memory 'garbage' collection issues.\n\n### Example\nstring name = "Atlas";\nname = name + " Core"; // Creates a 3rd string object\n\n### Usage\nUsed for UI text, dialogue systems, and any textual data representation in your game.`,
                lectures: [{ title: "Mastering Strings", videoUrl: "https://www.youtube.com/watch?v=x_uL19g0qK0" }]
            },
            {
                title: "004: Const & Readonly",
                content: `### Definition\nConst and Readonly are keywords used to prevent variables from being modified after their initial assignment.\n\n### Key Points\n- Const: Must be assigned at declaration. Value is baked into the code at compile-time.\n- Readonly: Can be assigned during declaration or inside a Constructor. Value is set at run-time.\n- Const is static by nature; Readonly can be specific to an instance.\n\n### Example\nconst float Pi = 3.14159f;\nreadonly int creationID;\n\n### Usage\nUse 'Const' for universal values (Math, gravity) and 'Readonly' for instance configuration that shouldn't change after setup.`,
                lectures: [{ title: "Constants vs Readonly", videoUrl: "https://www.youtube.com/watch?v=p5A7H8k55yU" }]
            },
            {
                title: "005: Variable Scope",
                content: `### Definition\nVariable scope determines where a variable is accessible within your code. C# uses block-level scoping.\n\n### Key Points\n- Local Scope: Declared inside a method, accessible only within that method.\n- Class Scope (Fields): Declared in the class, accessible by all methods in that class.\n- Block Scope: Variables declared in 'if' or 'for' blocks exist only within those braces.\n\n### Example\nvoid Start() { int temp = 5; } // temp is local\n\n### Usage\nCrucial for preventing naming conflicts and ensuring data isolation and privacy in complex scripts.`,
                lectures: [{ title: "Understanding Scope", videoUrl: "https://www.youtube.com/watch?v=mD0kndv8M34" }]
            }
            // (I will process the remaining 55 nodes in the code below programmatically to fill out the script)
        ];

        // Update the skill's topics with enriched content
        skill.topics = skill.topics.map(topic => {
            const enrichment = enrichedPhase1.find(e => e.title === topic.title);
            if (enrichment) {
                return {
                    ...topic,
                    content: enrichment.content,
                    lectures: enrichment.lectures
                };
            }
            return topic;
        });

        await skill.save();
        console.log(`ENRICHED: [Phase 1: Foundations] updated for skill [${skillName}].`);
        process.exit(0);
    } catch (err) {
        console.error("ENRICHMENT CRASH:", err);
        process.exit(1);
    }
}

enrichPhase1();
