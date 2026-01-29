const mongoose = require('mongoose');

const personalSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    mood: String
});

module.exports = mongoose.model('Personal', personalSchema);
