const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['daily', 'assignment', 'quiz', 'streak'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  sentAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ user: 1, scheduledFor: 1, sent: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);