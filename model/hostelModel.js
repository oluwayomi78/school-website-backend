const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    blockName: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true },
    roomType: {
        type: String,
        enum: ['Single', 'Shared', 'Suite'],
        default: 'Shared'
    },
    capacity: { type: Number, required: true, default: 4 },
    occupants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['available', 'full', 'maintenance'],
        default: 'available'
    },
    createdAt: { type: Date, default: Date.now }
});

hostelSchema.pre('save', function(next) {
    if (this.occupants.length >= this.capacity) {
        this.status = 'full';
    } else if (this.status !== 'maintenance') {
        this.status = 'available';
    }
});

module.exports = mongoose.model('Hostel', hostelSchema);