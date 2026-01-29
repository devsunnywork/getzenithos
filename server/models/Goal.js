const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['Academic', 'Personal', 'Professional', 'Fitness'], default: 'Personal' },
    status: { type: String, enum: ['In Progress', 'Achieved', 'Archived'], default: 'In Progress' },
    deadline: { type: Date },
    tasks: [{
        title: String,
        isCompleted: { type: Boolean, default: false },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
    }],
    progress: { type: Number, default: 0 }, // percentage
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
