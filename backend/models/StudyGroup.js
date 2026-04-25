const mongoose = require("mongoose");

// Chat Message Schema
const GroupMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "note", "quiz", "youtube", "insight", "flashcard", "file"],
    default: "text",
  },
  sharedData: { type: mongoose.Schema.Types.Mixed },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Shared Content Schema
const SharedContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["note", "quiz", "youtube", "insight", "flashcard", "file"],
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String },
  link: { type: String },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sharedByName: { type: String },
  sharedAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed },
});

// Member Schema with joinedAt
const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinedAt: { type: Date, default: Date.now },
});

const StudyGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  code: { type: String, required: true, unique: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [MemberSchema],  // Changed: now stores objects with joinedAt
  messages: [GroupMessageSchema],
  sharedContent: [SharedContentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create indexes
StudyGroupSchema.index({ code: 1 });
StudyGroupSchema.index({ members: 1 });

// Compile and export the model
const StudyGroup = mongoose.model("StudyGroup", StudyGroupSchema);

module.exports = StudyGroup;