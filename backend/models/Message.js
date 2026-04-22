const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user','ai'], required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['chat','activity'], default: 'chat' }, // new field
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
