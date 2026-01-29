const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile: {
        bio: { type: String, default: '' },
        avatar: { type: String, default: '' },
        personalInfo: {
            fullName: { type: String, default: '' },
            phone: { type: String, default: '' },
            city: { type: String, default: '' },
            country: { type: String, default: '' },
            jobTitle: { type: String, default: '' },
            company: { type: String, default: '' },
            website: { type: String, default: '' },
            github: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            twitter: { type: String, default: '' },
            skills: { type: String, default: '' }, // Comma separated
            education: { type: String, default: '' },
            languages: { type: String, default: '' }
        }
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    balance: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    blockedReason: { type: String, default: '' },
    blockedUntil: { type: Date, default: null },
    lastSeen: { type: Date, default: Date.now },
    courseProgress: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
        watchTime: { type: Number, default: 0 }, // In seconds
        xp: { type: Number, default: 0 }
    }],
    totalWatchTime: { type: Number, default: 0 },
    badges: [{
        name: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],
    // Explore Tree Features
    skillProgress: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        proficiencyLevel: { type: Number, default: 1, min: 1, max: 5 }, // 1=Beginner, 5=Expert
        xpEarned: { type: Number, default: 0 },
        completedTopics: [{ type: mongoose.Schema.Types.ObjectId }], // IDs of topics from Skill.topics
        lastPracticed: { type: Date, default: Date.now },
        isUnlocked: { type: Boolean, default: false },
        isMastered: { type: Boolean, default: false }
    }],
    activeCareers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Max 2
    achievements: [{
        achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
        unlockedAt: { type: Date, default: Date.now }
    }],
    learningStreak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActiveDate: { type: Date }
    },
    careerChangeMeta: {
        changesThisMonth: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
        history: [{
            action: String, // 'added', 'removed'
            careerId: { type: mongoose.Schema.Types.ObjectId },
            date: { type: Date, default: Date.now }
        }]
    },
    placementData: {
        resumeUrl: { type: String },
        portfolioUrl: { type: String },
        githubUrl: { type: String },
        linkedinUrl: { type: String },
        targetRole: { type: String },
        expectedSalary: { type: String },
        preferredLocations: [String],
        isJobReady: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
