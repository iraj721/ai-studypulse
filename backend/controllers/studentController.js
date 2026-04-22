const Material = require("../models/Material");
const Announcement = require("../models/Announcement");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Class = require("../models/Class");

/* 📖 Get Student Joined Classes */
exports.getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id }).populate("teacher", "name email");
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🎓 Join Class by Code */
exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;
    const cls = await Class.findOne({ code });
    if (!cls) return res.status(404).json({ message: "Invalid class code" });

    if (cls.students.includes(req.user._id))
      return res.status(400).json({ message: "Already joined" });

    cls.students.push(req.user._id);
    await cls.save();

    res.json({ message: "Class joined successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Get single class details for student */
exports.getStudentClassDetails = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId).populate("teacher", "name email");
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.students.includes(req.user._id))
      return res.status(403).json({ message: "Access denied" });

    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentClassesCount = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id }).populate("teacher", "name");
    res.json({
      count: classes.length,
      lastClass: classes[classes.length - 1] || null, // teacher populated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET Student Class Dashboard
exports.getClassDashboard = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId).populate("teacher", "name email");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Check student
    if (!cls.students.includes(req.user._id))
      return res.status(403).json({ message: "Access denied" });

    // Fetch data
    const [assignments, announcements, materials] = await Promise.all([
      Assignment.find({ class: classId }).sort({ createdAt: -1 }),
      Announcement.find({ class: classId }).sort({ createdAt: -1 }),
      Material.find({ class: classId }).sort({ createdAt: -1 }),
    ]);

    // Map student submissions
    const submissions = await Submission.find({ student: req.user._id, assignment: { $in: assignments.map(a => a._id) } });

    const assignmentsWithSubmission = assignments.map(a => {
      const submission = submissions.find(s => s.assignment.toString() === a._id.toString());
      return { ...a.toObject(), submitted: !!submission, submission: submission ? submission.toObject() : null };
    });

    res.json({ class: cls, assignments: assignmentsWithSubmission, announcements, materials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* Get assignments for a class along with submission status */
exports.getAssignmentsForClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.students.includes(req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const assignments = await Assignment.find({ class: cls._id }).sort({ createdAt: -1 });

    const assignmentsWithSubmission = await Promise.all(
      assignments.map(async (a) => {
        const submission = await Submission.findOne({ assignment: a._id, student: req.user._id });
        return {
          ...a.toObject(),
          submitted: !!submission,
          submission: submission ? submission.toObject() : null
        };
      })
    );

    res.json(assignmentsWithSubmission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Submit assignment (file + optional text) */
exports.submitAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.students.includes(req.user._id)) return res.status(403).json({ message: "Access denied" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const now = new Date();
    if (assignment.dueDate && now > assignment.dueDate)
      return res.status(400).json({ message: "Cannot submit after due date" });

    // Remove existing submission if any
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) {
      if (existing.file && fs.existsSync(existing.file)) fs.unlinkSync(existing.file);
      await existing.deleteOne();
    }

    const fileUrl = req.file ? req.file.path : null;
    const { answerText } = req.body;

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      file: fileUrl,
      answerText: answerText || "",
    });

    res.status(201).json({ message: "Assignment submitted successfully", submission });
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🗑️ Unsend Submission (before due date) */
exports.unsendSubmission = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;

    // Check class
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.students.includes(req.user._id))
      return res.status(403).json({ message: "Access denied" });

    // Check assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Check due date
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate))
      return res.status(400).json({ message: "Cannot unsend after due date" });

    // Find submission
    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });
    if (!submission) return res.status(400).json({ message: "No submission found" });

    // Delete uploaded file if exists
    if (submission.file) {
      const fs = require("fs");
      const path = submission.file; // this should be the full path like "uploads/submissions/xyz.docx"
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }

    // Remove submission document
    await Submission.deleteOne({ _id: submission._id });

    res.json({ message: "Submission unsent successfully" });
  } catch (err) {
    console.error("Error unsending submission:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Reply to announcement
exports.replyToAnnouncement = async (req, res) => {
  try {
    const { classId, announcementId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: "Reply text required" });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Check if student belongs to class
    if (!cls.students.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    // Add reply
    announcement.replies.push({
      student: req.user._id,
      studentName: req.user.name,
      text: text.trim(),
    });

    await announcement.save();
    res.json({ message: "Reply added successfully", replies: announcement.replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🚪 Leave Class (Student) */
exports.leaveClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // check student
    if (!cls.students.includes(req.user._id)) {
      return res.status(400).json({ message: "You are not enrolled in this class" });
    }

    // remove student
    cls.students = cls.students.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await cls.save();

    res.json({ message: "You have left the class successfully" });
  } catch (err) {
    console.error("Leave class error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
