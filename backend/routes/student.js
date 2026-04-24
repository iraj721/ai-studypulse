const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================== MULTER CONFIGURATION (MUST BE BEFORE ROUTES) ====================
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/submissions";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadSubmission = multer({ 
  storage: submissionStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

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

const { getAnnouncementsForClass } = require("../controllers/announcementController");
const { getMaterialsForClass } = require("../controllers/materialController");

// Import new controllers
const flashcardController = require("../controllers/flashcardController");
const studyGroupController = require("../controllers/studyGroupController");
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
router.post("/classes/:classId/announcements/:announcementId/reply", auth, replyToAnnouncement);
router.delete("/classes/:classId/leave", auth, leaveClass);

// ==================== ASSIGNMENT SUBMIT ROUTES ====================
router.post("/classes/:classId/assignments/:assignmentId/submit", auth, uploadSubmission.single("file"), submitAssignment);
router.delete("/classes/:classId/assignments/:assignmentId/unsend", auth, unsendSubmission);

// ==================== FLASHCARD ROUTES ====================
router.post("/flashcards/generate", auth, flashcardController.generateFlashcards);
router.get("/flashcards/groups", auth, flashcardController.getFlashcardGroups);
router.get("/flashcards/groups/:noteId", auth, flashcardController.getFlashcardGroup);
router.delete("/flashcards/groups/:noteId", auth, flashcardController.deleteFlashcardGroup);
router.delete("/flashcards/:id", auth, flashcardController.deleteFlashcard);
router.put("/flashcards/:id/review", auth, flashcardController.reviewFlashcard);

// ==================== STUDY GROUP ROUTES ====================
router.post("/groups/create", auth, studyGroupController.createGroup);
router.post("/groups/join", auth, studyGroupController.joinGroup);
router.get("/groups", auth, studyGroupController.getUserGroups);
router.get("/groups/:id", auth, studyGroupController.getGroupDetails);
router.post("/groups/:id/notes", auth, studyGroupController.shareNote);
router.post("/groups/:id/messages", auth, studyGroupController.sendMessage);

// ==================== VIDEO SUMMARY ROUTES ====================
router.post("/video/summarize", auth, videoSummaryController.summarizeVideo);
router.get("/video/summaries", auth, videoSummaryController.getUserSummaries);
router.delete("/video/summaries/:id", auth, videoSummaryController.deleteSummary);

// ==================== BOOKMARK ROUTES ====================
router.post("/bookmarks", auth, bookmarkController.createBookmark);
router.get("/bookmarks", auth, bookmarkController.getUserBookmarks);
router.get("/bookmarks/collections", auth, bookmarkController.getCollections);
router.put("/bookmarks/:id", auth, bookmarkController.updateBookmark);
router.delete("/bookmarks/:id", auth, bookmarkController.deleteBookmark);

module.exports = router;