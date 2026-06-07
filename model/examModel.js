const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    entryType: {
        type: String,
        required: true,
        enum: ['question', 'result'],
        default: 'question'
    },
    course: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        required: function() { return this.entryType === 'question'; }
    },
    level: {
        type: Number,
        enum: [1, 2, 3, 4, 5, 6],
        required: true,
        required: function() { return this.entryType === 'question'; }
    },
    subject: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        enum: ['software', 'linguistics', 'business']
    },
    questionText: {
        type: String,
        required: function () { return this.entryType === 'question'; }
    },
    options: {
        type: [String],
        validate: [arrayLimit, '{PATH} must have exactly 4 options'],
        required: function () { return this.entryType === 'question'; }
    },
    correctAnswer: {
        type: String,
        required: function () { return this.entryType === 'question'; }
    },
    points: {
        type: Number,
        default: 5
    },

    studentName: {
        type: String,
        required: function () { return this.entryType === 'result'; }
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        required: function () { return this.entryType === 'result'; }
    },
    grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F'],
        uppercase: true,
        required: function () { return this.entryType === 'result'; }
    },
    term: {
        type: String,
        enum: ['First Term', 'Second Term', 'Third Term'],
        required: function () { return this.entryType === 'result'; }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

function arrayLimit(val) {
    if (this.entryType === 'result') return true;
    return val.length === 4;
}

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;