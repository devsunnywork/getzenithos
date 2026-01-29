const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
    type: { type: String, enum: ['Assignment', 'Exam', 'Class'], required: true },
    title: { type: String, required: true },
    subject: String,
    dueDate: Date,
    status: { type: String, default: 'Pending' }, // 'Pending', 'In Progress', 'Completed'
    priority: { type: String, default: 'Medium' } // 'Low', 'Medium', 'High'
});

module.exports = mongoose.model('Academic', academicSchema);
