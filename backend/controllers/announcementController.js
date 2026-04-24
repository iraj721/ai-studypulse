const Announcement = require("../models/Announcement");
const Class = require("../models/Class");
const { sendEmailToClass } = require("../services/notificationService");

// Teacher: Create announcement with email
exports.createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, attachment } = req.body;

    if (!text) return res.status(400).json({ message: "Announcement text is required" });

    const cls = await Class.findById(id).populate("students", "email name");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const announcement = await Announcement.create({
      class: cls._id,
      teacher: req.user._id,
      text,
      attachment: attachment || null,
    });

    // Send email notifications
    await sendEmailToClass(cls.students, cls.name, "New Announcement", text, "announcement");

    res.status(201).json({ 
      success: true,
      message: "Announcement posted and emails sent!",
      announcement 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get announcements for a class
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