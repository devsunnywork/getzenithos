const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, default: '' },
    language: { type: String, required: true }, // e.g., 'java', 'c', 'cpp', 'csharp'
    path: { type: String, required: true }, // e.g., 'src/Main.java'
    parentId: { type: String, default: null } // Folder ID if nested
});

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    parentId: { type: String, default: null }
});

const projectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    language: { type: String, required: true }, // Default project language
    files: [fileSchema],
    folders: [folderSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
