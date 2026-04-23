const mongoose = require('mongoose');

const VideoSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String },
  thumbnail: { type: String },
  summary: { type: String, required: true },
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoSummary', VideoSummarySchema);