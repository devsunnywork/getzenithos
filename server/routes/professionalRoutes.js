const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const { auth } = require('../middleware/authMiddleware');

// Use auth middleware for all routes in this file
router.use(auth);

// Get all skills
router.get('/', async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a skill
router.post('/', async (req, res) => {
    const skill = new Skill(req.body);
    try {
        const newSkill = await skill.save();
        res.status(201).json(newSkill);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
