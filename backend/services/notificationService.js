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

// Send email to all students in a class
async function sendEmailToClass(students, className, title, content, type) {
  const emails = students.map(s => s.email).filter(Boolean);
  if (emails.length === 0) return;
  
  const typeColors = {
    announcement: { bg: "#e0e7ff", color: "#4f46e5", icon: "📢" },
    assignment: { bg: "#dcfce7", color: "#16a34a", icon: "📝" },
    material: { bg: "#fef3c7", color: "#d97706", icon: "📂" }
  };
  
  const style = typeColors[type] || typeColors.announcement;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 20px; }
        .container { max-width: 550px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .type-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; background: ${style.bg}; color: ${style.color}; }
        .title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
        .message { color: #475569; line-height: 1.6; margin-bottom: 25px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; color: #64748b; font-size: 12px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 StudyPulse AI</h1>
          <p>${className}</p>
        </div>
        <div class="content">
          <div class="type-badge">${style.icon} ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
          <div class="title">${title}</div>
          <div class="message">${content}</div>
          <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View in Dashboard →</a>
        </div>
        <div class="footer">
          <p>StudyPulse AI - Learn Smarter with AI 🚀</p>
          <p style="font-size: 10px; margin-top: 5px;">You received this email because you're enrolled in this class.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const plainText = `${type.toUpperCase()}: ${title}\n\n${content}\n\nView on StudyPulse: ${process.env.FRONTEND_URL}/dashboard`;
  
  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: `"StudyPulse AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📚 ${title} - ${className}`,
        html: htmlContent,
        text: plainText,
      });
    } catch (err) {
      console.error(`Failed to send email to ${email}:`, err.message);
    }
  }
}

// Send email notification (single user)
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
  reminderDate.setDate(reminderDate.getDate() - 1);
  
  return await Notification.create({
    user: userId,
    type: 'assignment',
    title: '📝 Assignment Due Tomorrow!',
    message: `Your assignment "${assignmentTitle}" is due tomorrow. Submit it on time!`,
    scheduledFor: reminderDate,
    metadata: { assignmentTitle, dueDate }
  });
}

// Create quiz recommendation
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

// Cron job to send notifications
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const pendingNotifications = await Notification.find({
    scheduledFor: { $lte: now },
    sent: false
  }).populate('user', 'name email');
  
  for (const notification of pendingNotifications) {
    if (notification.user?.email) {
      await sendEmailNotification(
        notification.user.email,
        notification.user.name,
        notification.title,
        notification.message
      );
    }
    
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
  sendEmailNotification,
  sendEmailToClass
};