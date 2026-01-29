const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const { auth } = require('../middleware/authMiddleware');

// Submit a request (Topup, Complaint, Contact)
router.post('/request', auth, async (req, res) => {
    try {
        const { type, subject, message, amount } = req.body;
        const request = new Support({
            user: req.user._id,
            type,
            subject,
            message,
            amount
        });
        await request.save();
        res.status(201).json({ message: 'Request beamed to command center.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get my requests
router.get('/my-requests', auth, async (req, res) => {
    try {
        const requests = await Support.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
