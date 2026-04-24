const express = require("express");
const router = express.Router();
const { assignments, materials } = require("../middleware/cloudinaryUpload");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup for assignment submissions
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

const {
  createClass,
  getTeacherClasses,
  getClassById,
  createAnnouncement,
  getAnnouncementsForClass,
  editAnnouncement,
  deleteAnnouncement,
  removeStudentFromClass,
  deleteClass,
} = require("../controllers/teacherController");

const {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment,
  updateAssignment,
  deleteAssignment,
  assignMarksToSubmission,
  submitAssignment,
  unsendSubmission,
} = require("../controllers/assignmentController");

const {
  uploadMaterial,
  getMaterialsForClass,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

// =====================
// Class Routes
// =====================
router.post("/classes", auth, role("teacher"), createClass);
router.get("/classes", auth, getTeacherClasses);  // ✅ Remove role check for GET
router.get("/classes/:id", auth, getClassById);   // ✅ Remove role check for GET
router.delete("/classes/:classId", auth, role("teacher"), deleteClass);

// =====================
// Announcement Routes
// =====================
router.post("/classes/:id/announcement", auth, role("teacher"), createAnnouncement);
router.get("/classes/:id/announcements", auth, getAnnouncementsForClass);  // ✅ Remove role check
router.put("/classes/:id/announcement/:announcementId", auth, role("teacher"), editAnnouncement);
router.delete("/classes/:id/announcement/:announcementId", auth, role("teacher"), deleteAnnouncement);

// =====================
// Student Management Routes
// =====================
router.delete("/classes/:classId/students/:studentId", auth, role("teacher"), removeStudentFromClass);

// =====================
// Assignment Routes
// =====================
router.post("/classes/:classId/assignments", auth, role("teacher"), assignments.single("attachment"), createAssignment);
router.get("/classes/:classId/assignments", auth, getAssignmentsByClass);  // ✅ Remove role check
router.get("/classes/:classId/assignments/:assignmentId/submissions", auth, getSubmissionsByAssignment);  // ✅ Remove role check
router.put("/classes/:classId/assignments/:assignmentId", auth, role("teacher"), assignments.single("attachment"), updateAssignment);
router.delete("/classes/:classId/assignments/:assignmentId", auth, role("teacher"), deleteAssignment);
router.put("/classes/:classId/assignments/:assignmentId/submissions/:submissionId/marks", auth, role("teacher"), assignMarksToSubmission);

// Student submit assignment
router.post("/classes/:classId/assignments/:assignmentId/submit", auth, uploadSubmission.single("file"), submitAssignment);
router.delete("/classes/:classId/assignments/:assignmentId/unsend", auth, unsendSubmission);

// =====================
// Material Routes
// =====================
router.post("/classes/:id/material", auth, role("teacher"), materials.single("file"), uploadMaterial);
router.get("/classes/:id/materials", auth, getMaterialsForClass);  // ✅ Remove role check
router.put("/classes/:classId/material/:materialId", auth, role("teacher"), materials.single("file"), updateMaterial);
router.delete("/classes/:classId/material/:materialId", auth, role("teacher"), deleteMaterial);

module.exports = router;