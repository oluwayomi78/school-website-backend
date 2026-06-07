const mongoose = require('mongoose');

const SubjectAssignmentSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    className: {
        type: String,
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
        required: false,
    },
    teacher: {
        type: String,
        required: true,
    },
    schedule: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active',
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

module.exports = mongoose.model('SubjectAssignment', SubjectAssignmentSchema);
