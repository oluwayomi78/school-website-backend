const mongoose = require('mongoose');

const CurriculumSchema = new mongoose.Schema({
    moduleId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    cohort: {
        type: String,
        required: true,
        enum: ['software', 'linguistics', 'business'],
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    description: {
        type: String,
    },
    iconType: {
        type: String,
        default: 'Cpu',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Curriculum', CurriculumSchema);