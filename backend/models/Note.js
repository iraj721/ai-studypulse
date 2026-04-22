// backend/models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  instructions: { type: String, default: '' }, // optional additional user instructions
  content: { type: String, required: true }, // AI-generated notes HTML/Markdown/plaintext
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);
