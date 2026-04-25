const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { studentSubmission } = require("../middleware/cloudinaryUpload");

// ==================== IMPORT CONTROLLERS ====================
const {
  getStudentClasses,
  joinClass,
  getAssignmentsForClass,
  submitAssignment,
  getStudentClassDetails,
  unsendSubmission,
  getClassDashboard,
  replyToAnnouncement,
  getStudentClassesCount,
  leaveClass,
} = require("../controllers/studentController");

const {
  getAnnouncementsForClass,
} = require("../controllers/announcementController");
const { getMaterialsForClass } = require("../controllers/materialController");

// Import controllers
const flashcardController = require("../controllers/flashcardController");
const videoSummaryController = require("../controllers/videoSummaryController");
const bookmarkController = require("../controllers/bookmarkController");

// ==================== EXISTING ROUTES ====================
router.get("/classes", auth, getStudentClasses);
router.post("/classes/join", auth, joinClass);
router.get("/classes/count", auth, getStudentClassesCount);
router.get("/classes/:classId", auth, getStudentClassDetails);
router.get("/classes/:classId/dashboard", auth, getClassDashboard);
router.get("/classes/:classId/assignments", auth, getAssignmentsForClass);
router.get("/classes/:classId/announcements", auth, getAnnouncementsForClass);
router.get("/classes/:classId/materials", auth, getMaterialsForClass);
router.post(
  "/classes/:classId/announcements/:announcementId/reply",
  auth,
  replyToAnnouncement,
);
router.delete("/classes/:classId/leave", auth, leaveClass);

// ==================== ASSIGNMENT SUBMIT ROUTES ====================
router.post(
  "/classes/:classId/assignments/:assignmentId/submit",
  auth,
  studentSubmission.single("file"),
  submitAssignment,
);
router.delete(
  "/classes/:classId/assignments/:assignmentId/unsend",
  auth,
  unsendSubmission,
);

// ==================== FLASHCARD ROUTES ====================
router.post(
  "/flashcards/generate",
  auth,
  flashcardController.generateFlashcards,
);
router.get("/flashcards/groups", auth, flashcardController.getFlashcardGroups);
router.get(
  "/flashcards/groups/:noteId",
  auth,
  flashcardController.getFlashcardGroup,
);
router.delete(
  "/flashcards/groups/:noteId",
  auth,
  flashcardController.deleteFlashcardGroup,
);
router.delete("/flashcards/:id", auth, flashcardController.deleteFlashcard);
router.put("/flashcards/:id/review", auth, flashcardController.reviewFlashcard);

// ==================== FLASHCARD GROUPS FOR SHARING ====================
router.get("/flashcard-groups", auth, async (req, res) => {
  try {
    const Flashcard = require("../models/Flashcard");
    const flashcards = await Flashcard.find({ user: req.user._id }).sort({ createdAt: -1 });

    const groups = {};
    flashcards.forEach((card) => {
      const key = card.noteId ? card.noteId.toString() : card._id.toString();
      if (!groups[key]) {
        groups[key] = {
          noteId: card.noteId,
          noteTopic: card.noteTopic || "General",
          noteSubject: card.noteSubject || "Study",
          flashcardCount: 0,
          flashcards: [],
        };
      }
      groups[key].flashcards.push(card);
      groups[key].flashcardCount++;
    });

    const result = Object.values(groups);
    console.log("Flashcard groups found:", result.length);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// ==================== VIDEO SUMMARY ROUTES ====================
router.post("/video/summarize", auth, videoSummaryController.summarizeVideo);
router.get("/video/summaries", auth, videoSummaryController.getUserSummaries);
router.delete(
  "/video/summaries/:id",
  auth,
  videoSummaryController.deleteSummary,
);

// ==================== BOOKMARK ROUTES ====================
router.post("/bookmarks", auth, bookmarkController.createBookmark);
router.get("/bookmarks", auth, bookmarkController.getUserBookmarks);
router.get("/bookmarks/collections", auth, bookmarkController.getCollections);
router.put("/bookmarks/:id", auth, bookmarkController.updateBookmark);
router.delete("/bookmarks/:id", auth, bookmarkController.deleteBookmark);

// ==================== AI INSIGHTS ROUTES ====================
const AIInsight = require("../models/AIInsight");

router.get("/insights", auth, async (req, res) => {
  try {
    const insights = await AIInsight.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log("✅ Insights found:", insights.length);
    res.json(insights);
  } catch (err) {
    console.error("❌ Insights API error:", err);
    res.json([]);
  }
});

router.get("/insights/:id", auth, async (req, res) => {
  try {
    const insight = await AIInsight.findOne({ _id: req.params.id, user: req.user._id });
    if (!insight) return res.status(404).json({ message: "Insight not found" });
    res.json(insight);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== DEBUG ROUTES ====================
router.get("/debug/flashcards", auth, async (req, res) => {
  try {
    const Flashcard = require("../models/Flashcard");
    const flashcards = await Flashcard.find({ user: req.user._id });
    console.log("Flashcards found:", flashcards.length);
    res.json({ count: flashcards.length, flashcards: flashcards });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;