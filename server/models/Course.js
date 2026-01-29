const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String },
    price: { type: Number, default: 0 },
    instructor: { type: String },
    category: { type: String, enum: ['Academic', 'Professional', 'Health', 'Skills'] },
    isFree: { type: Boolean, default: false },
    adConfig: {
        imageUrl: { type: String },
        linkUrl: { type: String },
        enabled: { type: Boolean, default: false }
    },
    features: [{ type: String }], // "What you will learn"
    skills: [{ type: String }], // Roadmap tags (e.g. 'React', 'Node.js')
    coupons: [{
        code: { type: String },
        discount: { type: Number }, // Percent or fixed
        expiry: { type: Date }
    }],
    isPublished: { type: Boolean, default: false },
    units: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
