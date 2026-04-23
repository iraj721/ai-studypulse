const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const chatSessionController = require("../controllers/chatSessionController");

// Session routes
router.get("/sessions", authMiddleware, chatSessionController.getChatSessions);
router.get("/sessions/:id", authMiddleware, chatSessionController.getChatSession);
router.post("/sessions", authMiddleware, chatSessionController.createChatSession);
router.delete("/sessions/:id", authMiddleware, chatSessionController.deleteChatSession);
router.put("/sessions/:id/title", authMiddleware, chatSessionController.updateChatTitle);
router.post("/sessions/:id/message", authMiddleware, chatSessionController.sendMessageInSession);

module.exports = router;