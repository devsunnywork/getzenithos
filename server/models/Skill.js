const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'AI/ML', 'Design', 'Game Dev', 'Cloud Computing', 'Other'], default: 'Other' },
    description: { type: String },
    icon: { type: String, default: 'fa-code' }, // Font Awesome icon class
    color: { type: String, default: '#3b82f6' }, // Hex color for the node
    level: { type: Number, default: 1, min: 1, max: 5 }, // Difficulty level 1-5
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Required skills
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    topics: [{
        _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        title: { type: String, required: true },
        type: { type: String, enum: ['main', 'branch', 'sub', 'group'], default: 'main' },
        description: { type: String },
        content: { type: String },
        xp: { type: Number, default: 50 }, // New XP field
        lectures: [{
            title: { type: String, default: 'Lecture 1' },
            videoUrl: { type: String, default: '' },
            notes: { type: String, default: '' }
        }],
        parent: { type: String }, // Legacy support
        parents: [{ type: String }], // Multi-parent support (DAG)
        videoUrl: { type: String, default: '' },
        pdfUrl: { type: String, default: '' },
        importantPoints: { type: String, default: '' },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 }
        },
        resources: [{
            title: String,
            url: String,
            type: { type: String, enum: ['article', 'video', 'documentation', 'tutorial'] }
        }]
    }],
    xpRequired: { type: Number, default: 1000 },
    estimatedHours: { type: Number, default: 10 },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true }, // Whether it shows in the main tree
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indices for performance
skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });

module.exports = mongoose.model('Skill', skillSchema);
