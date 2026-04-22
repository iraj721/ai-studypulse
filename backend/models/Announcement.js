const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentName: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AnnouncementSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  attachment: {
    type: String // file URL (later)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  replies: [replySchema],
},
{timestamps: true}
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
