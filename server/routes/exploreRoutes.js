const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const CareerPath = require('../models/CareerPath');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Job = require('../models/Job');
const InterviewQuestion = require('../models/InterviewQuestion');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// ===== SKILLS =====

// Get all skills
router.get('/skills', auth, async (req, res) => {
    try {
        const skills = await Skill.find({ isActive: true })
            .populate('prerequisites')
            .populate('relatedCourses');
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's skill progress
router.get('/skills/my-progress', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('skillProgress.skill');
        res.json(user.skillProgress || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Complete a specific topic in a skill
router.post('/skills/:skillId/topics/:topicId/complete', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const skill = await Skill.findById(req.params.skillId);

        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        const topic = skill.topics.find(t =>
            (t._id && t._id.toString() === req.params.topicId) ||
            (t.id && String(t.id) === req.params.topicId) ||
            (t.title && t.title.trim().toLowerCase() === req.params.topicId.trim().toLowerCase()) // Title fallback if ID fails
        );
        if (!topic) {
            console.error(`[Zenith Error] Topic ID mismatch. Skill: ${skill.name}, Target ID: ${req.params.topicId}`);
            console.log("Available Topic IDs:", skill.topics.map(t => t._id.toString()));
            return res.status(404).json({ message: 'Topic not found (ID mismatch)' });
        }

        const skillId = String(req.params.skillId);

        // Ensure we have populated names for the response
        await user.populate('activeCareers');

        // Find existing progress - Handle both populated and unpopulated 'skill'
        let skillProgress = user.skillProgress.find(sp => {
            if (!sp.skill) return false;
            const spId = sp.skill._id ? String(sp.skill._id) : String(sp.skill);
            return spId === skillId;
        });

        // Fail-safe check for active career status (HYPER ROBUST)
        const isActiveCareer = user.activeCareers.some(ac => {
            const acId = String(ac._id || ac);
            return acId === skillId;
        });

        console.log(`[Zenith System] Completion Request: Skill=${skill.name} (${skillId}), Active=${isActiveCareer}`);

        if (!skillProgress) {
            if (isActiveCareer) {
                console.log(`[Zenith System] Auto-initializing progress for ${skill.name}`);
                // Auto-initialize progress for active careers
                user.skillProgress.push({
                    skill: req.params.skillId,
                    isUnlocked: true,
                    proficiencyLevel: 1,
                    completedTopics: []
                });
                skillProgress = user.skillProgress[user.skillProgress.length - 1];
                user.markModified('skillProgress');
            } else {
                const activePaths = user.activeCareers.map(ac => ac.name || ac._id).join(', ');
                return res.status(400).json({
                    message: `PROTOCOL ERROR: [${skill.name}] is not an active protocol.`,
                    details: `Current active protocols: ${activePaths || 'None'}`
                });
            }
        } else {
            // Force unlock if it's an active career - ensure we never block an active path
            if (isActiveCareer && !skillProgress.isUnlocked) {
                console.log(`[Zenith System] Force unlocking existing progress for ${skill.name}`);
                skillProgress.isUnlocked = true;
                user.markModified('skillProgress');
            } else if (!skillProgress.isUnlocked) {
                return res.status(400).json({
                    message: `SECURITY LOCK: Protocol Locked.`,
                    details: `You must add ${skill.name} to your active careers to proceed.`
                });
            }
        }

        // Check if already completed (Type-safe)
        const isTopicCompleted = (tid) => skillProgress.completedTopics.some(id => id.toString() === tid.toString());
        const xpReward = topic.xp || 50;

        if (!isTopicCompleted(req.params.topicId)) {
            // Add primary topic
            skillProgress.completedTopics.push(req.params.topicId);
            skillProgress.xpEarned += xpReward;
            user.xp += xpReward;
        }

        // --- Hierarchical Auto-Completion (Recursive Bubble-up) ---
        const bubbleUpCompletion = (tid) => {
            const current = skill.topics.find(t => t._id.toString() === tid.toString());
            if (!current || !current.parent) return;

            // Find parent topic by ID, title, or reference
            const parentNode = skill.topics.find(t =>
                t._id.toString() === current.parent.toString() ||
                t.title === current.parent ||
                String(t.id) === String(current.parent)
            );

            if (parentNode) {
                // Find all topics that list this parentNode as their parent
                const children = skill.topics.filter(t =>
                    t.parent && (
                        t.parent.toString() === parentNode._id.toString() ||
                        t.parent === parentNode.title ||
                        String(t.parent) === String(parentNode.id)
                    )
                );

                // If this parent has children, check if they are all completed
                if (children.length > 0) {
                    const allChildrenDone = children.every(c => isTopicCompleted(c._id));

                    if (allChildrenDone && !isTopicCompleted(parentNode._id)) {
                        console.log(`[Zenith Auto-Complete] Bubbling completion to parent: ${parentNode.title}`);
                        skillProgress.completedTopics.push(parentNode._id);
                        const pxp = parentNode.xp || 50;
                        skillProgress.xpEarned += pxp;
                        user.xp += pxp;

                        // Continue bubbling up
                        bubbleUpCompletion(parentNode._id);
                    }
                }
            }
        };

        bubbleUpCompletion(req.params.topicId);
        user.markModified('skillProgress');

        // Check if mastered (all topics complete)
        if (skillProgress.completedTopics.length >= skill.topics.length) {
            skillProgress.proficiencyLevel = 3; // Mastered
        }

        skillProgress.lastPracticed = new Date();
        await user.save();

        res.json({
            message: 'Topic completed!',
            xpGained: xpReward,
            skillProgress: user.skillProgress,
            userXp: user.xp
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Unlock a skill with policy (3 changes per 30 days) and password verification
router.post('/skills/:skillId/unlock', auth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: 'Password verification required' });

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const skillId = req.params.skillId;
        const now = new Date();

        // Check if reset period has passed
        if (user.skillChangeHistory.resetDate && now > user.skillChangeHistory.resetDate) {
            user.skillChangeHistory.count = 0;
            user.skillChangeHistory.resetDate = null;
        }

        // Policy Check: 3 changes per 30 days
        if (user.skillChangeHistory.count >= 3) {
            const daysLeft = Math.ceil((user.skillChangeHistory.resetDate - now) / (1000 * 60 * 60 * 24));
            return res.status(403).json({
                message: `Skill change limit reached (3/30 days). Try again in ${daysLeft} days.`
            });
        }

        // Initialize reset date if it's the first change in a cycle
        if (user.skillChangeHistory.count === 0) {
            const reset = new Date();
            reset.setDate(reset.getDate() + 30);
            user.skillChangeHistory.resetDate = reset;
        }

        // Unlock Skill
        let skillProgress = user.skillProgress.find(sp => sp.skill.toString() === skillId);
        if (skillProgress && skillProgress.isUnlocked) {
            return res.status(400).json({ message: 'Skill already unlocked' });
        }

        if (skillProgress) {
            skillProgress.isUnlocked = true;
        } else {
            user.skillProgress.push({
                skill: skillId,
                isUnlocked: true,
                proficiencyLevel: 1
            });
        }

        user.skillChangeHistory.count += 1;
        user.skillChangeHistory.lastChangeDate = now;

        await user.save();
        res.json({ message: 'Skill successfully unlocked!', skillProgress: user.skillProgress });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== ADMIN SKILL MANAGEMENT =====

// Create a new skill (Admin)
router.post('/admin/skills', auth, isAdmin, async (req, res) => {
    try {
        console.log('Received Create Skill Request:', req.body.name);
        const { name, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Name and Category are required' });
        }

        const skill = new Skill(req.body);
        await skill.save();
        console.log('Skill Saved Successfully:', skill._id);
        res.status(201).json(skill);
    } catch (err) {
        console.error('Skill Create Fail:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update a skill (Admin)
router.patch('/admin/skills/:id', auth, isAdmin, async (req, res) => {
    try {
        console.log('Updating Skill:', req.params.id);
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!skill) return res.status(404).json({ message: 'Skill not found' });
        res.json(skill);
    } catch (err) {
        console.error('Skill Update Fail:', err);
        res.status(400).json({ message: err.message });
    }
});

// Delete a skill (Admin)
router.delete('/admin/skills/:id', auth, isAdmin, async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== CAREER PATHS =====

// Get all career paths
router.get('/career-paths', auth, async (req, res) => {
    try {
        const paths = await CareerPath.find({ isActive: true })
            .populate('requiredSkills.skill')
            .populate('recommendedCourses');
        res.json(paths);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Select active careers (Max 2, Limit 3 changes/month)
router.post('/careermode/select', auth, async (req, res) => {
    try {
        const { skillId, action } = req.body; // action: 'add' or 'remove'
        const user = await User.findById(req.user._id);
        const now = new Date();

        // Check if reset needed for monthly limit
        const lastReset = user.careerChangeMeta.lastResetDate ? new Date(user.careerChangeMeta.lastResetDate) : new Date(0);
        const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());

        if (monthsDiff >= 1) {
            user.careerChangeMeta.changesThisMonth = 0;
            user.careerChangeMeta.lastResetDate = now;
        }

        if (action === 'add') {
            if (user.activeCareers.length >= 2) {
                return res.status(400).json({ message: 'MAXIMUM CAPACITY: 2 CAREER PROTOCOLS ALREADY ACTIVE.' });
            }
            if (user.activeCareers.includes(skillId)) {
                return res.status(400).json({ message: 'PROTOCOL ALREADY ACTIVE.' });
            }

            // Check change limit
            if (user.careerChangeMeta.changesThisMonth >= 3) {
                return res.status(403).json({ message: 'SECURITY LOCK: 3 CHANGES PER MONTH LIMIT REACHED.' });
            }

            user.activeCareers.push(skillId);

            // Auto-unlock/initialize skill progress if missing
            let skillProgress = user.skillProgress.find(sp => sp.skill.toString() === skillId);
            if (!skillProgress) {
                user.skillProgress.push({
                    skill: skillId,
                    isUnlocked: true,
                    proficiencyLevel: 1
                });
            } else {
                skillProgress.isUnlocked = true; // Ensure it is unlocked
            }

            user.careerChangeMeta.changesThisMonth += 1;
            user.careerChangeMeta.history.push({ action: 'added', careerId: skillId });
        } else if (action === 'remove') {
            if (!user.activeCareers.includes(skillId)) {
                return res.status(400).json({ message: 'PROTOCOL NOT FOUND IN ACTIVE STACK.' });
            }
            // Remove does not consume a change credit? User said "change them 3 a month". Usually add/swap is the change.
            // Let's assume removing also counts if it's a "change" of state, OR be generous and only count Adds. 
            // "select up to 2 ... and change them" implies swapping.
            // Let's count REMOVE as a change to prevent abuse of swapping.
            if (user.careerChangeMeta.changesThisMonth >= 3) {
                return res.status(403).json({ message: 'SECURITY LOCK: 3 CHANGES PER MONTH LIMIT REACHED.' });
            }

            user.activeCareers = user.activeCareers.filter(id => id.toString() !== skillId);
            user.careerChangeMeta.changesThisMonth += 1;
            user.careerChangeMeta.history.push({ action: 'removed', careerId: skillId });
        }

        await user.save();

        // Populate and return updated list
        await user.populate('activeCareers');
        res.json({
            activeCareers: user.activeCareers,
            changesLeft: 3 - user.careerChangeMeta.changesThisMonth
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's active career progress
router.get('/careermode/my-progress', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('activeCareers') // These are actually Skill documents (Career Roots)
            .populate('skillProgress.skill');

        if (!user.activeCareers || user.activeCareers.length === 0) {
            return res.json({ message: 'No active protocols.', activeCareers: [] });
        }

        // Return the full Skill objects for the active careers
        // The frontend will render the trees for these skills
        // We also need to map the user's progress to these trees (which is in user.skillProgress)
        // user.skillProgress tracks "skill" (which is the root skill) and "completedTopics" (node IDs)

        res.json({
            activeCareers: user.activeCareers,
            skillProgress: user.skillProgress,
            changesLeft: 3 - (user.careerChangeMeta.changesThisMonth || 0)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ===== ACHIEVEMENTS =====

// Get all achievements
router.get('/achievements', auth, async (req, res) => {
    try {
        const achievements = await Achievement.find({ isActive: true });
        const user = await User.findById(req.user._id);

        // Mark which ones user has unlocked
        const achievementsWithStatus = achievements.map(ach => ({
            ...ach.toObject(),
            isUnlocked: user.achievements.some(ua => ua.achievement.toString() === ach._id.toString())
        }));

        res.json(achievementsWithStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's achievements
router.get('/achievements/my-achievements', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('achievements.achievement');
        res.json(user.achievements || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check and unlock achievements (called after user actions)
router.post('/achievements/check', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const achievements = await Achievement.find({ isActive: true });
        const newlyUnlocked = [];

        for (const achievement of achievements) {
            // Skip if already unlocked
            if (user.achievements.some(ua => ua.achievement.toString() === achievement._id.toString())) {
                continue;
            }

            let shouldUnlock = false;

            // Check criteria
            switch (achievement.criteria.type) {
                case 'xp_milestone':
                    shouldUnlock = user.xp >= achievement.criteria.value;
                    break;
                case 'course_complete':
                    shouldUnlock = user.courseProgress.length >= achievement.criteria.value;
                    break;
                case 'streak_days':
                    shouldUnlock = user.learningStreak.current >= achievement.criteria.value;
                    break;
                case 'skill_master':
                    const masteredCount = user.skillProgress.filter(sp => sp.isMastered).length;
                    shouldUnlock = masteredCount >= achievement.criteria.value;
                    break;
            }

            if (shouldUnlock) {
                user.achievements.push({
                    achievement: achievement._id,
                    unlockedAt: new Date()
                });

                // Award XP
                if (achievement.reward.xp) {
                    user.xp += achievement.reward.xp;
                }

                newlyUnlocked.push(achievement);
            }
        }

        if (newlyUnlocked.length > 0) {
            await user.save();
        }

        res.json({
            message: newlyUnlocked.length > 0 ? 'New achievements unlocked!' : 'No new achievements',
            newlyUnlocked,
            totalXpGained: newlyUnlocked.reduce((sum, ach) => sum + (ach.reward.xp || 0), 0)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== LEARNING STREAK =====

// Update learning streak
router.post('/streak/update', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActive = user.learningStreak.lastActiveDate
            ? new Date(user.learningStreak.lastActiveDate)
            : null;

        if (lastActive) {
            lastActive.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day, no change
                return res.json({ message: 'Already logged today', streak: user.learningStreak });
            } else if (daysDiff === 1) {
                // Consecutive day
                user.learningStreak.current += 1;
                if (user.learningStreak.current > user.learningStreak.longest) {
                    user.learningStreak.longest = user.learningStreak.current;
                }
            } else {
                // Streak broken
                user.learningStreak.current = 1;
            }
        } else {
            // First time
            user.learningStreak.current = 1;
            user.learningStreak.longest = 1;
        }

        user.learningStreak.lastActiveDate = today;
        await user.save();

        res.json({ message: 'Streak updated!', streak: user.learningStreak });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== PLACEMENT DATA =====

// Update placement profile
router.post('/placement/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { resumeUrl, portfolioUrl, githubUrl, linkedinUrl, targetRole, expectedSalary, preferredLocations } = req.body;

        if (resumeUrl) user.placementData.resumeUrl = resumeUrl;
        if (portfolioUrl) user.placementData.portfolioUrl = portfolioUrl;
        if (githubUrl) user.placementData.githubUrl = githubUrl;
        if (linkedinUrl) user.placementData.linkedinUrl = linkedinUrl;
        if (targetRole) user.placementData.targetRole = targetRole;
        if (expectedSalary) user.placementData.expectedSalary = expectedSalary;
        if (preferredLocations) user.placementData.preferredLocations = preferredLocations;

        await user.save();
        res.json({ message: 'Placement profile updated', placementData: user.placementData });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get placement readiness score
router.get('/placement/readiness', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('selectedCareerPath')
            .populate('skillProgress.skill');

        let score = 0;
        const checks = [];

        // Check 1: Resume uploaded (20 points)
        if (user.placementData.resumeUrl) {
            score += 20;
            checks.push({ name: 'Resume Uploaded', completed: true });
        } else {
            checks.push({ name: 'Resume Uploaded', completed: false });
        }

        // Check 2: Portfolio/GitHub (20 points)
        if (user.placementData.portfolioUrl || user.placementData.githubUrl) {
            score += 20;
            checks.push({ name: 'Portfolio/GitHub Added', completed: true });
        } else {
            checks.push({ name: 'Portfolio/GitHub Added', completed: false });
        }

        // Check 3: Career path selected (10 points)
        if (user.selectedCareerPath) {
            score += 10;
            checks.push({ name: 'Career Path Selected', completed: true });
        } else {
            checks.push({ name: 'Career Path Selected', completed: false });
        }

        // Check 4: Skills mastered (30 points)
        const masteredSkills = user.skillProgress.filter(sp => sp.isMastered).length;
        if (masteredSkills >= 5) {
            score += 30;
            checks.push({ name: '5+ Skills Mastered', completed: true });
        } else {
            checks.push({ name: `${masteredSkills}/5 Skills Mastered`, completed: false });
        }

        // Check 5: Courses completed (20 points)
        if (user.courseProgress.length >= 3) {
            score += 20;
            checks.push({ name: '3+ Courses Completed', completed: true });
        } else {
            checks.push({ name: `${user.courseProgress.length}/3 Courses Completed`, completed: false });
        }

        user.placementData.isJobReady = score >= 80;
        await user.save();

        res.json({
            score,
            isJobReady: score >= 80,
            checks,
            message: score >= 80 ? 'You are job-ready!' : 'Keep building your profile!'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== PLACEMENT HUB: JOBS & QUESTIONS =====

// Get skill-matched jobs
router.get('/placement/jobs', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const masteredSkillIds = user.skillProgress
            .filter(sp => sp.isMastered)
            .map(sp => sp.skill.toString());

        // Find jobs where at least one requirement matches a mastered skill
        const jobs = await Job.find({
            isActive: true,
            'requirements.skill': { $in: masteredSkillIds }
        }).populate('requirements.skill');

        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get interview questions for a skill
router.get('/placement/prep/:skillId', auth, async (req, res) => {
    try {
        const questions = await InterviewQuestion.find({
            skill: req.params.skillId,
            isActive: true
        });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a job (Admin)
router.post('/admin/placement/jobs', auth, isAdmin, async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add an interview question (Admin)
router.post('/admin/placement/questions', auth, isAdmin, async (req, res) => {
    try {
        const question = new InterviewQuestion(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
