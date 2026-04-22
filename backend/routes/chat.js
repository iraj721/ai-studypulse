const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

if (!chatController.getMessages || !chatController.sendMessage) {
  throw new Error("ChatController functions missing!");
}

// GET /api/chat - fetch all messages
router.get("/", authMiddleware, chatController.getMessages);

// POST /api/chat - send a message to AI
router.post("/", authMiddleware, chatController.sendMessage);

module.exports = router;
