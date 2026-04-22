const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  code: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
  announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Announcement" }],
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Class", ClassSchema);
