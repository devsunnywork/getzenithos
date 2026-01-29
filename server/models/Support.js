const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['topup', 'complaint', 'contact'], required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    amount: { type: Number }, // For topup requests
    status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Support', supportSchema);
