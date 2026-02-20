const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, required: true }, // Maps to group.channels._id
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Content Types
    type: { type: String, enum: ['text', 'snippet', 'system', 'image', 'file'], default: 'text' },

    content: { type: String, required: true }, // The actual message text or raw code

    // File/Media Support
    fileUrl: { type: String },
    fileMeta: {
        mimetype: { type: String },
        size: { type: Number },
        filename: { type: String }
    },

    // Sneak Peek for Snippets
    snippetMeta: {
        language: { type: String }, // e.g., 'javascript', 'python'
        filename: { type: String }
    },

    createdAt: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);
