const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    question: { type: String, required: true },
    solution: { type: String },
    difficulty: { type: String, enum: ['Entry', 'Intermediate', 'Expert'], default: 'Entry' },
    category: { type: String, enum: ['Technical', 'Behavioral', 'System Design'], default: 'Technical' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
