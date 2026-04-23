const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['note', 'quiz', 'activity', 'video'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  collectionName: { type: String, default: 'Default' },
  starred: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);