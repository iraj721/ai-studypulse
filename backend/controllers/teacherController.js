const Class = require("../models/Class");
const User = require("../models/User");
const crypto = require("crypto");
const Assignment = require("../models/Assignment");
const Material = require("../models/Material");
const Announcement = require("../models/Announcement");

/* 🏫 Create Class (Teacher) */
exports.createClass = async (req, res) => {
  try {
    const { name, subject } = req.body;
    if (!name || !subject) return res.status(400).json({ message: "Name & subject are required" });

    let code;
    let exists = true;
    while (exists) {
      code = crypto.randomBytes(3).toString("hex").toUpperCase();
      const check = await Class.findOne({ code });
      if (!check) exists = false;
    }

    const newClass = await Class.create({ name, subject, code, teacher: req.user._id });
    res.status(201).json(newClass);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

/* 📚 Teacher Classes */
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* 🎓 Student Join Class */
exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;
    const cls = await Class.findOne({ code });
    if (!cls) return res.status(404).json({ message: "Invalid class code" });
    if (cls.students.includes(req.user._id)) return res.status(400).json({ message: "Already joined" });

    cls.students.push(req.user._id);
    await cls.save();
    res.json({ message: "Joined successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* 📖 Student Joined Classes */
exports.getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id }).populate("teacher", "name email");
    res.json(classes);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};


/* Get class by ID with all related data */
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const cls = await Class.findById(id)
      .populate("teacher", "name email")
      .populate("students", "name email") // ✅ IMPORTANT FIX
      .lean();

    if (!cls) return res.status(404).json({ message: "Class not found" });

    const [assignments, announcements, materials] = await Promise.all([
      Assignment.find({ class: id }).sort({ createdAt: -1 }).lean(),
      Announcement.find({ class: id })
        .sort({ createdAt: -1 })
        .populate("teacher", "name email")
        .lean(),
      Material.find({ class: id }).sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      ...cls,
      assignments,
      announcements,
      materials,
    });
  } catch (err) {
    console.error("getClassById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* Create announcement */
exports.createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    const classId = req.params.id;

    if (!text?.trim()) return res.status(400).json({ message: "Announcement text required" });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only teacher can post announcements" });

    const announcement = await Announcement.create({
      class: classId,
      teacher: req.user._id,
      text,
    });

    cls.announcements.push(announcement._id);
    await cls.save();

    res.status(201).json({ message: "Announcement posted successfully", announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Get announcements for class (teacher view) */
exports.getAnnouncementsForClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const announcements = await Announcement.find({ class: classId })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");

    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit announcement
exports.editAnnouncement = async (req, res) => {
  try {
    const { id, announcementId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Announcement text is required" });

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    announcement.text = text;
    await announcement.save();

    res.json({ message: "Announcement updated successfully", announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id, announcementId } = req.params;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const fileUrl = req.file ? req.file.path : null; // ✅ Cloudinary URL

    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const assignment = await Assignment.create({
      class: cls._id,
      title,
      description,
      dueDate,
      fileUrl,
    });

    cls.assignments.push(assignment._id);
    await cls.save();

    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const Submission = require("../models/Submission");

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeStudentFromClass = async (req, res) => {
  const { classId, studentId } = req.params;

  try {
    // 1. Remove student from class's students array
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $pull: { students: studentId } },
      { new: true }
    );

    if (!updatedClass) return res.status(404).json({ message: "Class not found" });

    // 2. Optionally, remove class from student's enrolled classes
    await User.findByIdAndUpdate(studentId, { $pull: { classes: classId } });

    res.json({ message: "Student removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🗑 Delete Class (Teacher Only) */
exports.deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // ✅ Only owner teacher can delete
    if (cls.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🧹 Clean related data
    await Assignment.deleteMany({ class: classId });
    await Material.deleteMany({ class: classId });
    await Announcement.deleteMany({ class: classId });

    // 🗑 Delete class
    await cls.deleteOne();

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("Delete class error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
