const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { auth } = require('../middleware/authMiddleware');

router.use(auth);

// Get all user goals
router.get('/', async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user._id });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Goal
router.post('/', async (req, res) => {
    try {
        const goal = new Goal({ ...req.body, user: req.user._id });
        await goal.save();
        res.status(201).json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Goal
router.patch('/:id', async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        res.json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Goal
router.delete('/:id', async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TASK MANAGEMENT (Nested in Goals) ---

// Add Task to Goal
router.post('/:goalId/tasks', async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.goalId, user: req.user._id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        goal.tasks.push(req.body);
        await goal.save();
        res.status(201).json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Task Status
router.patch('/:goalId/tasks/:taskId', async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.goalId, user: req.user._id });
        const task = goal.tasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        Object.assign(task, req.body);
        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
