const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type:String,
    enum: ['student', 'admin', 'instructor', 'Registrar'],
    default: 'student'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
   guardianLink: {
    type: String,
    default: ""
  },
  parentGuardianName: {
    type: String,
    default: ""
  },
  parentGuardianPhone: {
    type: String,
    default: ""
  },
    level: {
  type: Number,
  enum: [1, 2, 3, 4, 5, 6],
  required: true,
  default: 1
},
  profileImage: String

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);