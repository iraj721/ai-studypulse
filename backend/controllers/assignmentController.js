const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Class = require("../models/Class");

/* Teacher: Get assignments for a class */
const getAssignmentsByClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    const assignments = await Assignment.find({ class: cls._id });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ✅ FIXED: Teacher: Get submissions for an assignment */
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submissions = await Submission.find({
      assignment: req.params.assignmentId,
    }).populate("student", "name email");

    // ✅ VERY IMPORTANT RESPONSE STRUCTURE
    res.json({
      assignment,
      submissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Create assignment */
const createAssignment = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const assignment = await Assignment.create({
      class: cls._id,
      teacher: req.user._id,
      title: req.body.title,
      instructions: req.body.instructions,
      dueDate: req.body.dueDate || null,
      marks: req.body.marks ?? 0,
      attachment: req.file ? req.file.path : null,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Update assignment */
const updateAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    const { title, instructions, dueDate, marks } = req.body;

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });
    if (classObj.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      class: classId,
    });

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    assignment.title = title ?? assignment.title;
    assignment.instructions = instructions ?? assignment.instructions;
    assignment.dueDate = dueDate ?? assignment.dueDate;
    assignment.marks = marks ?? assignment.marks;

    if (req.file) {
      assignment.attachment = req.file.path;
    }

    await assignment.save();

    res.json({ message: "Assignment updated successfully", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Delete assignment */
const deleteAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });
    if (classObj.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      class: classId,
    });

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    await assignment.deleteOne();

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Assign marks to a submission */
const assignMarksToSubmission = async (req, res) => {
  try {
    const { classId, assignmentId, submissionId } = req.params;
    const { marks } = req.body;

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: "Class not found" });
    if (classObj.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const submission = await Submission.findOne({
      _id: submissionId,
      assignment: assignmentId,
    });

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    submission.marks = marks;
    await submission.save();

    res.json({ message: "Marks assigned successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment,
  updateAssignment,
  deleteAssignment,
  assignMarksToSubmission,
};
