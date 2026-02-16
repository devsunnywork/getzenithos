const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    mood: String
});

module.exports = mongoose.model('Personal', personalSchema);
