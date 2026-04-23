const Notification = require("../models/Notification");
const { createDailyReminder, createAssignmentReminder, createQuizRecommendation } = require("../services/notificationService");

// Get user's notifications
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.user._id,
      sent: true
    }).sort({ scheduledFor: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create daily reminder
const setDailyReminder = async (req, res) => {
  try {
    const { studyTime } = req.body;
    await createDailyReminder(req.user._id, studyTime);
    res.json({ message: "Daily reminder set successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserNotifications, setDailyReminder, markAsRead };