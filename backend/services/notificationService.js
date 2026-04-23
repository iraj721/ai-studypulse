const Notification = require("../models/Notification");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email notification
async function sendEmailNotification(userEmail, userName, title, message) {
  try {
    await transporter.sendMail({
      from: `"StudyPulse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 20px; color: white;">
          <h2>📚 StudyPulse Reminder</h2>
          <h3>${title}</h3>
          <p style="font-size: 16px; line-height: 1.5;">${message}</p>
          <hr style="border-color: rgba(255,255,255,0.3);">
          <p style="font-size: 12px; opacity: 0.8;">Study Smarter with AI 🚀</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

// Create daily study reminder
async function createDailyReminder(userId, studyTime = "19:00") {
  const [hour, minute] = studyTime.split(':');
  const scheduledFor = new Date();
  scheduledFor.setHours(parseInt(hour), parseInt(minute), 0, 0);
  if (scheduledFor < new Date()) {
    scheduledFor.setDate(scheduledFor.getDate() + 1);
  }
  
  return await Notification.create({
    user: userId,
    type: 'daily',
    title: '📚 Time to Study!',
    message: `Don't forget your daily study session. Open StudyPulse and continue learning!`,
    scheduledFor: scheduledFor,
  });
}

// Create assignment reminder
async function createAssignmentReminder(userId, assignmentTitle, dueDate) {
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before
  
  return await Notification.create({
    user: userId,
    type: 'assignment',
    title: '📝 Assignment Due Tomorrow!',
    message: `Your assignment "${assignmentTitle}" is due tomorrow. Submit it on time!`,
    scheduledFor: reminderDate,
    metadata: { assignmentTitle, dueDate }
  });
}

// Create quiz recommendation based on weak topics
async function createQuizRecommendation(userId, weakTopics) {
  const topics = weakTopics.join(', ');
  return await Notification.create({
    user: userId,
    type: 'quiz',
    title: '🎯 Quiz Recommendation',
    message: `We noticed you need practice on: ${topics}. Generate a quiz now to improve!`,
    scheduledFor: new Date(),
    metadata: { weakTopics }
  });
}

// Cron job to send notifications (runs every minute)
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const pendingNotifications = await Notification.find({
    scheduledFor: { $lte: now },
    sent: false
  }).populate('user', 'name email');
  
  for (const notification of pendingNotifications) {
    // Send email
    if (notification.user?.email) {
      await sendEmailNotification(
        notification.user.email,
        notification.user.name,
        notification.title,
        notification.message
      );
    }
    
    // Socket.io for real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(notification.user._id.toString()).emit('newNotification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
    }
    
    notification.sent = true;
    notification.sentAt = now;
    await notification.save();
  }
});

module.exports = {
  createDailyReminder,
  createAssignmentReminder,
  createQuizRecommendation,
  sendEmailNotification
};