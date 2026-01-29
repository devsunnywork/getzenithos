const express = require('express');
const router = express.Router();
const Personal = require('../models/Personal');
const { auth } = require('../middleware/authMiddleware');

// Use auth middleware for all routes in this file
router.use(auth);

// Get all entries
router.get('/', async (req, res) => {
    try {
        const entries = await Personal.find().sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create an entry
router.post('/', async (req, res) => {
    const entry = new Personal(req.body);
    try {
        const newEntry = await entry.save();
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
