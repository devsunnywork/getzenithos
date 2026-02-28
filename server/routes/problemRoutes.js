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

// GET all problems
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Exclude test case actual data from the listing for speed/security
        const problems = await Problem.find().select('-testCases -createdAt');

        // Attach solved status
        const solvedSet = new Set(req.user.dsaSolved.map(id => id.toString()));
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

        doc.isSolved = req.user.dsaSolved.some(id => id.toString() === problem._id.toString());
        doc.isSaved = (req.user.savedProblems || []).some(id => id.toString() === problem._id.toString());
        res.json(doc);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Dummy problem creation (Temp utility for seeding!)
router.post('/seed', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });

        const problem = new Problem({
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
            difficulty: "Easy",
            xpReward: 10,
            constraints: { timeLimitMs: 2000, memoryLimitMb: 256 },
            examples: [
                { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
                { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" }
            ],
            testCases: [
                { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
                { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: false },
                { input: "2\n3 3\n6", expectedOutput: "0 1", isHidden: true }
            ],
            creator: req.user._id,
            tags: ["Array", "Hash Table"]
        });

        await problem.save();
        res.status(201).json(problem);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST Auto-Grader Submission
router.post('/:id/submit', authMiddleware, async (req, res) => {
    res.status(501).json({ message: "Auto-grader engine under construction." });
});

// POST Toggle Bookmark
router.post('/:id/bookmark', authMiddleware, async (req, res) => {
    try {
        const problemId = req.params.id;
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
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
