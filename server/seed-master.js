const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Problem = require('./models/Problem');

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randArr = (len, min, max) => Array.from({ length: len }, () => randInt(min, max));

// 15+ Diverse Topics Definition
const topics = [
    "Array", "String", "Math", "Bit Manipulation", "Sliding Window",
    "Two Pointers", "Binary Search", "Hashing", "Stack", "Matrix",
    "Sorting", "Greedy", "Dynamic Programming", "Graph", "Tree"
];

const companies = ["Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft", "Uber", "Airbnb", "LinkedIn", "Goldman Sachs"];

const faangNames = [
    "Two Sum", "Add Two Numbers", "Longest Palindromic Substring", "Zigzag Conversion", "Reverse Integer",
    "String to Integer (atoi)", "Palindrome Number", "Regular Expression Matching", "Container With Most Water",
    "Integer to Roman", "Roman to Integer", "Longest Common Prefix", "3Sum", "3Sum Closest", "Letter Combinations of a Phone Number",
    "4Sum", "Remove Nth Node From End of List", "Valid Parentheses", "Merge Two Sorted Lists", "Generate Parentheses",
    "Merge k Sorted Lists", "Swap Nodes in Pairs", "Reverse Nodes in k-Group", "Remove Duplicates from Sorted Array",
    "Remove Element", "Find the Index of the First Occurrence in a String", "Divide Two Integers", "Substring with Concatenation of All Words",
    "Next Permutation", "Longest Valid Parentheses", "Search in Rotated Sorted Array", "Find First and Last Position of Element in Sorted Array",
    "Valid Sudoku", "Sudoku Solver", "Count and Say", "Combination Sum", "Combination Sum II", "First Missing Positive",
    "Trapping Rain Water", "Multiply Strings", "Wildcard Matching", "Jump Game II", "Permutations", "Permutations II",
    "Rotate Image", "Group Anagrams", "Pow(x, n)", "N-Queens", "N-Queens II", "Maximum Subarray"
];

