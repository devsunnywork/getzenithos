const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    title: { type: String, required: true },
    videoUrl: { type: String },
    documentUrl: { type: String },
    content: { type: String }, // General content or text
    duration: { type: String }, // e.g., "15:00"
    notesUrl: { type: String }, // Google Drive or External Link
    order: { type: Number, default: 0 },
    // Interaction tracking
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked
    shares: { type: Number, default: 0 }, // Share count
    completions: { type: Number, default: 0 } // Completion count
});

module.exports = mongoose.model('Lecture', lectureSchema);
