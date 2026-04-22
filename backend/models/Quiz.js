const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String }],
      answer: { type: String }
    }
  ],
  score: { type: Number, default: null }, // user score
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
