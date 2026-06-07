const Activity = require("../model/activitiesModel");

const logActivity = async (userId, type, title, desc) => {
  try {
    await Activity.create({
      user: userId,
      type,
      title,
      desc,
    });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

module.exports = logActivity;