const mongoose = require('mongoose');

const healthSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: () => new Date().setHours(0, 0, 0, 0) },
    weight: Number,
    caloriesTarget: { type: Number, default: 2000 },
    foodLogs: [{
        name: String,
        calories: Number,
        time: { type: Date, default: Date.now }
    }],
    waterIntake: { type: Number, default: 0 }, // in liters
    sleepHours: Number,
    workout: {
        type: String,
        exercises: [{ name: String, sets: Number, reps: Number }]
    }
});

module.exports = mongoose.model('Health', healthSchema);
