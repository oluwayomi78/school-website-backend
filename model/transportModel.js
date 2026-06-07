const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    routeName: { type: String, required: true, trim: true },
    driverName: { type: String, required: true },
    vehicleNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, default: 15 },
    assignedStudents: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transport', transportSchema);