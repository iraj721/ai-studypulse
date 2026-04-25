// backend/models/User.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  totalTokensUsed: { type: Number, default: 0 },  // ✅ ADD THIS FIELD
});

UserSchema.methods.generateVerificationCode = function() {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random()  * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

module.exports = mongoose.model("User", UserSchema);