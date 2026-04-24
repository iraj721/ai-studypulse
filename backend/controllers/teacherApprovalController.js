const ApprovedTeacher = require("../models/ApprovedTeacher");
const User = require("../models/User");

// Add approved teacher email (Admin only)
const addApprovedTeacher = async (req, res) => {
  try {
    const { email, name, department } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }
    
    // Check if already approved
    const existing = await ApprovedTeacher.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "This email is already approved" });
    }
    
    const approvedTeacher = await ApprovedTeacher.create({
      email: email.toLowerCase(),
      name,
      department: department || "",
      addedBy: req.user._id
    });
    
    res.status(201).json({ message: "Teacher approved successfully", data: approvedTeacher });
  } catch (err) {
    console.error("Add approved teacher error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all approved teachers
const getApprovedTeachers = async (req, res) => {
  try {
    const teachers = await ApprovedTeacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove approved teacher
const removeApprovedTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await ApprovedTeacher.findByIdAndDelete(id);
    res.json({ message: "Teacher removed from approved list" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if email is approved for teacher role
const isEmailApproved = async (email) => {
  const approved = await ApprovedTeacher.findOne({ email: email.toLowerCase(), isActive: true });
  return !!approved;
};

module.exports = { addApprovedTeacher, getApprovedTeachers, removeApprovedTeacher, isEmailApproved };