const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Unit = require('../models/Unit');
const Lecture = require('../models/Lecture');
const Setting = require('../models/Setting');
const Transaction = require('../models/Transaction');
const Support = require('../models/Support');
const Note = require('../models/Note');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(auth, isAdmin);

// --- DASHBOARD TELEMETRY ---

router.get('/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();
        const transactionCount = await Transaction.countDocuments();
        const totalRevenue = await Transaction.aggregate([
            { $match: { type: 'purchase' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            users: userCount,
            courses: courseCount,
            transactions: transactionCount,
            revenue: totalRevenue[0]?.total || 0,
            status: 'Operational'
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- USER MODERATION & TELEMETRY ---

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ lastSeen: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users/:id/deep', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('enrolledCourses')
            .populate('courseProgress.courseId');

        const transactions = await Transaction.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json({ user, transactions });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/users/:id/moderation', async (req, res) => {
    try {
        const { status, blockedReason, blockedUntil } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Operative not found.' });

        user.status = status || user.status;
        user.blockedReason = blockedReason !== undefined ? blockedReason : user.blockedReason;
        if (blockedUntil !== undefined) user.blockedUntil = blockedUntil ? new Date(blockedUntil) : null;

        await user.save();
        res.json(user);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) return res.status(404).json({ message: 'Operative not found.' });
        res.json(user);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/users/:id/role', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
        res.json(user);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.role === 'admin') return res.status(403).json({ message: 'Cannot terminate another admin.' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Operative terminated.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/users/:id/balance', async (req, res) => {
    try {
        const { amount, type, reason } = req.body; // type: 'add' or 'subtract'
        const change = type === 'add' ? Number(amount) : -Number(amount);
        const user = await User.findByIdAndUpdate(req.params.id, { $inc: { balance: change } }, { new: true });

        // Log transaction
        const tx = new Transaction({
            user: req.params.id,
            type: type === 'add' ? 'recharge' : 'purchase',
            amount: Math.abs(change),
            item: reason || 'Manual Balance Adjustment'
        });
        await tx.save();

        res.json(user);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/users/:id/feature-access', async (req, res) => {
    try {
        const { feature, status, reason } = req.body;
        const update = {};
        update[`featureAccess.${feature}`] = { status, reason };
        const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        res.json(user);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/users/:id/courses/:courseId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Operative not found.' });

        if (user.enrolledCourses.includes(req.params.courseId)) {
            return res.status(400).json({ message: 'Module already authorized for this operative.' });
        }
        user.enrolledCourses.push(req.params.courseId);
        // Also initialize progress if not exists
        if (!user.courseProgress.some(p => p.courseId.toString() === req.params.courseId)) {
            user.courseProgress.push({ courseId: req.params.courseId });
        }
        await user.save();
        res.json({ message: 'Module Authorized.', user });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/users/:id/grant', async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Operative not found.' });

        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Module already authorized.' });
        }
        user.enrolledCourses.push(courseId);
        if (!user.courseProgress.some(p => p.courseId.toString() === courseId)) {
            user.courseProgress.push({ courseId });
        }
        await user.save();
        res.json({ message: 'Module Authorized.', user });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/users/:id/revoke', async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Operative not found.' });

        user.enrolledCourses = user.enrolledCourses.filter(c => c.toString() !== courseId);
        user.courseProgress = user.courseProgress.filter(p => p.courseId.toString() !== courseId);
        await user.save();
        res.json({ message: 'Module Access Revoked.', user });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/users/:id/courses/:courseId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Operative not found.' });

        user.enrolledCourses = user.enrolledCourses.filter(c => c.toString() !== req.params.courseId);
        user.courseProgress = user.courseProgress.filter(p => p.courseId.toString() !== req.params.courseId);
        await user.save();
        res.json({ message: 'Module Access Revoked.', user });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- CONTENT PRODUCTION STUDIO ---
const upload = require('../middleware/uploadMiddleware');

router.post('/courses/:id/thumbnail', upload.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image data detected.' });

        const imageUrl = `/uploads/${req.file.filename}`;
        const course = await Course.findByIdAndUpdate(req.params.id, { thumbnail: imageUrl }, { new: true });

        res.json({ message: 'Gallery Uplink Successful.', imageUrl, course });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().populate('units');
        res.json(courses);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/courses', async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isPublished === undefined) data.isPublished = true;
        const course = new Course(data);
        await course.save();
        res.status(201).json(course);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(course);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/courses/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Module purged.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Deep Structure Management
router.post('/courses/:id/units', async (req, res) => {
    try {
        const unit = new Unit({ ...req.body, course: req.params.id });
        await unit.save();
        await Course.findByIdAndUpdate(req.params.id, { $push: { units: unit._id } });
        res.status(201).json(unit);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/units/:id', async (req, res) => {
    try {
        const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(unit);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/units/:id', async (req, res) => {
    try {
        const unit = await Unit.findByIdAndDelete(req.params.id);
        await Course.findByIdAndUpdate(unit.course, { $pull: { units: unit._id } });
        res.json({ message: 'Unit deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/units/:unitId/lectures', async (req, res) => {
    try {
        const lecture = new Lecture({ ...req.body, unit: req.params.unitId });
        await lecture.save();
        await Unit.findByIdAndUpdate(req.params.unitId, { $push: { lectures: lecture._id } });
        res.json(lecture);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/lectures/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(lecture);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/lectures/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findByIdAndDelete(req.params.id);
        await Unit.findByIdAndUpdate(lecture.unit, { $pull: { lectures: lecture._id } });
        res.json({ message: 'Lecture deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- NOTE STUDIO ---

router.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find().populate('course', 'title');
        res.json(notes);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/notes', async (req, res) => {
    try {
        const note = new Note(req.body);
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        console.error("Note Save Error:", err);
        res.status(400).json({ message: "Neural Uplink Rejected: " + err.message, errors: err.errors });
    }
});

router.put('/notes/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!note) return res.status(404).json({ message: "Neural Record Not Found." });
        res.json(note);
    } catch (err) {
        console.error("Note Update Error:", err);
        res.status(400).json({ message: "Neural Update Rejected: " + err.message, errors: err.errors });
    }
});

router.delete('/notes/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- TRANSACTIONS & SUPPORT ---

router.get('/support', async (req, res) => {
    try {
        const tickets = await Support.find().populate('user', 'username email').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/support/:id/resolve', async (req, res) => {
    try {
        const { status, userBalanceAction } = req.body;
        const ticket = await Support.findById(req.params.id);

        if (userBalanceAction && ticket.type === 'topup' && status === 'resolved') {
            await User.findByIdAndUpdate(ticket.user, { $inc: { balance: ticket.amount } });

            // Log as transaction
            const tx = new Transaction({
                user: ticket.user,
                type: 'recharge',
                amount: ticket.amount,
                item: 'Wallet Top-up'
            });
            await tx.save();
        }

        ticket.status = status;
        await ticket.save();
        res.json(ticket);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/transactions', async (req, res) => {
    try {
        const txs = await Transaction.find().populate('user', 'username email').sort({ createdAt: -1 });
        res.json(txs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/settings', async (req, res) => {
    try {
        const settings = await Setting.find();
        const map = {};
        settings.forEach(s => map[s.key] = s.value);
        res.json(map);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
        res.json(setting);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- SYSTEM RESET ---
router.post('/reset-system', async (req, res) => {
    try {
        const { password } = req.body;

        // Validate environment variable exists
        if (!process.env.ADMIN_RESET_PASSWORD) {
            console.error('❌ ADMIN_RESET_PASSWORD not set in environment variables');
            return res.status(500).json({ message: 'System reset not configured properly.' });
        }

        if (!password || password !== process.env.ADMIN_RESET_PASSWORD) {
            // Log failed attempt
            console.warn(`⚠️ Failed system reset attempt from admin: ${req.user.username} at ${new Date().toISOString()}`);
            return res.status(403).json({ message: 'Incorrect clearance code.' });
        }

        // Log successful reset attempt
        console.warn(`🔴 SYSTEM RESET initiated by admin: ${req.user.username} at ${new Date().toISOString()}`);

        // Delete all data except admin users
        // 1. Delete Non-Admin Users
        await User.deleteMany({ role: { $ne: 'admin' } });

        // 2. Delete EVERYTHING else
        await Promise.all([
            Course.deleteMany({}),
            Unit.deleteMany({}),
            Lecture.deleteMany({}),
            Transaction.deleteMany({}),
            Support.deleteMany({}),
            Note.deleteMany({}),
            Setting.deleteMany({})
        ]);

        console.log('✅ SYSTEM RESET COMPLETE');
        res.json({ message: 'SYSTEM RESET COMPLETE. ALL DATA PURGED.' });
    } catch (err) {
        console.error('System Reset Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
