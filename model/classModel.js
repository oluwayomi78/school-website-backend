const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cohort: {
        type: String,
        required: true,
        enum: ['Software Engineering', 'linguistics', 'business'],
    },
    level: {
        type: String,
        required: true,
        enum: ['level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6'],
    },
    room: {
        type: String,
        required: true,
    },
    teacher: {
        type: String,
        required: false,
    },
    studentCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SchoolClass', ClassSchema);
