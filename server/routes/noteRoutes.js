const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { auth } = require('../middleware/authMiddleware');

// Get notes for a specific course
router.get('/course/:courseId', auth, async (req, res) => {
    try {
        const notes = await Note.find({ course: req.params.courseId, user: req.user._id }).select('-__v');
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single note by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            console.warn(`[Zenith API] Note fetch 404/Unauthorized: ${req.params.id} for user ${req.user._id}`);
            return res.status(404).json({ message: 'Neural record not found or access denied.' });
        }
        res.json(note);
    } catch (err) {
        console.error(`[Zenith API] Note fetch 500: ${err.message} for ID: ${req.params.id}`);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
