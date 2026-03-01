const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Problem = require('./models/Problem');

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randArr = (len, min, max) => Array.from({ length: len }, () => randInt(min, max));

const generators = {
    Easy: [
        {
            title: "Array Summation Protocol",
            desc: "Given an array of $N integers, compute and output the total sum of all elements.",
            xp: 10,
            tags: ["Array", "Math"],
            genTest: () => {
                const n = randInt(5, 50);
                const arr = randArr(n, -100, 100);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: arr.reduce((a, b) => a + b, 0).toString() };
            }
        },
        {
            title: "Maximum Element Discovery",
            desc: "Find and select the largest numeric value inside an array spanning $N integers.",
            xp: 15,
            tags: ["Array"],
            genTest: () => {
                const n = randInt(5, 50);
                const arr = randArr(n, -1000, 1000);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: Math.max(...arr).toString() };
            }
        },
        {
            title: "Even Number Frequency",
            desc: "Scan the provided array of $N integers and count exactly how many even numbers exist within it.",
            xp: 10,
            tags: ["Array", "Math"],
            genTest: () => {
                const n = randInt(5, 40);
                const arr = randArr(n, 1, 100);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: arr.filter(x => x % 2 === 0).length.toString() };
            }
        },
        {
            title: "String Compression Dummy",
            desc: "Receive a string. Do not compress it, but simply count its characters and return the total length multiplied by 2.",
            xp: 5,
            tags: ["String"],
            genTest: () => {
                const chars = 'abcdefghijklmnopqrstuvwxyz';
                const s = Array.from({ length: randInt(3, 20) }, () => chars[randInt(0, 25)]).join('');
                return { input: `${s}`, expectedOutput: (s.length * 2).toString() };
            }
        }
    ],
    Medium: [
        {
            title: "Ascending Sort Algorithm",
            desc: "Implement a robust sorting algorithm. Sort an array of $N integers in ascending order. Important: Print the sorted numbers on a single line, separated by spaces.",
            xp: 35,
            tags: ["Array", "Sorting"],
            genTest: () => {
                const n = randInt(10, 80);
                const arr = randArr(n, -500, 500);
                const sorted = [...arr].sort((a, b) => a - b);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: sorted.join(' ') };
            }
        },
        {
            title: "Modulo Product Calculator",
            desc: "Given an array of $N integers, calculate the product of all elements. To prevent overflow, output the resulting product modulo 1000000007.",
            xp: 40,
            tags: ["Array", "Math"],
            genTest: () => {
                const n = randInt(5, 15);
                const arr = randArr(n, 1, 50);
                let p = 1n;
                for (let x of arr) p = (p * BigInt(x)) % 1000000007n;
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: p.toString() };
            }
        },
        {
            title: "Min-Max Distance Finder",
            desc: "Find the absolute difference between the greatest and smallest elements in an array of size $N.",
            xp: 25,
            tags: ["Array"],
            genTest: () => {
                const n = randInt(10, 50);
                const arr = randArr(n, -200, 200);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: (Math.max(...arr) - Math.min(...arr)).toString() };
            }
        }
    ],
    Hard: [
        {
            title: "Sum of Squares Engine",
            desc: "Given an array of $N integers, compute the sum of the squares of each individual element.",
            xp: 60,
            tags: ["Array", "Math"],
            genTest: () => {
                const n = randInt(10, 100);
                const arr = randArr(n, -50, 50);
                const sum = arr.reduce((a, b) => a + (b * b), 0);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: sum.toString() };
            }
        },
        {
            title: "Above-Average Counter",
            desc: "Determine the integer mean (floor of average) of a $N sized array. Count how many numbers are strictly greater than this average value.",
            xp: 75,
            tags: ["Array"],
            genTest: () => {
                const n = randInt(10, 100);
                const arr = randArr(n, 1, 1000);
                const avg = Math.floor(arr.reduce((a, b) => a + b, 0) / n);
                const count = arr.filter(x => x > avg).length;
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: count.toString() };
            }
        },
        {
            title: "Consecutive Difference Evaluator",
            desc: "Traverse a $N sized array and sum up the absolute differences between every adjacent pair of elements.",
            xp: 85,
            tags: ["Array", "Two Pointers"],
            genTest: () => {
                const n = randInt(5, 50);
                const arr = randArr(n, -100, 100);
                let diff = 0;
                for (let i = 0; i < n - 1; i++) diff += Math.abs(arr[i] - arr[i + 1]);
                return { input: `${n}\n${arr.join(' ')}`, expectedOutput: diff.toString() };
            }
        }
    ]
};

const generateProblems = (difficulty, targetCount) => {
    const list = [];
    const gens = generators[difficulty];

    for (let i = 1; i <= targetCount; i++) {
        const gen = gens[i % gens.length];

        const testCases = [];
        for (let t = 0; t < 5; t++) testCases.push(gen.genTest());

        list.push({
            title: `${gen.title} - Variant ${i.toString().padStart(3, '0')}`,
            description: gen.desc.replace('$N', Math.floor(Math.random() * 100) + 10),
            difficulty: difficulty,
            xpReward: gen.xp,
            tags: gen.tags,
            examples: [
                { input: testCases[0].input, output: testCases[0].expectedOutput }
            ],
            testCases: testCases.map((tc, idx) => ({ ...tc, isHidden: idx > 0 })), // Hide all but the first test case
            constraints: { timeLimitMs: 2000, memoryLimitMb: 256 }
        });
    }
    return list;
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding.");

        console.log("Purging old problems...");
        await Problem.deleteMany({});

        console.log("Generating exactly 600 complex Leetcode-style programmatic variants...");
        const easyProbs = generateProblems("Easy", 200);
        const medProbs = generateProblems("Medium", 200);
        const hardProbs = generateProblems("Hard", 200);

        const allProbs = [...easyProbs, ...medProbs, ...hardProbs];

        await Problem.insertMany(allProbs);
        console.log(`Successfully injected ${allProbs.length} Neural Challenges into the Matrix.`);

        process.exit();
    } catch (e) {
        console.error("Injection failed:", e);
        process.exit(1);
    }
}

seedDB();
