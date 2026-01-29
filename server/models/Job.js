const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    logo: { type: String, default: '' },
    description: { type: String, required: true },
    requirements: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        proficiencyLevel: { type: Number, default: 1 }
    }],
    location: { type: String, default: 'Remote' },
    salary: { type: String, default: 'Competitive' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    category: { type: String, default: 'Software Engineering' },
    applyUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
