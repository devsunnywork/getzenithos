const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    text: { type: String, required: true },
    isEdited: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: { expires: '7d' } } // Auto-delete after 7 days
});

module.exports = mongoose.model('Comment', commentSchema);
