const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['recharge', 'purchase'], required: true },
    amount: { type: Number, required: true },
    item: { type: String }, // Course name or method
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
