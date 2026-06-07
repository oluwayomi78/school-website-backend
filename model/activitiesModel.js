const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: String,
    title: String,
    desc: String,
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('Activity', activitySchema);