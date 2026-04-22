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

/* ================= USERS ================= */
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUserByAdmin);

/* ================= STUDENT ================= */
router.get(
  "/students/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentClassesAdmin
);

router.get(
  "/students/:id/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentSubmissionsAdmin
);

/* ================= TEACHER (ADMIN VIEW) ================= */

// ✅ THIS IS THE ONLY TEACHER CLASSES ROUTE
router.get(
  "/teachers/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  getTeacherClassesAdmin
);

// ✅ Single class full details (teacher class)
router.get(
  "/teacher/classes/:classId",
  authMiddleware,
  roleMiddleware("admin"),
  getClassByIdTeacherAdmin
);

/* ================= ASSIGNMENTS ================= */
router.get(
  "/assignment/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getAssignmentSubmissionsAdmin
);

/* ================= CLASS ================= */
router.get(
  "/classes/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getClassByIdAdmin
);

module.exports = router;
