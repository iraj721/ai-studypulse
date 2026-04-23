const StudyGroup = require("../models/StudyGroup");
const crypto = require("crypto");

// Generate unique group code
const generateCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create study group
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const code = generateCode();
    
    const group = await StudyGroup.create({
      name,
      description,
      code,
      createdBy: req.user._id,
      members: [req.user._id]
    });
    
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Join group by code
const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const group = await StudyGroup.findOne({ code: code.toUpperCase() });
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }
    
    group.members.push(req.user._id);
    await group.save();
    
    res.json({ message: "Joined successfully", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's groups
const getUserGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({ members: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single group details
const getGroupDetails = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('members', 'name email')
      .populate('notes.createdBy', 'name')
      .populate('messages.user', 'name');
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    if (!group.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a member" });
    }
    
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Share note in group
const shareNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    group.notes.push({
      title,
      content,
      createdBy: req.user._id
    });
    
    await group.save();
    res.status(201).json({ message: "Note shared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message in group
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    group.messages.push({
      user: req.user._id,
      userName: req.user.name,
      message
    });
    
    await group.save();
    
    // Emit socket event for real-time
    const io = req.app.locals.io;
    io.to(`group_${req.params.id}`).emit('newMessage', {
      userName: req.user.name,
      message,
      createdAt: new Date()
    });
    
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupDetails,
  shareNote,
  sendMessage
};