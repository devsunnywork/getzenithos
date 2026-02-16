const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Number, default: 1000 },
    xp: { type: Number, default: 0 },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    activeCareers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    courseProgress: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
        watchTime: { type: Number, default: 0 },
        xp: { type: Number, default: 0 }
    }],
    skillProgress: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        isUnlocked: { type: Boolean, default: false },
        proficiencyLevel: { type: Number, default: 1 },
        completedTopics: [{ type: String }],
        xpEarned: { type: Number, default: 0 },
        lastPracticed: { type: Date }
    }],
    learningStreak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActiveDate: { type: Date }
    },
    careerChangeMeta: {
        lastResetDate: { type: Date, default: Date.now },
        changesThisMonth: { type: Number, default: 0 },
        history: [{
            action: String,
            careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
            date: { type: Date, default: Date.now }
        }]
    },
    achievements: [{
        achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
        unlockedAt: { type: Date, default: Date.now }
    }],
    goals: [{
        title: { type: String },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        deadline: { type: Date }
    }],
    profile: {
        avatar: String,
        bio: String,
        skills: [String],
        personalInfo: {
            fullName: String,
            phone: String,
            address: String
        }
    },
    placementData: {
        resumeUrl: String,
        portfolioUrl: String,
        githubUrl: String,
        linkedinUrl: String,
        targetRole: String,
        expectedSalary: String,
        preferredLocations: [String],
        isJobReady: { type: Boolean, default: false }
    },
    featureAccess: {
        courses: { status: { type: String, enum: ['active', 'blocked'], default: 'active' }, reason: String },
        profile: { status: { type: String, enum: ['active', 'blocked'], default: 'active' }, reason: String },
        video: { status: { type: String, enum: ['active', 'blocked'], default: 'active' }, reason: String },
        chat: { status: { type: String, enum: ['active', 'blocked'], default: 'active' }, reason: String }
    },
    bonusClaimed: { type: Boolean, default: false },
    usedCheatCodes: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
