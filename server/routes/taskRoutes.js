const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const User = require('../models/User');

// Get All Tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, priority, xpReward } = req.body;
        const newTask = new Task({
            user: req.user.id,
            title,
            description,
            priority,
            xpReward: xpReward || 50
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Task Status & XP
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        const oldStatus = task.status;
        task.status = status;
        await task.save();

        // Award XP if completed
        if (status === 'complete' && oldStatus !== 'complete') {
            const user = await User.findById(req.user.id);
            user.xp = (user.xp || 0) + (task.xpReward || 50);
            await user.save();
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete Task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
