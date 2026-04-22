const Message = require("../models/Message");
const askHF = require("../services/aiService"); // HF AI service

// Fetch all real-time chat messages of the logged-in user
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      user: req.user._id,
      $or: [
        { type: "chat" },       // new messages
        { type: { $exists: false } } // old messages without type
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a chat message and get AI reply
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Save user message as type 'chat'
    const userMessage = await Message.create({
      user: req.user._id,
      role: "user",
      text,
      type: "chat", // real-time chat
    });

    // Get AI reply from Hugging Face
    const aiText = await askHF(text);

    // Save AI message as type 'chat'
    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: aiText,
      type: "chat", // real-time chat
    });

    return res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMessages, sendMessage };
