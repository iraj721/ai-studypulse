const mongoose = require('mongoose');

const AIUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feature: { type: String, enum: ['chat', 'quiz', 'notes', 'flashcards', 'video'], required: true },
  tokensUsed: { type: Number, default: 0 },
  requestsCount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

// Index for efficient queries
AIUsageSchema.index({ user: 1, date: 1 });
AIUsageSchema.index({ date: 1 });

module.exports = mongoose.model('AIUsage', AIUsageSchema);