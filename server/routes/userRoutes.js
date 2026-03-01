const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/authMiddleware');

// Get Compact DSA Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('username xp dsaHP dsaStreak dsaSolved savedProblems dsaActivity profile.avatar dsaSubmissions');

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return only what is needed for the DSA Arena
        res.json({
            id: user._id,
            username: user.username,
            avatarUrl: user.profile?.avatar || '',
            xp: user.xp || 0,
            hp: user.dsaHP || 0,
            dsaStreak: user.dsaStreak || { current: 0, longest: 0 },
            dsaSolved: user.dsaSolved || [],
            savedProblems: user.savedProblems || [],
            dsaActivity: user.dsaActivity || [],
            dsaSubmissions: user.dsaSubmissions || []
        });
    } catch (err) {
        res.status(500).json({ message: "Profile Synchronization Failed: " + err.message });
    }
});

// GET Global Leaderboard
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ dsaHP: -1 })
            .limit(10)
            .select('username dsaHP profile.avatar dsaStreak.longest');

        res.json(topUsers.map(u => ({
            username: u.username,
            hp: u.dsaHP || 0,
            avatar: u.profile?.avatar || '',
            highestStreak: u.dsaStreak?.longest || 0
        })));
    } catch (err) {
        res.status(500).json({ message: "Leaderboard Extraction Failed: " + err.message });
    }
});

module.exports = router;
