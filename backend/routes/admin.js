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
  getClassByIdTeacherAdmin,
  getStudentClassFullDetails,
} = require("../controllers/adminController");

// Models for student data
const Flashcard = require("../models/Flashcard");
const Bookmark = require("../models/Bookmark");
const VideoSummary = require("../models/VideoSummary");
const StudyGroup = require("../models/StudyGroup");
const Message = require("../models/Message");
const ChatSession = require("../models/ChatSession");
const teacherApprovalController = require("../controllers/teacherApprovalController");
const aiAnalyticsController = require("../controllers/aiAnalyticsController");
const { getGroupDetailsAdmin } = require("../controllers/adminGroupController");
const { getOverallAnalytics, getHourlyUsage, getUserAnalytics } = require("../controllers/aiAnalyticsController");


/* ================= USERS ================= */
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUserByAdmin);

/* ================= STUDENT - FULL DATA ================= */
router.get("/students/:id/flashcards", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students/:id/bookmarks", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students/:id/videos", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const videos = await VideoSummary.find({ user: req.params.id }).sort({ savedAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ FIXED: Groups route - handles both old and new member structures
router.get("/students/:id/groups", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Try to find groups using new structure (members.user)
    let groups = await StudyGroup.find({ 
      "members.user": studentId 
    }).populate("createdBy", "name email");
    
    // If no groups found with new structure, try old structure (members array)
    if (groups.length === 0) {
      groups = await StudyGroup.find({ 
        members: studentId 
      }).populate("createdBy", "name email");
    }
    
    // Transform groups to consistent format for frontend
    const transformedGroups = groups.map(group => {
      const groupObj = group.toObject();
      // Handle both member structures
      if (group.members && group.members.length > 0) {
        if (group.members[0] && group.members[0].user) {
          // New structure: members is array of objects with user field
          groupObj.members = group.members.map(m => m.user);
        } else {
          // Old structure: members is array of user IDs
          groupObj.members = group.members;
        }
      }
      return groupObj;
    });
    
    res.json(transformedGroups);
  } catch (err) {
    console.error("Error fetching student groups:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.get("/students/:id/chats", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const messages = await Message.find({ user: req.params.id, type: "chat" }).sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students/:id/chat-sessions", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.params.id }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CRITICAL: Add this missing route
router.get("/students/:studentId/classes/:classId", authMiddleware, roleMiddleware("admin"), getStudentClassFullDetails);

/* ================= EXISTING ROUTES ================= */
router.get("/students/:id/classes", authMiddleware, roleMiddleware("admin"), getStudentClassesAdmin);
router.get("/students/:id/submissions", authMiddleware, roleMiddleware("admin"), getStudentSubmissionsAdmin);
router.get("/assignment/:assignmentId/submissions", authMiddleware, roleMiddleware("admin"), getAssignmentSubmissionsAdmin);
router.get("/classes/:id", authMiddleware, roleMiddleware("admin"), getClassByIdAdmin);
router.get("/teachers/:id/classes", authMiddleware, roleMiddleware("admin"), getTeacherClassesAdmin);
router.get("/teacher/classes/:classId", authMiddleware, roleMiddleware("admin"), getClassByIdTeacherAdmin);
router.get("/analytics/overall", authMiddleware, roleMiddleware("admin"), aiAnalyticsController.getOverallAnalytics);
router.get("/analytics/hourly", authMiddleware, roleMiddleware("admin"), aiAnalyticsController.getHourlyUsage);
router.post("/teacher-approval/add", authMiddleware, roleMiddleware("admin"), teacherApprovalController.addApprovedTeacher);
router.get("/teacher-approval/list", authMiddleware, roleMiddleware("admin"), teacherApprovalController.getApprovedTeachers);
router.delete("/teacher-approval/:id", authMiddleware, roleMiddleware("admin"), teacherApprovalController.removeApprovedTeacher);
router.get("/groups/:groupId", authMiddleware, roleMiddleware("admin"), getGroupDetailsAdmin);
router.get("/analytics/user/:userId", authMiddleware, roleMiddleware("admin"), getUserAnalytics);

module.exports = router;