// Logic Engine for Generators
const generators = {
    "Array": {
        desc: "Given an array of $N integers, find the sum of all elements.",
        diff: "Easy", xp: 10,
        gen: () => {
            const n = randInt(5, 50); const arr = randArr(n, -100, 100);
            return { input: `${n}\n${arr.join(' ')}`, output: arr.reduce((a, b) => a + b, 0).toString() };
        }
    },
    "String": {
        desc: "Given a string of length $N, return the string completely reversed.",
        diff: "Easy", xp: 10,
        gen: () => {
            const s = Array.from({ length: randInt(5, 20) }, () => String.fromCharCode(randInt(97, 122))).join('');
            return { input: s, output: s.split('').reverse().join('') };
        }
    },
    "Math": {
        desc: "Find the factorial of a given integer $N modulo 1000000007.",
        diff: "Medium", xp: 25,
        gen: () => {
            const n = randInt(1, 20);
            let f = 1n; for (let i = 1n; i <= BigInt(n); i++) f = (f * i) % 1000000007n;
            return { input: n.toString(), output: f.toString() };
        }
    },
    "Bit Manipulation": {
        desc: "Given an integer $N, count the number of set bits (1s) in its binary representation.",
        diff: "Easy", xp: 15,
        gen: () => {
            const n = randInt(1, 10000);
            return { input: n.toString(), output: n.toString(2).split('1').length - 1 + "" };
        }
    },
    "Sliding Window": {
        desc: "Given an array of $N integers, find the maximum sum of any contiguous subarray of size 3.",
        diff: "Medium", xp: 30,
        gen: () => {
            const n = randInt(5, 50); const arr = randArr(n, 1, 100);
            let mx = -Infinity;
            for (let i = 0; i <= n - 3; i++) mx = Math.max(mx, arr[i] + arr[i + 1] + arr[i + 2]);
            return { input: `${n}\n${arr.join(' ')}`, output: mx.toString() };
        }
    },
    "Two Pointers": {
        desc: "Given a sorted array of $N integers and a target $T, output 1 if any two elements sum to $T, else 0.",
        diff: "Medium", xp: 35,
        gen: () => {
            const n = randInt(5, 30); const arr = randArr(n, -50, 50).sort((a, b) => a - b);
            const target = randInt(-50, 50);
            let found = false;
            let l = 0, r = n - 1;
            while (l < r) {
                const s = arr[l] + arr[r];
                if (s === target) { found = true; break; }
                else if (s < target) l++; else r--;
            }
            return { input: `${n} ${target}\n${arr.join(' ')}`, output: found ? "1" : "0" };
        }
    },
    "Binary Search": {
        desc: "Given a sorted array of $N integers, find if element $X exists. Output 1 if exists, 0 otherwise.",
        diff: "Medium", xp: 35,
        gen: () => {
            const n = randInt(5, 50); const arr = randArr(n, -100, 100).sort((a, b) => a - b);
            const x = randPick(arr); // Ensure it often exists, or maybe add chance to not exist
            return { input: `${n} ${x}\n${arr.join(' ')}`, output: arr.includes(x) ? "1" : "0" };
        }
    },
    "Hashing": {
        desc: "Find the frequency of the most frequent element in an array of $N integers.",
        diff: "Medium", xp: 40,
        gen: () => {
            const n = randInt(5, 50); const arr = randArr(n, 1, 10);
            const map = {}; arr.forEach(x => map[x] = (map[x] || 0) + 1);
            return { input: `${n}\n${arr.join(' ')}`, output: Math.max(...Object.values(map)).toString() };
        }
    },
    "Stack": {
        desc: "Given a string of characters '(' and ')', output 1 if balanced, 0 otherwise.",
        diff: "Medium", xp: 40,
        gen: () => {
            let s = ""; const n = randInt(2, 6) * 2;
            for (let i = 0; i < n; i++) s += randPick(["(", ")"]);
            let bal = 0, valid = true;
            for (let c of s) {
                if (c === '(') bal++; else bal--;
                if (bal < 0) { valid = false; break; }
            }
            if (bal !== 0) valid = false;
            return { input: s, output: valid ? "1" : "0" };
        }
    },
    "Matrix": {
        desc: "Given an $N x $N matrix, compute the sum of its main diagonal.",
        diff: "Medium", xp: 35,
        gen: () => {
            const n = randInt(2, 5);
            const mat = Array.from({ length: n }, () => randArr(n, 1, 20));
            let s = 0; for (let i = 0; i < n; i++) s += mat[i][i];
            const inp = `${n}\n` + mat.map(r => r.join(' ')).join('\n');
            return { input: inp, output: s.toString() };
        }
    },
    "Sorting": {
        desc: "Given $N integers, output them sorted in ascending order.",
        diff: "Easy", xp: 15,
        gen: () => {
            const n = randInt(5, 20); const arr = randArr(n, -100, 100);
            return { input: `${n}\n${arr.join(' ')}`, output: [...arr].sort((a, b) => a - b).join(' ') };
        }
    },
    "Greedy": {
        desc: "You have $N items with given costs and a budget $B. Output the maximum number of items you can buy.",
        diff: "Medium", xp: 40,
        gen: () => {
            const n = randInt(5, 20); const b = randInt(10, 100);
            const arr = randArr(n, 1, 30).sort((x, y) => x - y);
            let qty = 0, sum = 0;
            for (let x of arr) { if (sum + x <= b) { sum += x; qty++; } else break; }
            return { input: `${n} ${b}\n${arr.join(' ')}`, output: qty.toString() };
        }
    },
    "Dynamic Programming": {
        desc: "Given an array of $N integers, find the maximum contiguous subarray sum (Kadane's).",
        diff: "Hard", xp: 80,
        gen: () => {
            const n = randInt(5, 30); const arr = randArr(n, -50, 50);
            let mx = -Infinity, cur = 0;
            for (let x of arr) { cur = Math.max(x, cur + x); mx = Math.max(mx, cur); }
            return { input: `${n}\n${arr.join(' ')}`, output: mx.toString() };
        }
    },
    "Graph": {
        desc: "Given $N nodes and $M edges (pairs of nodes), find the highest degree (number of connections) of any single node.",
        diff: "Hard", xp: 85,
        gen: () => {
            const n = randInt(3, 10); const m = randInt(2, 10);
            const deg = new Array(n + 1).fill(0);
            let edgesStr = "";
            for (let i = 0; i < m; i++) {
                const u = randInt(1, n); const v = randInt(1, n);
                deg[u]++; deg[v]++;
                edgesStr += `${u} ${v}\n`;
            }
            return { input: `${n} ${m}\n${edgesStr.trim()}`, output: Math.max(...deg).toString() };
        }
    },
    "Tree": {
        desc: "Given a complete binary tree represented as an array of $N integers, find the sum of all leaf nodes.",
        diff: "Hard", xp: 90,
        gen: () => {
            const n = randInt(5, 15); const arr = randArr(n, 1, 20);
            let sum = 0;
            for (let i = 0; i < n; i++) {
                // If left child index (2*i + 1) is >= n, it's a leaf
                if (2 * i + 1 >= n) sum += arr[i];
            }
            return { input: `${n}\n${arr.join(' ')}`, output: sum.toString() };
        }
    }
};

