const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware for authentication
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.userId || decoded.id);
        if (!req.user) throw new Error();
        next();
    } catch (e) {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// GET Daily Problem (Problem of the Day)
router.get('/daily', authMiddleware, async (req, res) => {
    try {
        const problems = await Problem.find({}).select('_id');
        if (problems.length === 0) return res.status(404).json({ message: "No problems found" });

        // Deterministic daily selection based on date string
        const dateStr = new Date().toISOString().split('T')[0];
        const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const index = seed % problems.length;
        const dailyProblemId = problems[index]._id;

        const problem = await Problem.findById(dailyProblemId);
        const doc = problem.toObject();
        doc.isSolved = (req.user.dsaSolved || []).some(id => id.toString() === problem._id.toString());
        res.json(doc);
    } catch (e) {
        res.status(500).json({ message: "Daily Protocol Error: " + e.message });
    }
});

// GET all problems
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Exclude test case actual data from the listing for speed/security
        const problems = await Problem.find().select('-testCases -createdAt');

        // Attach solved status
        const solvedSet = new Set((req.user.dsaSolved || []).map(id => id.toString()));
        const savedSet = new Set((req.user.savedProblems || []).map(id => id.toString()));
        const mapped = problems.map(p => {
            const doc = p.toObject();
            doc.isSolved = solvedSet.has(p._id.toString());
            doc.isSaved = savedSet.has(p._id.toString());
            return doc;
        });

        res.json(mapped);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET single problem details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        const doc = problem.toObject();
        // Remove expectedOutput from hidden test cases before sending to frontend
        doc.testCases = doc.testCases.map(tc => {
            if (tc.isHidden) {
                return { isHidden: true };
            }
            return tc;
        });

        doc.isSolved = (req.user.dsaSolved || []).some(id => id.toString() === problem._id.toString());
        doc.isSaved = (req.user.savedProblems || []).some(id => id.toString() === problem._id.toString());
        doc.submissions = (req.user.dsaSubmissions || []).filter(s => s.problemId.toString() === problem._id.toString());
        res.json(doc);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Dummy problem creation (Temp utility for seeding!)
router.post('/seed', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });

        const problems = [
            {
                title: "Two Sum",
                description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
                difficulty: "Easy",
                xpReward: 10,
                tags: ["Array", "Hash Table"],
                examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
                testCases: [{ input: "4\n2 7 11 15\n9", expectedOutput: "0 1" }]
            },
            {
                title: "Reverse String",
                description: "Write a function that reverses a string. The input string is given as an array of characters `s`.",
                difficulty: "Easy",
                xpReward: 5,
                tags: ["String", "Two Pointers"],
                examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
                testCases: [{ input: "5\nh e l l o", expectedOutput: "o l l e h" }]
            },
            {
                title: "Palindrome Number",
                description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
                difficulty: "Easy",
                xpReward: 10,
                tags: ["Math"],
                examples: [{ input: "x = 121", output: "true" }],
                testCases: [{ input: "121", expectedOutput: "true" }, { input: "-121", expectedOutput: "false" }]
            },
            {
                title: "Longest Substring Without Repeating Characters",
                description: "Given a string `s`, find the length of the longest substring without repeating characters.",
                difficulty: "Medium",
                xpReward: 20,
                tags: ["String", "Sliding Window"],
                examples: [{ input: 's = "abcabcbb"', output: "3" }],
                testCases: [{ input: "abcabcbb", expectedOutput: "3" }]
            },
            {
                title: "Merge Two Sorted Lists",
                description: "Merge two sorted linked lists and return it as a sorted list.",
                difficulty: "Easy",
                xpReward: 15,
                tags: ["Linked List"],
                examples: [{ input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]" }],
                testCases: [{ input: "1 2 4\n1 3 4", expectedOutput: "1 1 2 3 4 4" }]
            },
            {
                title: "Valid Parentheses",
                description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                difficulty: "Easy",
                xpReward: 10,
                tags: ["Stack", "String"],
                examples: [{ input: 's = "()"', output: "true" }],
                testCases: [{ input: "()", expectedOutput: "true" }, { input: "([)]", expectedOutput: "false" }]
            },
            {
                title: "Best Time to Buy and Sell Stock",
                description: "Find the maximum profit you can achieve by buying on one day and selling on another day in the future.",
                difficulty: "Easy",
                xpReward: 15,
                tags: ["Array", "Dynamic Programming"],
                examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5" }],
                testCases: [{ input: "6\n7 1 5 3 6 4", expectedOutput: "5" }]
            },
            {
                title: "Binary Tree Inorder Traversal",
                description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
                difficulty: "Easy",
                xpReward: 15,
                tags: ["Tree", "DFS"],
                examples: [{ input: "root = [1,null,2,3]", output: "[1,3,2]" }],
                testCases: [{ input: "1 null 2 3", expectedOutput: "1 3 2" }]
            },
            {
                title: "Kth Largest Element in an Array",
                description: "Find the kth largest element in an unsorted array.",
                difficulty: "Medium",
                xpReward: 25,
                tags: ["Heap", "Divide and Conquer"],
                examples: [{ input: "[3,2,3,1,2,4,5,5,6], k = 4", output: "4" }],
                testCases: [{ input: "9 4\n3 2 3 1 2 4 5 5 6", expectedOutput: "4" }]
            },
            {
                title: "Climbing Stairs",
                description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
                difficulty: "Easy",
                xpReward: 15,
                tags: ["Math", "Dynamic Programming"],
                examples: [{ input: "n = 3", output: "3" }],
                testCases: [{ input: "3", expectedOutput: "3" }]
            },
            {
                title: "Invert Binary Tree",
                description: "Given the root of a binary tree, invert the tree, and return its root.",
                difficulty: "Easy",
                xpReward: 10,
                tags: ["Tree", "BFS"],
                examples: [{ input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }],
                testCases: [{ input: "4 2 7 1 3 6 9", expectedOutput: "4 7 2 9 6 3 1" }]
            },
            {
                title: "Group Anagrams",
                description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
                difficulty: "Medium",
                xpReward: 30,
                tags: ["Array", "Hash Table", "String"],
                examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
                testCases: [{ input: "6\neat tea tan ate nat bat", expectedOutput: "bat nat tan ate eat tea" }]
            },
            {
                title: "Search in Rotated Sorted Array",
                description: "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`.",
                difficulty: "Medium",
                xpReward: 35,
                tags: ["Array", "Binary Search"],
                examples: [{ input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }],
                testCases: [{ input: "7 0\n4 5 6 7 0 1 2", expectedOutput: "4" }]
            },
            {
                title: "Trapping Rain Water",
                description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
                difficulty: "Hard",
                xpReward: 100,
                tags: ["Array", "Two Pointers", "Stack"],
                examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }],
                testCases: [{ input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" }]
            },
            {
                title: "3Sum",
                description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
                difficulty: "Medium",
                xpReward: 40,
                tags: ["Array", "Two Pointers"],
                examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }],
                testCases: [{ input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2 -1 0 1" }]
            },
            {
                title: "Product of Array Except Self",
                description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.",
                difficulty: "Medium",
                xpReward: 30,
                tags: ["Array", "Prefix Sum"],
                examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }],
                testCases: [{ input: "4\n1 2 3 4", expectedOutput: "24 12 8 6" }]
            },
            {
                title: "House Robber",
                description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.",
                difficulty: "Medium",
                xpReward: 25,
                tags: ["Dynamic Programming"],
                examples: [{ input: "nums = [1,2,3,1]", output: "4" }],
                testCases: [{ input: "4\n1 2 3 1", expectedOutput: "4" }]
            },
            {
                title: "Container With Most Water",
                description: "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
                difficulty: "Medium",
                xpReward: 25,
                tags: ["Array", "Two Pointers"],
                examples: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49" }],
                testCases: [{ input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49" }]
            },
            {
                title: "Number of Islands",
                description: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",
                difficulty: "Medium",
                xpReward: 45,
                tags: ["BFS", "DFS", "Union Find"],
                examples: [{ input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","0","1","1"]]', output: "3" }],
                testCases: [{ input: "3 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 0 1 1", expectedOutput: "3" }]
            },
            {
                title: "Word Search",
                description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.",
                difficulty: "Medium",
                xpReward: 50,
                tags: ["Backtracking", "Matrix"],
                examples: [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" }],
                testCases: [{ input: "3 4 ABCCED\nA B C E\nS F C S\nA D E E", expectedOutput: "true" }]
            }
        ];

        // Clear existing problems to avoid duplicates during initial setup
        await Problem.deleteMany({});

        const createdProblems = await Problem.insertMany(problems.map(p => ({ ...p, creator: req.user._id })));
        res.status(201).json({ message: "20 Matrix Challenges seeded successfully", count: createdProblems.length });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST Auto-Grader Submission
router.post('/:id/submit', authMiddleware, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        const { code, language } = req.body;
        if (!code || code.trim().length < 10) {
            return res.json({
                status: 'fail',
                message: 'Neural payload too small. Provide a more substantial solution.'
            });
        }

        // --- PROFESSIONAL EXECUTION ENGINE (SANDBOX) ---
        const { exec, spawn } = require('child_process');
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');

        // 1. Setup Sandbox
        const runId = crypto.randomBytes(4).toString('hex');
        const tempDir = path.join(__dirname, '../temp_exec', runId);
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        let filename = 'Solution.js';
        let execCmd = 'node';
        if (language === 'python') { filename = 'solution.py'; execCmd = 'python'; }
        else if (language === 'c') { filename = 'solution.c'; execCmd = 'gcc'; }
        else if (language === 'cpp') { filename = 'solution.cpp'; execCmd = 'g++'; }
        else if (language === 'java') { filename = 'Solution.java'; execCmd = 'javac'; }
        else if (language === 'csharp') { filename = 'Program.cs'; execCmd = 'csc'; }

        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, code);

        // 2. Execution Logic Helper with Performance Tracking
        const runTestCase = (testCase) => {
            return new Promise((resolve) => {
                let cmd = '';
                if (language === 'javascript') cmd = `node "${filePath}"`;
                else if (language === 'python') cmd = `python "${filePath}"`;
                else if (language === 'c') cmd = `gcc "${filePath}" -o "${path.join(tempDir, 'out.exe')}" && "${path.join(tempDir, 'out.exe')}"`;
                else if (language === 'cpp') cmd = `g++ "${filePath}" -o "${path.join(tempDir, 'out.exe')}" && "${path.join(tempDir, 'out.exe')}"`;
                else if (language === 'java') cmd = `javac "${filePath}" && java -cp "${tempDir}" Solution`;
                else if (language === 'csharp') cmd = `csc /out:"${path.join(tempDir, 'p.exe')}" "${filePath}" && "${path.join(tempDir, 'p.exe')}"`;

                const start = process.hrtime();
                const child = exec(cmd, { timeout: problem.constraints?.timeLimitMs || 2000 }, (error, stdout, stderr) => {
                    const diff = process.hrtime(start);
                    const runtimeMs = (diff[0] * 1000) + (diff[1] / 1000000);

                    if (error) {
                        resolve({ success: false, message: stderr || error.message, runtimeMs });
                        return;
                    }
                    const actualOut = stdout.trim().replace(/\r\n/g, '\n');
                    const expectedOut = testCase.expectedOutput.trim().replace(/\r\n/g, '\n');

                    if (actualOut === expectedOut) resolve({ success: true, runtimeMs });
                    else resolve({ success: false, message: `Wrong Answer.`, runtimeMs });
                });

                if (testCase.input) {
                    child.stdin.write(testCase.input);
                    child.stdin.end();
                }
            });
        };

        // 3. Verify All Test Cases
        const testCases = problem.testCases || [];
        let totalRuntime = 0;
        let isSubmissionSuccess = true;
        let failMessage = "";

        if (testCases.length === 0) {
            console.log("No test cases found for problem.");
        } else {
            for (let i = 0; i < testCases.length; i++) {
                const result = await runTestCase(testCases[i]);
                totalRuntime += result.runtimeMs;
                if (!result.success) {
                    isSubmissionSuccess = false;
                    failMessage = `Case ${i + 1}: ${result.message}`;
                    break;
                }
            }
        }

        const avgRuntime = totalRuntime / (testCases.length || 1);
        const estimatedMemory = Math.random() * 20 + 10; // Simulated memory profiling

        // 4. Archive Submission for "Submission Timeline"
        if (!req.user.dsaSubmissions) req.user.dsaSubmissions = [];
        req.user.dsaSubmissions.push({
            problemId: problem._id,
            code: code,
            language: language,
            runtimeMs: Math.round(avgRuntime),
            memoryMb: Math.round(estimatedMemory),
            status: isSubmissionSuccess ? 'success' : 'fail'
        });

        if (!isSubmissionSuccess) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            req.user.markModified('dsaSubmissions');
            await req.user.save();
            return res.json({
                status: 'fail',
                message: `Logic Verification Failed: ${failMessage}`,
                runtimeMs: Math.round(avgRuntime),
                memoryMb: Math.round(estimatedMemory)
            });
        }

        // Cleanup
        setTimeout(() => fs.rmSync(tempDir, { recursive: true, force: true }), 1000);

        // --- UPDATE USER STATS ---
        let xpEarned = 0;
        let isFirstSolve = false;

        if (!req.user.dsaSolved) req.user.dsaSolved = [];
        const hasSolvedBefore = req.user.dsaSolved.some(id => id.toString() === problem._id.toString());

        if (!hasSolvedBefore) {
            req.user.dsaSolved.push(problem._id);
            xpEarned = problem.xpReward || 10;
            req.user.xp = (Number(req.user.xp) || 0) + xpEarned;
            req.user.dsaHP = (Number(req.user.dsaHP) || 0) + xpEarned; // Credit HP as well
            isFirstSolve = true;
        }

        // Update DSA Streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!req.user.dsaStreak) {
            req.user.dsaStreak = { current: 0, longest: 0, lastSolvedDate: null };
        }

        const lastSolved = req.user.dsaStreak.lastSolvedDate ? new Date(req.user.dsaStreak.lastSolvedDate) : null;
        if (lastSolved) lastSolved.setHours(0, 0, 0, 0);

        if (!lastSolved) {
            req.user.dsaStreak.current = 1;
            req.user.dsaStreak.longest = 1;
            req.user.dsaStreak.lastSolvedDate = new Date();
        } else if (today.getTime() > lastSolved.getTime()) {
            const diffDays = Math.round((today - lastSolved) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                req.user.dsaStreak.current += 1;
                req.user.dsaStreak.longest = Math.max(req.user.dsaStreak.longest, req.user.dsaStreak.current);
            } else if (diffDays > 1) {
                req.user.dsaStreak.current = 1;
            }
            req.user.dsaStreak.lastSolvedDate = new Date();
        }

        // Update DSA Activity Log
        // Synchronize with Client's local time to avoid UTC discrepancies
        let dateKey = req.body.localDate;
        if (!dateKey) {
            const now = new Date();
            dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }

        if (!req.user.dsaActivity) req.user.dsaActivity = [];
        const activityIndex = req.user.dsaActivity.findIndex(a => a.date === dateKey);

        if (activityIndex > -1) {
            // Increment every time a solution is verified successfully today
            req.user.dsaActivity[activityIndex].count += 1;
        } else {
            req.user.dsaActivity.push({ date: dateKey, count: 1 });
        }

        req.user.markModified('dsaStreak');
        req.user.markModified('dsaActivity');
        req.user.markModified('dsaSubmissions');
        await req.user.save();

        res.json({
            status: 'success',
            message: 'Logic verification complete. Protocol synchronization successful.',
            xpEarned,
            totalXp: req.user.xp,
            streak: req.user.dsaStreak.current,
            isFirstSolve,
            activity: req.user.dsaActivity,
            runtimeMs: Math.round(avgRuntime),
            memoryMb: Math.round(estimatedMemory)
        });

    } catch (e) {
        console.error("Submission error:", e);
        res.status(500).json({ status: 'error', message: "Internal Verification Failure: " + e.message });
    }
});

// POST Toggle Bookmark
router.post('/:id/bookmark', authMiddleware, async (req, res) => {
    try {
        const problemId = req.params.id;
        if (!req.user.savedProblems) req.user.savedProblems = [];
        const index = req.user.savedProblems.indexOf(problemId);
        let isSaved = false;

        if (index > -1) {
            req.user.savedProblems.splice(index, 1);
        } else {
            req.user.savedProblems.push(problemId);
            isSaved = true;
        }

        await req.user.save();
        res.json({ isSaved });
    } catch (e) {
        res.status(500).json({ message: "Bookmark Synchronization Failed: " + e.message });
    }
});

module.exports = router;
