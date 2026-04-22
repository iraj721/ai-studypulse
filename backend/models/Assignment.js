const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  attachment: {
    type: String,
  },
  marks: { type: Number, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
