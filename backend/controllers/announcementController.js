const Announcement = require("../models/Announcement");
const Class = require("../models/Class");

// Teacher: Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params; // class id
    const { text, attachment } = req.body;

    if (!text) return res.status(400).json({ message: "Announcement text is required" });

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Only teacher can post
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const announcement = await Announcement.create({
      class: cls._id,
      teacher: req.user._id,
      text,
      attachment: attachment || null,
    });

    res.status(201).json(announcement);
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

    // Check student access
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
