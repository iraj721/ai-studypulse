const StudyGroup = require("../models/StudyGroup");

// Get single group details with messages and shared content (for admin)
exports.getGroupDetailsAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await StudyGroup.findById(groupId)
      .populate("members.user", "name email")
      .populate("messages.user", "name")
      .populate("sharedContent.sharedBy", "name");
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Handle both member structures
    let members = group.members;
    if (members && members.length > 0 && members[0] && members[0].user) {
      // New structure: extract user objects
      members = members.map(m => m.user);
    }
    
    res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      code: group.code,
      createdBy: group.createdBy,
      members: members,
      messages: group.messages,
      sharedContent: group.sharedContent,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    });
  } catch (err) {
    console.error("Get group details admin error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};