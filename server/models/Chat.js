const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 } // TTL: Purge in 60 seconds
});

module.exports = mongoose.model('Chat', chatSchema);
