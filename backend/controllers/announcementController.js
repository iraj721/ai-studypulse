const Announcement = require("../models/Announcement");
const Class = require("../models/Class");
const User = require("../models/User");
const { sendClassroomNotification } = require("../services/notificationService");

// Teacher: Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, attachment } = req.body;

    if (!text) return res.status(400).json({ message: "Announcement text is required" });

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const announcement = await Announcement.create({
      class: cls._id,
      teacher: req.user._id,
      text,
      attachment: attachment || null,
    });

    // ✅ Send email to all students
    const students = await User.find({ _id: { $in: cls.students } });
    for (const student of students) {
      await sendClassroomNotification(
        student.email,
        student.name,
        cls.name,
        text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        "📢 New Announcement",
        "announcement",
        cls._id,
        announcement._id
      );
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get announcements
exports.getAnnouncementsForClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (!cls.students.includes(req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const announcements = await Announcement.find({ class: classId })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");

    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Reply to announcement - WITH EMAIL TO TEACHER
exports.replyToAnnouncement = async (req, res) => {
  try {
    const { classId, announcementId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: "Reply text required" });

    const cls = await Class.findById(classId).populate("teacher", "name email");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (!cls.students.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    announcement.replies.push({
      student: req.user._id,
      studentName: req.user.name,
      text: text.trim(),
    });
    await announcement.save();

    // ✅ Send email to teacher
    if (cls.teacher && cls.teacher.email) {
      await sendClassroomNotification(
        cls.teacher.email,
        cls.teacher.name,
        cls.name,
        `${req.user.name} replied: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
        "💬 New Reply on Announcement",
        "announcement",
        classId,
        announcementId
      );
    }

    res.json({ message: "Reply added successfully", replies: announcement.replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};