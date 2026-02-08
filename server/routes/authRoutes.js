const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Profile
const { auth } = require('../middleware/authMiddleware');
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('enrolledCourses')
            .populate('courseProgress.courseId')
            .populate('activeCareers');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Profile
const upload = require('../middleware/uploadMiddleware');

router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
    try {
        // Multer should populate req.body, but if it's undefined (e.g. no text fields and middleware quirk), default to {}
        const { bio, personalInfo, password } = req.body || {};
        const user = await User.findById(req.user._id);

        if (password && password.trim() !== '') {
            user.password = password; // Mongoose pre-save hook will hash this
        }

        if (bio !== undefined) user.profile.bio = bio;

        // If a file was uploaded, save its path
        if (req.file) {
            user.profile.avatar = `/uploads/avatars/${req.file.filename}`;
        } else if (req.body.avatarUrl) {
            // Fallback if they sent a URL string explicitly (optional)
            user.profile.avatar = req.body.avatarUrl;
        }

        if (personalInfo) {
            // If personalInfo is sent as a JSON string (when using FormData), parse it
            let info = personalInfo;
            if (typeof personalInfo === 'string') {
                try {
                    info = JSON.parse(personalInfo);
                } catch (e) { }
            }
            user.profile.personalInfo = { ...user.profile.personalInfo, ...info };
        }

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cheat Code System
router.post('/cheat-code', auth, async (req, res) => {
    try {
        const { code } = req.body;

        // Input validation
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ message: 'INVALID INPUT: Code required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const upperCode = code.toUpperCase();

        // Check if code was already used
        if (user.usedCheatCodes && user.usedCheatCodes.includes(upperCode)) {
            return res.status(400).json({
                message: 'PROTOCOL ALREADY EXECUTED: This code has been used before',
                currentXp: user.xp
            });
        }

        let reward = "";
        let xpGained = 0;

        if (upperCode === 'ZENITH1000') {
            xpGained = 1000;
            reward = "NEURAL OVERLOAD: +1000 XP";
        } else if (upperCode === 'OMEGA') {
            xpGained = 5000;
            reward = "OMEGA PROTOCOL: +5000 XP ACCESS GRANTED";
        } else if (upperCode === 'ALPHA') {
            xpGained = 500;
            reward = "ALPHA STRIKE: +500 XP";
        } else {
            return res.status(400).json({ message: "INVALID PROTOCOL: ACCESS DENIED" });
        }

        // Award XP and mark code as used
        user.xp = (user.xp || 0) + xpGained;
        if (!user.usedCheatCodes) user.usedCheatCodes = [];
        user.usedCheatCodes.push(upperCode);
        await user.save();

        res.json({ message: reward, newXp: user.xp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const leaders = await User.find()
            .select('username xp profile.avatar badges')
            .sort({ xp: -1 })
            .limit(20);
        res.json(leaders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Claim Welcome Bonus
router.post('/claim-bonus', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.bonusClaimed) {
            return res.status(400).json({ message: 'PROTOCOL ERROR: Bonus already synchronization completed.' });
        }

        user.balance = (user.balance || 0) + 500;
        user.bonusClaimed = true;
        await user.save();

        res.json({
            message: 'ZENITH PROTOCOL: 500 Rupee credit synchronized successfully.',
            newBalance: user.balance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

