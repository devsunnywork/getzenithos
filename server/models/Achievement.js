const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String, default: 'fa-trophy' },
    color: { type: String, default: '#f59e0b' },
    category: { type: String, enum: ['Course', 'Skill', 'XP', 'Streak', 'Project', 'Social', 'Special'], default: 'Course' },
    criteria: {
        type: { type: String, enum: ['course_complete', 'xp_milestone', 'streak_days', 'skill_master', 'project_complete', 'custom'], required: true },
        value: { type: Number }, // e.g., 100 for 100 courses, 10000 for 10k XP
        targetId: { type: mongoose.Schema.Types.ObjectId } // For specific course/skill achievements
    },
    reward: {
        xp: { type: Number, default: 0 },
        badge: { type: String }, // Badge image URL
        title: { type: String } // Special title like "Master Coder"
    },
    rarity: { type: String, enum: ['Common', 'Rare', 'Epic', 'Legendary'], default: 'Common' },
    isSecret: { type: Boolean, default: false }, // Hidden until unlocked
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', achievementSchema);
