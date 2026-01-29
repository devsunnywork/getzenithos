const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Public: Get branding settings
router.get('/branding', async (req, res) => {
    try {
        const settings = await Setting.find({ key: { $in: ['systemName', 'systemVersion', 'accent'] } });
        const map = {};
        settings.forEach(s => map[s.key] = s.value);
        res.json(map);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
