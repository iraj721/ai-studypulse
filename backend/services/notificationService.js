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

// Helper function to get frontend URL
function getFrontendUrl() {
  let frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl || frontendUrl === "undefined") {
    if (process.env.NODE_ENV === "production") {
      frontendUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.RENDER_EXTERNAL_URL
          ? process.env.RENDER_EXTERNAL_URL
          : "https://ai-studypulse.vercel.app";
    } else {
      frontendUrl = "http://localhost:5173";
    }
  }

  return frontendUrl.replace(/\/$/, "");
}

// Send email to all students in a class (CLASSROOM)
async function sendEmailToClass(
  students,
  className,
  title,
  content,
  type,
  classId = null,
) {
  const emails = students.map((s) => s.email).filter(Boolean);
  if (emails.length === 0) return;

  const frontendUrl = getFrontendUrl();

  // Create direct link based on type
  let directLink = `${frontendUrl}/dashboard`;
  if (classId) {
    switch (type) {
      case "announcement":
        directLink = `${frontendUrl}/student/class/${classId}/announcements`;
        break;
      case "assignment":
        directLink = `${frontendUrl}/student/class/${classId}/assignments`;
        break;
      case "material":
        directLink = `${frontendUrl}/student/class/${classId}/materials`;
        break;
      default:
        directLink = `${frontendUrl}/student/class/${classId}`;
    }
  }

  const typeColors = {
    announcement: { bg: "#e0e7ff", color: "#4f46e5", icon: "📢" },
    assignment: { bg: "#dcfce7", color: "#16a34a", icon: "📝" },
    material: { bg: "#fef3c7", color: "#d97706", icon: "📂" },
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
        .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; margin-top: 15px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
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
          <a href="${directLink}" class="btn">🚀 View in Class →</a>
        </div>
        <div class="footer">
          <p>StudyPulse AI - Learn Smarter with AI 🚀</p>
          <p style="font-size: 10px; margin-top: 5px;">You received this email because you're enrolled in this class.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const plainText = `${type.toUpperCase()}: ${title}\n\n${content}\n\nView on StudyPulse: ${directLink}`;

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

// Send email notification (single user) - for reminders
async function sendEmailNotification(
  userEmail,
  userName,
  title,
  message,
  link = null,
) {
  try {
    const frontendUrl = getFrontendUrl();
    const actionLink = link || `${frontendUrl}/dashboard`;

    await transporter.sendMail({
      from: `"StudyPulse AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h2>📚 StudyPulse AI</h2>
            <h3>${title}</h3>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.5; color: #333;">${message}</p>
            <a href="${actionLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; margin-top: 20px; font-weight: 600;">🚀 Take Action →</a>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">StudyPulse AI - Learn Smarter with AI 🚀</p>
          </div>
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
  const [hour, minute] = studyTime.split(":");
  const scheduledFor = new Date();
  scheduledFor.setHours(parseInt(hour), parseInt(minute), 0, 0);
  if (scheduledFor < new Date()) {
    scheduledFor.setDate(scheduledFor.getDate() + 1);
  }

  return await Notification.create({
    user: userId,
    type: "daily",
    title: "📚 Time to Study!",
    message: `Don't forget your daily study session. Open StudyPulse and continue learning!`,
    scheduledFor: scheduledFor,
  });
}

// Create assignment reminder
async function createAssignmentReminder(
  userId,
  assignmentTitle,
  dueDate,
  assignmentId = null,
  classId = null,
) {
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 1);

  const frontendUrl = getFrontendUrl();
  const actionLink =
    assignmentId && classId
      ? `${frontendUrl}/student/class/${classId}/assignments/${assignmentId}`
      : `${frontendUrl}/dashboard`;

  return await Notification.create({
    user: userId,
    type: "assignment",
    title: "📝 Assignment Due Tomorrow!",
    message: `Your assignment "${assignmentTitle}" is due tomorrow. Submit it on time!`,
    scheduledFor: reminderDate,
    metadata: { assignmentTitle, dueDate, assignmentId, classId, actionLink },
  });
}

// Create quiz recommendation
async function createQuizRecommendation(userId, weakTopics, quizId = null) {
  const topics = weakTopics.join(", ");
  const frontendUrl = getFrontendUrl();
  const actionLink = quizId
    ? `${frontendUrl}/quizzes/${quizId}`
    : `${frontendUrl}/quizzes/generate`;

  return await Notification.create({
    user: userId,
    type: "quiz",
    title: "🎯 Quiz Recommendation",
    message: `We noticed you need practice on: ${topics}. Generate a quiz now to improve!`,
    scheduledFor: new Date(),
    metadata: { weakTopics, quizId, actionLink },
  });
}

// Send group email notification (STUDY GROUPS)
async function sendGroupEmailNotification(
  userEmail,
  userName,
  groupName,
  message,
  type,
  groupId = null,
) {
  try {
    const typeLabels = {
      new_message: "💬 New Message",
      member_joined: "👋 New Member Joined",
      member_left: "👋 Member Left",
      member_removed: "⚠️ Member Removed",
      shared_note: "📓 Note Shared",
      shared_quiz: "📝 Quiz Shared",
      shared_video: "🎥 Video Shared",
      shared_insight: "💡 Insight Shared",
      shared_flashcard: "🃏 Flashcard Shared",
      shared_file: "📄 File Shared",
    };

    const title = typeLabels[type] || "Group Update";
    const frontendUrl = getFrontendUrl();

    // Create direct link to the group
    const groupLink = groupId
      ? `${frontendUrl}/study-groups?group=${groupId}`
      : `${frontendUrl}/study-groups`;

    await transporter.sendMail({
      from: `"StudyPulse AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${title} - ${groupName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 20px; }
            .container { max-width: 550px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .message { background: #f8fafc; padding: 15px; border-radius: 12px; margin: 15px 0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; margin-top: 15px; font-weight: 600; }
            .btn-group { background: linear-gradient(135deg, #22c55e, #16a34a); }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 StudyPulse AI</h1>
              <p style="margin: 5px 0 0;">${groupName}</p>
            </div>
            <div class="content">
              <h3>${title}</h3>
              <div class="message">
                ${message}
              </div>
              <a href="${groupLink}" class="btn btn-group">🚀 Go to Group →</a>
              <p style="font-size: 12px; color: #666; margin-top: 15px;">
                <strong>💡 Tip:</strong> Click the button above to join the conversation directly!
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">StudyPulse AI - Learn Smarter with AI 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`✅ Group email sent to ${userEmail}`);
    return true;
  } catch (err) {
    console.error("Group email send error:", err);
    return false;
  }
}

// Send classroom notification email (with direct link)
async function sendClassroomNotification(
  userEmail,
  userName,
  className,
  title,
  message,
  type,
  classId,
  itemId = null,
) {
  try {
    const frontendUrl = getFrontendUrl();

    // Create direct link based on type
    let directLink = `${frontendUrl}/student/class/${classId}`;
    switch (type) {
      case "announcement":
        directLink = itemId
          ? `${frontendUrl}/student/class/${classId}/announcements#${itemId}`
          : `${frontendUrl}/student/class/${classId}/announcements`;
        break;
      case "assignment":
        directLink = itemId
          ? `${frontendUrl}/student/class/${classId}/assignments/${itemId}`
          : `${frontendUrl}/student/class/${classId}/assignments`;
        break;
      case "material":
        directLink = `${frontendUrl}/student/class/${classId}/materials`;
        break;
      default:
        directLink = `${frontendUrl}/student/class/${classId}`;
    }

    const typeIcons = {
      announcement: "📢",
      assignment: "📝",
      material: "📂",
    };

    const icon = typeIcons[type] || "📚";

    await transporter.sendMail({
      from: `"StudyPulse AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${icon} ${title} - ${className}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 20px; }
            .container { max-width: 550px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .message { background: #f8fafc; padding: 15px; border-radius: 12px; margin: 15px 0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; margin-top: 15px; font-weight: 600; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 StudyPulse AI</h1>
              <p>${className}</p>
            </div>
            <div class="content">
              <h3>${icon} ${title}</h3>
              <div class="message">${message}</div>
              <a href="${directLink}" class="btn">🚀 View in Class →</a>
            </div>
            <div class="footer">
              <p>StudyPulse AI - Learn Smarter with AI 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (err) {
    console.error("Classroom email send error:", err);
    return false;
  }
}

// Cron job to send notifications
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const pendingNotifications = await Notification.find({
    scheduledFor: { $lte: now },
    sent: false,
  }).populate("user", "name email");

  for (const notification of pendingNotifications) {
    if (notification.user?.email) {
      const actionLink = notification.metadata?.actionLink || null;
      await sendEmailNotification(
        notification.user.email,
        notification.user.name,
        notification.title,
        notification.message,
        actionLink,
      );
    }

    const io = require("../server").io;
    if (io) {
      io.to(notification.user._id.toString()).emit("newNotification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
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
  sendEmailToClass,
  sendGroupEmailNotification,
  sendClassroomNotification,
  getFrontendUrl,
};
