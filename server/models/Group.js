const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    inviteCode: { type: String, unique: true }, // Deep-link invite code
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Members and Roles
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now }
    }],
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For private groups

    // Structure
    channels: [{
        name: String,
        description: String,
        createdAt: { type: Date, default: Date.now }
    }],

    // The Vault (Resources)
    resources: [{
        title: String,
        url: String, // Link to GitHub, PDF, article, etc.
        type: { type: String, enum: ['link', 'pdf', 'video', 'github', 'other'], default: 'link' },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],

    // Challenges
    challenges: [{
        title: String,
        description: String,
        deadline: Date,
        createdAt: { type: Date, default: Date.now },
        submissions: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            url: String, // Link to CodePen, GitHub, etc.
            isWinner: { type: Boolean, default: false },
            submittedAt: { type: Date, default: Date.now }
        }]
    }],

    // Live Events
    events: [{
        title: String,
        description: String,
        scheduledFor: Date,
        joinUrl: String, // Google Meet, built-in stream link, etc.
        rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    createdAt: { type: Date, default: Date.now }
});

// Helper to check if a user is a member
groupSchema.methods.isMember = function (userId) {
    return this.members.some(m => m.user.toString() === userId.toString());
};

// Helper to check role
groupSchema.methods.getRole = function (userId) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    return member ? member.role : null;
};

module.exports = mongoose.model('Group', groupSchema);
