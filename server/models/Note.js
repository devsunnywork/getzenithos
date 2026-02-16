const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: Object, required: true }, // Storing the draft.js / rich text content as JSON
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

noteSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Note', noteSchema);
