const express = require("express");
const router = express.Router();
const { assignments, materials } = require("../middleware/cloudinaryUpload");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

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
router.get("/classes", auth, role("teacher"), getTeacherClasses);
router.get("/classes/:id", auth, getClassById);
// Delete class
router.delete("/classes/:classId", auth, role("teacher"), deleteClass);

// =====================
// Announcement Routes
// =====================
router.post(
  "/classes/:id/announcement",
  auth,
  role("teacher"),
  createAnnouncement
);
router.get("/classes/:id/announcements", auth, getAnnouncementsForClass);
router.put(
  "/classes/:id/announcement/:announcementId",
  auth,
  role("teacher"),
  editAnnouncement
);
router.delete(
  "/classes/:id/announcement/:announcementId",
  auth,
  role("teacher"),
  deleteAnnouncement
);

// Remove student from class
router.delete(
  "/classes/:classId/students/:studentId",
  auth,
  role("teacher"),
  removeStudentFromClass
);

// =====================
// Assignment Routes
// =====================
router.post(
  "/classes/:classId/assignments",
  auth,
  role("teacher"),
  assignments.single("attachment"),
  createAssignment
);

// Get assignments for a class
router.get("/classes/:classId/assignments", auth, getAssignmentsByClass);

// Get submissions for an assignment
router.get(
  "/classes/:classId/assignments/:assignmentId/submissions",
  auth,
  getSubmissionsByAssignment
);

router.put(
  "/classes/:classId/assignments/:assignmentId",
  auth,
  role("teacher"),
  assignments.single("attachment"),
  updateAssignment
);

// Delete assignment
router.delete(
  "/classes/:classId/assignments/:assignmentId",
  auth,
  role("teacher"),
  deleteAssignment
);

// Assign marks to a student's submission
router.put(
  "/classes/:classId/assignments/:assignmentId/submissions/:submissionId/marks",
  auth,
  role("teacher"),
  assignMarksToSubmission
);

// =====================
// Material Routes
// =====================
router.post(
  "/classes/:id/material",
  auth,
  role("teacher"),
  materials.single("file"),
  uploadMaterial
);

// Get materials for a class
router.get("/classes/:id/materials", auth, getMaterialsForClass);

// Update material (optional file, title, content)
router.put(
  "/classes/:classId/material/:materialId",
  auth,
  role("teacher"),
  materials.single("file"),
  updateMaterial
);

// Delete material
router.delete(
  "/classes/:classId/material/:materialId",
  auth,
  role("teacher"),
  deleteMaterial
);

module.exports = router;
