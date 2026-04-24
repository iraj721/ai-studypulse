const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");
const ChatSession = require("../models/ChatSession");
const Message = require("../models/Message");

if (!chatController.getMessages || !chatController.sendMessage) {
  throw new Error("ChatController functions missing!");
}

// GET /api/chat - fetch all messages
router.get("/", authMiddleware, chatController.getMessages);

// POST /api/chat - send a message to AI
router.post("/", authMiddleware, chatController.sendMessage);

// POST /api/chat/stream - streaming response (like ChatGPT)
router.post("/stream", authMiddleware, chatController.sendMessageStream);

// ==================== CHAT SESSION ROUTES ====================

// Get all chat sessions for user
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt');
    res.json(sessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single chat session
router.get("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    
    res.json(session);
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new chat session
router.post("/sessions", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.create({
      user: req.user._id,
      title: title || "New Chat",
      messages: []
    });
    res.status(201).json(session);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete chat session
router.delete("/sessions/:id", authMiddleware, async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    
    res.json({ message: "Chat session deleted successfully" });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Send message in session
router.post("/sessions/:id/message", authMiddleware, chatController.sendMessageInSession);

module.exports = router;