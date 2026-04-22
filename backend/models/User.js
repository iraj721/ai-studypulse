// backend/models/User.js
const mongoose = require('mongoose');
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student','teacher','admin'], default: 'student' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
