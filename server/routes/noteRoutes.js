const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { auth } = require('../middleware/authMiddleware');

// Get notes for a specific course
router.get('/course/:courseId', auth, async (req, res) => {
    try {
        const notes = await Note.find({ course: req.params.courseId }).select('-__v');
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single note by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            console.warn(`[Zenith API] Note fetch 404: ${req.params.id}`);
            return res.status(404).json({ message: 'Neural record not found.' });
        }
        res.json(note);
    } catch (err) {
        console.error(`[Zenith API] Note fetch 500: ${err.message} for ID: ${req.params.id}`);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
