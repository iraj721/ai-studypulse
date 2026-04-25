const Material = require("../models/Material");
const Class = require("../models/Class");
const { sendEmailToClass, sendClassroomNotification } = require("../services/notificationService");

/* Helper to get frontend URL */
const getFrontendUrl = () => {
  let url = process.env.FRONTEND_URL || "http://localhost:5173";
  return url.replace(/\/$/, '');
};

/* Teacher upload with email - WITH DIRECT LINK */
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    const classId = req.params.id;

    if (!title?.trim())
      return res.status(400).json({ message: "Title required" });

    const cls = await Class.findById(classId).populate("students", "email name");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const material = await Material.create({
      class: classId,
      teacher: req.user._id,
      title,
      content: content || "",
      fileUrl: req.file ? req.file.path : null,
    });

    cls.materials.push(material._id);
    await cls.save();

    const frontendUrl = getFrontendUrl();
    const directLink = `${frontendUrl}/student/class/${cls._id}/materials`;

    // Send email notifications with direct link
    for (const student of cls.students) {
      await sendClassroomNotification(
        student.email,
        student.name,
        cls.name,
        `${content || "New study material available"}\n\n📄 ${title}\n\n<a href="${directLink}">Click here to view material</a>`,
        "material",
        cls._id,
        material._id
      );
    }

    res.status(201).json({ 
      success: true,
      message: "Material uploaded and email notifications sent!",
      material 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Student + Teacher view */
exports.getMaterialsForClass = async (req, res) => {
  try {
    const classId = req.params.classId || req.params.id;

    const materials = await Material.find({ class: classId })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");

    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, content } = req.body;

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (title !== undefined) material.title = title;
    if (content !== undefined) material.content = content;

    if (req.file) {
      material.fileUrl = req.file.path;
    }

    await material.save();
    res.json({ message: "Material updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update material" });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { classId, materialId } = req.params;

    await Material.findByIdAndDelete(materialId);

    await Class.findByIdAndUpdate(classId, {
      $pull: { materials: materialId },
    });

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete material" });
  }
};