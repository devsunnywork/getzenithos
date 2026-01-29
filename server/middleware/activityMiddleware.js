const User = require('../models/User');

const activityTracker = async (req, res, next) => {
    if (req.user && req.user.id) {
        try {
            await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
        } catch (e) {
            // Non-blocking
        }
    }
    next();
};

module.exports = activityTracker;
