const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, 
    default: ""
  },
  fileUrl: {
    type: String, 
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Material", MaterialSchema);
