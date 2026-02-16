const express = require('express');
const router = express.Router();
const Academic = require('../models/Academic');
const { auth } = require('../middleware/authMiddleware');

// Use auth middleware for all routes in this file
router.use(auth);

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Academic.find({ user: req.user._id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a task
router.post('/', async (req, res) => {
    const task = new Academic({ ...req.body, user: req.user._id });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
