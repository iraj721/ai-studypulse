const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Class = require("../models/Class");
const User = require("../models/User");
const { sendEmailToClass, sendEmailNotification } = require("../services/notificationService");

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

/* Teacher: Get submissions for an assignment */
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submissions = await Submission.find({
      assignment: req.params.assignmentId,
    }).populate("student", "name email");

    res.json({
      assignment,
      submissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Create assignment with email */
const createAssignment = async (req, res) => {
  try {
    const { title, instructions, dueDate, marks } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    const cls = await Class.findById(req.params.classId).populate("students", "email name");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const assignment = await Assignment.create({
      class: cls._id,
      teacher: req.user._id,
      title: title,
      instructions: instructions,
      dueDate: dueDate || null,
      marks: marks ?? 0,
      attachment: fileUrl,
    });

    cls.assignments.push(assignment._id);
    await cls.save();

    // Send email notifications
    const dueDateText = dueDate ? `\n\n📅 Due Date: ${new Date(dueDate).toLocaleString()}` : "";
    const marksText = marks ? `\n\n🏆 Total Marks: ${marks}` : "";
    await sendEmailToClass(cls.students, cls.name, title, instructions + dueDateText + marksText, "assignment");

    res.status(201).json({ 
      success: true,
      message: "Assignment created successfully!",
      assignment 
    });
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

    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

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

    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Assign marks to submission */
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
    }).populate("student", "name email");

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.marks = marks;
    await submission.save();

    // Send email to student about marks
    if (submission.student?.email) {
      const assignment = await Assignment.findById(assignmentId);
      await sendEmailNotification(
        submission.student.email,
        submission.student.name,
        `📝 Marks Released: ${assignment?.title}`,
        `You have received ${marks} marks for your submission in "${assignment?.title}".\n\nKeep up the good work!`
      );
    }

    res.json({ message: "Marks assigned successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Student: Submit assignment */
const submitAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    const { answerText } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    const cls = await Class.findById(classId).populate("teacher", "name email");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const now = new Date();
    if (assignment.dueDate && now > assignment.dueDate) {
      return res.status(400).json({ message: "Cannot submit after due date" });
    }

    // Remove existing submission
    await Submission.findOneAndDelete({ assignment: assignmentId, student: req.user._id });

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      file: fileUrl,
      answerText: answerText || "",
    });

    // Send email notification to teacher
    if (cls.teacher?.email) {
      await sendEmailNotification(
        cls.teacher.email,
        cls.teacher.name,
        `📝 New Assignment Submission: ${assignment.title}`,
        `Student ${req.user.name} has submitted "${assignment.title}".\n\n${answerText ? `Answer: ${answerText.substring(0, 200)}...` : ""}\n\nPlease review and grade.`
      );
    }

    res.status(201).json({ message: "Assignment submitted successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Student: Unsend submission */
const unsendSubmission = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    const submission = await Submission.findOneAndDelete({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    res.json({ message: "Submission removed successfully" });
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
  submitAssignment,
  unsendSubmission,
};