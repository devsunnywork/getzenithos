const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    xpReward: { type: Number, default: 10 },
    testCases: [{
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false }
    }],
    constraints: {
        timeLimitMs: { type: Number, default: 2000 },
        memoryLimitMb: { type: Number, default: 256 }
    },
    examples: [{
        input: { type: String },
        output: { type: String },
        explanation: { type: String }
    }],
    tags: [{ type: String }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);
