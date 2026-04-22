const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  durationMinutes: { type: Number, default: 0 },
  notes: { type: String },
  accuracy: { type: Number, default: null },
  difficulty: { type: String, default: 'medium' }, // easy, medium, hard
  insights: [{ type: String }], // AI-generated suggestions
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
