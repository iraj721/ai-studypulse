const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const sharedDir = path.join(__dirname, "../uploads/shared");
if (!fs.existsSync(sharedDir)) {
  fs.mkdirSync(sharedDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, sharedDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupDetails,
  sendMessage,
  deleteMessage,
  deleteSharedContent,
  shareNote,
  shareQuiz,
  shareYouTubeSummary,
  shareInsight,
  shareFlashcard,
  shareFlashcardGroup,
  shareFile,
  getSharedContent,
  viewSharedNote,
  viewSharedQuiz,
  viewSharedFlashcard,
  leaveGroup,  
  removeMember,
  getGroupMembers, 
} = require("../controllers/studyGroupController");

// All routes are protected
router.use(protect);

// Group management
router.post("/groups/create", createGroup);
router.post("/groups/join", joinGroup);
router.get("/groups", getUserGroups);
router.get("/groups/:id", getGroupDetails);

// Messages
router.post("/groups/:id/messages", sendMessage);
router.delete("/groups/:id/messages/:messageId", deleteMessage);

// Shared content
router.get("/groups/:id/shared-content", getSharedContent);
router.delete("/groups/:id/shared-content/:contentId", deleteSharedContent);

// View shared content routes
router.get("/groups/:groupId/view-note/:noteId", viewSharedNote);
router.get("/groups/:groupId/view-quiz/:quizId", viewSharedQuiz);
router.get("/groups/:groupId/view-flashcard/:flashcardId", viewSharedFlashcard);

// Share specific content
router.post("/groups/:id/share-note", shareNote);
router.post("/groups/:id/share-quiz", shareQuiz);
router.post("/groups/:id/share-youtube", shareYouTubeSummary);
router.post("/groups/:id/share-insight", shareInsight);
router.post("/groups/:id/share-flashcard", shareFlashcard);
router.post("/groups/:id/share-flashcard-group", shareFlashcardGroup);
router.post("/groups/:id/share-file", upload.single("file"), shareFile);
// Leave group
router.post("/groups/:id/leave", leaveGroup);

// Remove member (creator only)
router.delete("/groups/:id/members/:memberId", removeMember);

// Get group members
router.get("/groups/:id/members", getGroupMembers);

module.exports = router;
