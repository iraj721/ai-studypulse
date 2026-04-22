const User = require("../models/User");
const Activity = require("../models/Activity");
const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const AIInsight = require("../models/AIInsight");
const Class = require("../models/Class");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Announcement = require("../models/Announcement");
const Material = require("../models/Material");
const mongoose = require("mongoose");



/* =====================================================
   👥 Get all registered users (Exclude admins)
===================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   👤 Get single user FULL detailed data (ADMIN VIEW)
===================================================== */
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const activities = await Activity.find({ user: userId }).sort({ createdAt: -1 });
    const quizzes = await Quiz.find({ user: userId }).sort({ createdAt: -1 });
    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });
    const aiInsights = await AIInsight.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ user, activities, quizzes, notes, aiInsights });
  } catch (err) {
    console.error("User details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🗑 DELETE USER (ADMIN ONLY – PERMANENT)
===================================================== */
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot delete himself" });
    }

    await Activity.deleteMany({ user: userId });
    await Quiz.deleteMany({ user: userId });
    await Note.deleteMany({ user: userId });
    await AIInsight.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and all related data deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🎓 Get classes joined by a student (ADMIN)
===================================================== */
exports.getStudentClassesAdmin = async (req, res) => {
  try {
    const studentId = req.params.id;

    const classes = await Class.find({ students: studentId })
      .populate("teacher", "name email")
      .select("name subject teacher createdAt");

    res.status(200).json({ classes });
  } catch (err) {
    console.error("Get student classes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🎓 Get all submissions of a student (ADMIN)
===================================================== */
exports.getStudentSubmissionsAdmin = async (req, res) => {
  try {
    const studentId = req.params.id;

    const submissions = await Submission.find({ student: studentId })
      .populate({
        path: "assignment",
        select: "title dueDate",
        populate: {
          path: "class",
          select: "name subject",
          populate: { path: "teacher", select: "name email" }
        }
      })
      .sort({ submittedAt: -1 });

    res.status(200).json({ submissions });
  } catch (err) {
    console.error("Get student submissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📝 Get all submissions of an assignment (ADMIN)
===================================================== */
exports.getAssignmentSubmissionsAdmin = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ submissions });
  } catch (err) {
    console.error("Get assignment submissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🏫 Get single class FULL details (ADMIN)
===================================================== */
exports.getClassByIdAdmin = async (req, res) => {
  try {
    const classId = req.params.id;

    const cls = await Class.findById(classId)
      .populate("teacher", "name email")
      .populate("students", "name email")
      .populate("materials");

    if (!cls) return res.status(404).json({ message: "Class not found" });

    const assignments = await Assignment.find({ class: classId }).sort({ createdAt: -1 });

    res.status(200).json({
      _id: cls._id,
      name: cls.name,
      subject: cls.subject,
      code: cls.code,
      teacher: cls.teacher,
      students: cls.students,
      announcements: cls.announcements,
      materials: cls.materials,
      assignments,
    });
  } catch (err) {
    console.error("Get class by admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🎓 Get all classes created by a teacher (ADMIN)
===================================================== */
exports.getTeacherClassesAdmin = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const classes = await Class.find({
      teacher: new mongoose.Types.ObjectId(teacherId)
    })
      .populate("students", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ classes });
  } catch (err) {
    console.error("Get teacher classes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getTeacherSingleClassAdmin = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId)
      .populate("students", "name email")
      .populate("materials")
      .populate("announcements")
      .populate({
        path: "assignments",
        populate: {
          path: "submissions",
          populate: { path: "student", select: "name email" }
        }
      });

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(classData);
  } catch (error) {
    console.error("getTeacherSingleClassAdmin error:", error);
    res.status(500).json({ message: "Failed to load class details" });
  }
};

/* =====================================================
   🏫 Get single class FULL details for admin (teacher's class)
===================================================== */
exports.getClassByIdTeacherAdmin = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findById(classId)
      .populate("teacher", "name email")
      .populate("students", "name email")
      .lean();

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    const assignments = await Assignment.find({ class: classId })
      .sort({ createdAt: -1 })
      .lean();

    const announcements = await Announcement.find({ class: classId })
      .sort({ createdAt: -1 })
      .lean();

    const materials = await Material.find({ class: classId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      ...cls,
      assignments,
      announcements,
      materials,
    });
  } catch (err) {
    console.error("Get class by teacher admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

