const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  instructions: { type: String, default: '' },
  content: { type: String, required: true },
  sourceFile: { type: String, default: null },
  noteType: { type: String, enum: ['summary', 'detailed'], default: 'detailed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);