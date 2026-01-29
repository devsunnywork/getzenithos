const express = require('express');
const router = express.Router();
const Health = require('../models/Health');
const { auth } = require('../middleware/authMiddleware');

// Use auth middleware for all routes in this file
router.use(auth);

// Get all health logs
router.get('/', async (req, res) => {
    try {
        const logs = await Health.find().sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a health log
router.post('/', async (req, res) => {
    const log = new Health(req.body);
    try {
        const newLog = await log.save();
        res.status(201).json(newLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
