const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Full Stack Developer"
    description: { type: String },
    icon: { type: String, default: 'fa-briefcase' },
    color: { type: String, default: '#8b5cf6' },
    category: { type: String, enum: ['Development', 'Data Science', 'Design', 'DevOps', 'Mobile', 'AI/ML', 'Other'], default: 'Development' },
    requiredSkills: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        proficiencyLevel: { type: Number, default: 3, min: 1, max: 5 } // 1=Beginner, 5=Expert
    }],
    recommendedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    estimatedDuration: { type: String, default: '6 months' }, // Human readable
    averageSalary: { type: String }, // e.g., "$80k - $120k"
    jobTitles: [String], // Related job titles
    companies: [String], // Companies hiring for this path
    roadmapSteps: [{
        step: Number,
        title: String,
        description: String,
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
        estimatedWeeks: Number
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareerPath', careerPathSchema);
