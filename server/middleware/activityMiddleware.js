const User = require('../models/User');

const activityTracker = async (req, res, next) => {
    if (req.user && req.user._id) {
        try {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

            // Optimized: Atomic update with condition to reduce DB roundtrips
            await User.updateOne(
                {
                    _id: req.user._id,
                    $or: [
                        { lastSeen: { $lt: fiveMinutesAgo } },
                        { lastSeen: { $exists: false } }
                    ]
                },
                { $set: { lastSeen: now } }
            );
        } catch (e) {
            // Non-blocking
        }
    }
    next();
};

module.exports = activityTracker;
