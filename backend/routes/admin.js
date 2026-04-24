const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/role");

const {
  getAllUsers,
  getUserDetails,
  deleteUserByAdmin,
  getStudentClassesAdmin,
  getStudentSubmissionsAdmin,
  getAssignmentSubmissionsAdmin,
  getClassByIdAdmin,
  getTeacherClassesAdmin,
  getClassByIdTeacherAdmin
} = require("../controllers/adminController");

// ✅ NEW CONTROLLERS FOR STUDENT FULL DATA
const Flashcard = require("../models/Flashcard");
const Bookmark = require("../models/Bookmark");
const VideoSummary = require("../models/VideoSummary");
const StudyGroup = require("../models/StudyGroup");
const Message = require("../models/Message");
const ChatSession = require("../models/ChatSession");

/* ================= USERS ================= */
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUserByAdmin);
const aiAnalyticsController = require("../controllers/aiAnalyticsController");


/* ================= STUDENT - FULL DATA ================= */
// Get student's flashcards
router.get("/students/:id/flashcards", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student's bookmarks
router.get("/students/:id/bookmarks", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student's video summaries
router.get("/students/:id/videos", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const videos = await VideoSummary.find({ user: req.params.id }).sort({ savedAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student's study groups
router.get("/students/:id/groups", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const groups = await StudyGroup.find({ members: req.params.id }).populate("createdBy", "name email");
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student's chat messages
router.get("/students/:id/chats", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const messages = await Message.find({ user: req.params.id, type: "chat" }).sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student's chat sessions
router.get("/students/:id/chat-sessions", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.params.id }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= EXISTING ROUTES ================= */
router.get("/students/:id/classes", authMiddleware, roleMiddleware("admin"), getStudentClassesAdmin);
router.get("/students/:id/submissions", authMiddleware, roleMiddleware("admin"), getStudentSubmissionsAdmin);
router.get("/assignment/:assignmentId/submissions", authMiddleware, roleMiddleware("admin"), getAssignmentSubmissionsAdmin);
router.get("/classes/:id", authMiddleware, roleMiddleware("admin"), getClassByIdAdmin);
router.get("/teachers/:id/classes", authMiddleware, roleMiddleware("admin"), getTeacherClassesAdmin);
router.get("/teacher/classes/:classId", authMiddleware, roleMiddleware("admin"), getClassByIdTeacherAdmin);
router.get("/analytics/overall", authMiddleware, roleMiddleware("admin"), aiAnalyticsController.getOverallAnalytics);
router.get("/analytics/hourly", authMiddleware, roleMiddleware("admin"), aiAnalyticsController.getHourlyUsage);

module.exports = router;