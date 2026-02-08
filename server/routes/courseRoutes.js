const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Lecture = require('../models/Lecture');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/authMiddleware');

// Public: Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate({
            path: 'units',
            populate: {
                path: 'lectures',
                select: '_id title'
            }
        });

        const coursesWithCount = courses.map(c => {
            const courseObj = c.toObject();
            // Calculate total lecture count from all units
            let totalLectures = 0;
            if (c.units && Array.isArray(c.units)) {
                c.units.forEach(unit => {
                    if (unit.lectures && Array.isArray(unit.lectures)) {
                        totalLectures += unit.lectures.length;
                    }
                });
            }
            courseObj.lectureCount = totalLectures;
            return courseObj;
        });

        res.json(coursesWithCount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Private: Enroll/Buy Course
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const course = await Course.findById(req.params.id);

        if (!course) return res.status(404).json({ message: 'Module not found.' });
        if (user.enrolledCourses.includes(req.params.id)) {
            return res.status(400).json({ message: 'Neural link already active.' });
        }

        // Balance Check if not free
        if (!course.isFree && user.balance < course.price) {
            return res.status(402).json({ message: 'Insufficient credits for procurement.' });
        }

        // Deduct Balance
        if (!course.isFree) {
            user.balance -= course.price;
        }

        user.enrolledCourses.push(req.params.id);

        // Initialize Progress Track
        user.courseProgress.push({
            courseId: course._id,
            completedLectures: [],
            watchTime: 0
        });

        // Record Transaction
        const tx = new Transaction({
            user: user._id,
            type: 'purchase',
            amount: course.price,
            item: course.title
        });
        await tx.save();

        await user.save();
        res.json({ message: 'Link established. Module acquired.', balance: user.balance });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Private: Get Course Content (Units & Lectures)
router.get('/:id/content', auth, async (req, res) => {
    try {
        if (!req.user.enrolledCourses.includes(req.params.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        const course = await Course.findById(req.params.id)
            .populate({
                path: 'units',
                populate: { path: 'lectures' }
            });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const Comment = require('../models/Comment');

// ... (previous routes)

// Private: Mark Lecture Complete/Incomplete
router.post('/:id/progress/mark-complete', auth, async (req, res) => {
    try {
        const { lectureId, completed } = req.body;
        const user = await User.findById(req.user._id);
        let progress = user.courseProgress.find(p => p.courseId.toString() === req.params.id);

        if (!progress) {
            // Auto-create progress if it doesn't exist yet
            user.courseProgress.push({
                courseId: req.params.id,
                completedLectures: [],
                watchTime: 0,
                xp: 0
            });
            // Save immediately to persist the new progress object
            await user.save();
            // Re-fetch the user to get the proper reference
            const updatedUser = await User.findById(req.user._id);
            progress = updatedUser.courseProgress.find(p => p.courseId.toString() === req.params.id);
            // Update user reference for subsequent operations
            Object.assign(user, updatedUser);
        }


        if (completed) {
            if (!progress.completedLectures.includes(lectureId)) {
                progress.completedLectures.push(lectureId);
                // Reward XP (100 per lecture)
                user.xp = (user.xp || 0) + 100;
                progress.xp = (progress.xp || 0) + 100;

                // Increment lecture completion count
                await Lecture.findByIdAndUpdate(lectureId, { $inc: { completions: 1 } });
            }
        } else {
            if (progress.completedLectures.includes(lectureId)) {
                progress.completedLectures = progress.completedLectures.filter(l => l.toString() !== lectureId);
                // Deduct XP if accidentally marked complete? 
                // Usually, we don't deduct unless necessary. I'll deduct for consistency.
                user.xp = Math.max(0, (user.xp || 0) - 100);
                progress.xp = Math.max(0, (progress.xp || 0) - 100);

                // Decrement lecture completion count (with validation)
                const lecture = await Lecture.findById(lectureId);
                if (lecture && lecture.completions > 0) {
                    lecture.completions -= 1;
                    await lecture.save();
                }
            }
        }

        await user.save();
        res.json({ message: 'Progress updated! XP earned!', xp: user.xp, progress });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Private: Sync Watch Time
router.post('/:id/telemetry/sync', auth, async (req, res) => {
    try {
        const { seconds } = req.body;
        const user = await User.findById(req.user._id);
        const progress = user.courseProgress.find(p => p.courseId.toString() === req.params.id);

        if (!progress) return res.status(404).json({ message: 'Progress track not found.' });

        progress.watchTime += seconds;
        user.totalWatchTime += seconds;

        // Simple Badge logic test
        if (user.totalWatchTime >= 3600 && !user.badges.find(b => b.name === 'Deep Diver')) {
            user.badges.push({ name: 'Deep Diver', icon: 'fas fa-anchor' });
        }

        await user.save();
        res.json({ message: 'Telemetry uplink successful.', watchTime: progress.watchTime });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- DISCUSSION ENGINE ---

router.get('/lectures/:lecId/comments', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ lecture: req.params.lecId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/lectures/:lecId/comments', auth, async (req, res) => {
    try {
        const comment = new Comment({
            user: req.user._id,
            lecture: req.params.lecId,
            text: req.body.text
        });
        await comment.save();
        const populated = await Comment.findById(comment._id).populate('user', 'username');
        res.status(201).json(populated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (comment.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized.' });

        comment.text = req.body.text;
        comment.isEdited = true;
        await comment.save();
        res.json(comment);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (comment.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized.' });

        await Comment.findByIdAndDelete(req.params.commentId);
        res.json({ message: 'Transmission purged.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

const Chat = require('../models/Chat');

// --- LIVE CHAT ENGINE (60s VOLATILITY) ---

router.get('/lectures/:lecId/chats', auth, async (req, res) => {
    try {
        const chats = await Chat.find({ lecture: req.params.lecId })
            .populate('user', 'username')
            .sort({ createdAt: 1 });
        res.json(chats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/lectures/:lecId/chats', auth, async (req, res) => {
    try {
        const chat = new Chat({
            user: req.user._id,
            lecture: req.params.lecId,
            text: req.body.text
        });
        await chat.save();
        const populated = await Chat.findById(chat._id).populate('user', 'username');
        res.status(201).json(populated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// --- LIKE & SHARE SYSTEM ---

// Toggle Like on Lecture
router.post('/lectures/:lecId/like', auth, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lecId);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        const userId = req.user._id;
        const hasLiked = lecture.likes.includes(userId);

        if (hasLiked) {
            // Unlike
            lecture.likes = lecture.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like
            lecture.likes.push(userId);
        }

        await lecture.save();
        res.json({
            liked: !hasLiked,
            likeCount: lecture.likes.length,
            message: hasLiked ? 'Like removed' : 'Lecture liked!'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Increment Share Count
router.post('/lectures/:lecId/share', auth, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lecId);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        lecture.shares = (lecture.shares || 0) + 1;
        await lecture.save();

        res.json({
            shareCount: lecture.shares,
            message: 'Lecture shared!'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Lecture Stats (likes, shares, completions)
router.get('/lectures/:lecId/stats', auth, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lecId);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        const hasLiked = lecture.likes.includes(req.user._id);

        res.json({
            likeCount: lecture.likes.length,
            shareCount: lecture.shares || 0,
            completionCount: lecture.completions || 0,
            hasLiked
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
