const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: {
        type: String,
        required: true,
        enum: ['software', 'linguistics', 'business', 'general']
    },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    location: { type: String, placeholder: "e.g. Shelf A-1" },
    activeLoans: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        studentName: String,
        issueDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Library', librarySchema);