const createTestCases = (genFunc) => {
    const tcs = [];
    for (let i = 0; i < 5; i++) tcs.push(genFunc());
    return tcs.map((tc, idx) => ({ ...tc, isHidden: idx > 0 }));
};

let problemIdCounter = 1000;

const generateGenericProblems = (targetCount, diffFilter) => {
    const list = [];
    // Filter topics by difficulty
    const applicableTopics = topics.filter(t => generators[t].diff === diffFilter);
    if (applicableTopics.length === 0) applicableTopics.push("Array"); // fallback

    for (let i = 1; i <= targetCount; i++) {
        const topic = randPick(applicableTopics);
        const eng = generators[topic];
        const tcs = createTestCases(eng.gen);

        list.push({
            title: `System Node [${topic.toUpperCase()}] - ${problemIdCounter++}`,
            description: eng.desc.replace(/\$N|\$T|\$B|\$X|\$M/g, () => randInt(10, 50)),
            difficulty: eng.diff,
            xpReward: eng.xp,
            tags: [topic],
            examples: [{ input: tcs[0].input, output: tcs[0].output }],
            testCases: tcs.map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: tc.isHidden })),
            constraints: { timeLimitMs: 2000, memoryLimitMb: 256 }
        });
    }
    return list;
};

const generateFAANGProblems = () => {
    const list = [];
    faangNames.forEach(name => {
        const topic = randPick(topics);
        const eng = generators[topic];
        const tcs = createTestCases(eng.gen);
        const company = randPick(companies);

        list.push({
            title: name,
            description: eng.desc.replace(/\$N|\$T|\$B|\$X|\$M/g, () => randInt(10, 50)),
            difficulty: eng.diff,
            xpReward: eng.xp + 10, // Bonus for FAANG
            tags: [topic, company, "FAANG"],
            examples: [{ input: tcs[0].input, output: tcs[0].output }],
            testCases: tcs.map(tc => ({ input: tc.input, expectedOutput: tc.output, isHidden: tc.isHidden })),
            constraints: { timeLimitMs: 2000, memoryLimitMb: 256 }
        });
    });
    return list;
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for High-Tier Seeding.");

        console.log("Purging old problems...");
        await Problem.deleteMany({});

        console.log("Generating 550 generic matrix challenges across 15+ Topics...");
        const d1 = generateGenericProblems(200, "Easy");
        const d2 = generateGenericProblems(200, "Medium");
        const d3 = generateGenericProblems(150, "Hard");

        console.log("Forging 50 FAANG Corporation specific algorithm problems...");
        const faangProbs = generateFAANGProblems(); // 50 items

        const allProbs = [...d1, ...d2, ...d3, ...faangProbs];

        await Problem.insertMany(allProbs);
        console.log(`✅ Inject sequence complete. Total Problems Inserted: ${allProbs.length} (Including 50 Top FAANG tags)`);

        process.exit();
    } catch (e) {
        console.error("Injection failed:", e);
        process.exit(1);
    }
};

seedDB();
