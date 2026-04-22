const nodemailer = require("nodemailer");

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service not configured properly:", error);
  } else {
    console.log("✅ Email service ready");
  }
});

const sendVerificationEmail = async (email, code, name) => {
  try {
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; letter-spacing: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to StudyPulse, ${name}! 👋</h2>
        <p>Please verify your email address to complete registration.</p>
        <div class="code">${code}</div>
        <p>Enter this code on the verification page. This code expires in <strong>10 minutes</strong>.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <div class="footer">StudyPulse - Your AI Study Companion</div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: `"StudyPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - StudyPulse",
      html,
    });
    
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send verification email to ${email}:`, err.message);
    // Don't throw - let the user know but don't crash
    return false;
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const html = `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px;">
      <h2>Welcome to StudyPulse, ${name}! 🎉</h2>
      <p>Your account has been successfully verified. You can now:</p>
      <ul>
        <li>📚 Generate AI-powered study notes</li>
        <li>📝 Take quizzes on any topic</li>
        <li>💬 Chat with AI study assistant</li>
        <li>📊 Track your study progress</li>
        <li>👥 Join classes and collaborate</li>
      </ul>
      <p>Get started by exploring your dashboard!</p>
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">StudyPulse - Learn Smarter with AI</div>
    </div>`;

    await transporter.sendMail({
      from: `"StudyPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to StudyPulse! 🎉",
      html,
    });
    return true;
  } catch (err) {
    console.error(`Failed to send welcome email to ${email}:`, err.message);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px;">
      <h2>Reset Your Password 🔐</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">StudyPulse - Security Alert</div>
    </div>`;

    await transporter.sendMail({
      from: `"StudyPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - StudyPulse",
      html,
    });
    return true;
  } catch (err) {
    console.error(`Failed to send reset email to ${email}:`, err.message);
    return false;
  }
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };