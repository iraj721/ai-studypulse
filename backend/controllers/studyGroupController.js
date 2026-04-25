const StudyGroup = require("../models/StudyGroup");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const VideoSummary = require("../models/VideoSummary");
const User = require("../models/User");
const crypto = require("crypto");
const {
  sendGroupEmailNotification,
} = require("../services/notificationService");

// Generate unique group code
const generateCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
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
      members: [
        {
          user: req.user._id,
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Join group by code - WITH REAL-TIME MEMBER UPDATE
const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const group = await StudyGroup.findOne({ code: code.toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if already a member (check in members array)
    const alreadyMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    // Add member with joinedAt date
    group.members.push({
      user: req.user._id,
      joinedAt: new Date(),
    });

    group.updatedAt = new Date();
    await group.save();

    // Get updated members list with user details
    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } }).select(
      "name email _id",
    );

    // Map members to include user details
    const membersWithDetails = members.map((m) => ({
      _id: m._id,
      name: m.name,
      email: m.email,
    }));

    // Send email notifications
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} has joined the group!`,
          "member_joined",
          group._id,
        );
      }
    }

    // Emit socket event for real-time member update
    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${group._id}`).emit("memberJoined", {
        userId: req.user._id,
        userName: req.user.name,
        members: membersWithDetails,
      });
    }

    res.json({
      message: "Joined successfully",
      group,
      members: membersWithDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's groups
const getUserGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({
      "members.user": req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    // Transform to old format for frontend compatibility
    const transformedGroups = groups.map((group) => {
      const groupObj = group.toObject();
      groupObj.members = group.members.map((m) => m.user);
      return groupObj;
    });

    res.json(transformedGroups);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

// Get single group details
const getGroupDetails = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("members.user", "name email")
      .populate("messages.user", "name")
      .populate("sharedContent.sharedBy", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member and get their join date
    const memberInfo = group.members.find(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );

    if (!memberInfo) {
      return res.status(403).json({ message: "Not a member" });
    }

    const userJoinDate = memberInfo.joinedAt;

    // Filter messages - only show messages created after user joined
    const filteredMessages = group.messages.filter(
      (msg) => new Date(msg.createdAt) >= new Date(userJoinDate),
    );

    // Filter shared content - only show content shared after user joined
    const filteredSharedContent = group.sharedContent.filter(
      (content) => new Date(content.sharedAt) >= new Date(userJoinDate),
    );

    // Return group with filtered data
    const responseGroup = group.toObject();
    responseGroup.messages = filteredMessages;
    responseGroup.sharedContent = filteredSharedContent;
    responseGroup.members = group.members.map((m) => m.user); // Send user objects for frontend

    res.json(responseGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message in group (with WebSocket)
const sendMessage = async (req, res) => {
  try {
    const { message, type = "text", sharedData = null } = req.body;
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: message,
      type: type,
      sharedData: sharedData,
      deleted: false,
      createdAt: new Date(),
    };

    group.messages.push(newMessage);
    group.updatedAt = new Date();
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    // Prepare message for client
    const messageToSend = {
      _id: savedMessage._id,
      user: req.user._id,
      userName: req.user.name,
      message: message,
      type: type,
      sharedData: sharedData,
      deleted: false,
      createdAt: savedMessage.createdAt,
    };

    // Get members for email
    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });

    // Send email notifications (non-blocking)
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name}: ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}`,
          "new_message",
          group._id,
        ).catch((err) => console.error("Email error:", err));
      }
    }

    // Emit socket event for real-time
    const io = req.app.locals.io;
    if (io) {
      const roomName = `group_${req.params.id}`;
      io.to(roomName).emit("newGroupMessage", messageToSend);
      console.log(`📨 Emitted newGroupMessage to room: ${roomName}`);
    } else {
      console.error("❌ Socket.IO not available");
    }

    res.status(201).json({ message: "Message sent", data: messageToSend });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete message (for self or for everyone if admin/creator)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;

    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const messageIndex = group.messages.findIndex(
      (m) => m._id.toString() === messageId,
    );
    if (messageIndex === -1) {
      return res.status(404).json({ message: "Message not found" });
    }

    const message = group.messages[messageIndex];
    const isOwner = message.user.toString() === req.user._id.toString();
    const isGroupCreator =
      group.createdBy.toString() === req.user._id.toString();

    if (deleteForEveryone) {
      if (!isOwner && !isGroupCreator) {
        return res.status(403).json({
          message: "Not authorized to delete this message for everyone",
        });
      }
      group.messages.splice(messageIndex, 1);
      await group.save();

      const io = req.app.locals.io;
      io.to(`group_${req.params.id}`).emit("messageDeleted", {
        messageId,
        deleteForEveryone: true,
      });
    } else {
      if (!isOwner) {
        return res
          .status(403)
          .json({ message: "Can only delete your own messages" });
      }
      message.message = "[Message deleted]";
      message.deleted = true;
      await group.save();

      const io = req.app.locals.io;
      io.to(`group_${req.params.id}`).emit("messageDeleted", {
        messageId,
        deleteForEveryone: false,
      });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete shared content
const deleteSharedContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const contentIndex = group.sharedContent.findIndex(
      (c) => c._id.toString() === contentId,
    );
    if (contentIndex === -1) {
      return res.status(404).json({ message: "Content not found" });
    }

    const content = group.sharedContent[contentIndex];
    const isOwner = content.sharedBy.toString() === req.user._id.toString();
    const isGroupCreator =
      group.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isGroupCreator) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this content" });
    }

    group.sharedContent.splice(contentIndex, 1);
    await group.save();

    const messageIndex = group.messages.findIndex(
      (m) =>
        m.type !== "text" &&
        m.sharedData &&
        m.sharedData._id &&
        m.sharedData._id.toString() === contentId,
    );
    if (messageIndex !== -1) {
      group.messages.splice(messageIndex, 1);
      await group.save();
    }

    const io = req.app.locals.io;
    io.to(`group_${req.params.id}`).emit("contentDeleted", { contentId });

    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share a note in group
const shareNote = async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    console.log("Sharing note:", noteId, "User:", req.user._id);

    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check membership
    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const sharedContent = {
      type: "note",
      title: `${note.subject} - ${note.topic}`,
      content: note.content
        ? note.content.substring(0, 500)
        : "No content available",
      link: `/notes/view/${note._id}`,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        noteId: note._id,
        subject: note.subject,
        topic: note.topic,
        fullContent: note.content,
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `📓 Shared a note: ${note.subject} - ${note.topic}`,
      type: "note",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a note: "${note.subject} - ${note.topic}"`,
          "shared_note",
          group._id,
        );
      }
    }

    const io = req.app.locals.io;
    io.to(`group_${req.params.id}`).emit("newGroupMessage", {
      _id: savedMessage._id,
      user: req.user._id,
      userName: req.user.name,
      message: newMessage.message,
      type: "note",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({ message: "Note shared successfully", data: savedContent });
  } catch (err) {
    console.error("Share note error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share a quiz in group
const shareQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: "Quiz ID is required" });
    }

    console.log("Sharing quiz:", quizId, "User:", req.user._id);

    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const quiz = await Quiz.findOne({ _id: quizId, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const sharedContent = {
      type: "quiz",
      title: `Quiz: ${quiz.topic}`,
      content: `${quiz.questions?.length || 0} questions`,
      link: `/quizzes/view/${quiz._id}`,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        quizId: quiz._id,
        topic: quiz.topic,
        questionCount: quiz.questions?.length,
        questions: quiz.questions,
        description: quiz.description,
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `📝 Shared a quiz: ${quiz.topic}`,
      type: "quiz",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a quiz: "${quiz.topic}"`,
          "shared_quiz",
          group._id,
        );
      }
    }

    const io = req.app.locals.io;
    io.to(`group_${req.params.id}`).emit("newGroupMessage", {
      _id: savedMessage._id,
      user: req.user._id,
      userName: req.user.name,
      message: newMessage.message,
      type: "quiz",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({ message: "Quiz shared successfully", data: savedContent });
  } catch (err) {
    console.error("Share quiz error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share YouTube summary in group
const shareYouTubeSummary = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    console.log("Sharing video:", videoId, "User:", req.user._id);

    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const video = await VideoSummary.findOne({
      _id: videoId,
      user: req.user._id,
    });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const sharedContent = {
      type: "youtube",
      title: video.title,
      content: video.summary
        ? video.summary.substring(0, 300)
        : "No summary available",
      link: `/video-summarizer`,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        videoId: video._id,
        title: video.title,
        author: video.author,
        summary: video.summary,
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `🎥 Shared a video summary: ${video.title}`,
      type: "youtube",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a video summary: "${video.title}"`,
          "shared_video",
          group._id,
        );
      }
    }

    const io = req.app.locals.io;
    io.to(`group_${req.params.id}`).emit("newGroupMessage", {
      _id: savedMessage._id,
      user: req.user._id,
      userName: req.user.name,
      message: newMessage.message,
      type: "youtube",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    });

    res
      .status(201)
      .json({
        message: "Video summary shared successfully",
        data: savedContent,
      });
  } catch (err) {
    console.error("Share video error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share Flashcard in group
const shareFlashcard = async (req, res) => {
  try {
    const { flashcardId } = req.body;

    if (!flashcardId) {
      return res.status(400).json({ message: "Flashcard ID is required" });
    }

    console.log("Sharing flashcard:", flashcardId, "User:", req.user._id);

    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const Flashcard = require("../models/Flashcard");
    const flashcard = await Flashcard.findOne({
      _id: flashcardId,
      user: req.user._id,
    });
    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    const sharedContent = {
      type: "flashcard",
      title: `Flashcard: ${flashcard.noteTopic || "Study Card"}`,
      content: `${flashcard.front.substring(0, 200)}...`,
      link: `/flashcards`,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        flashcardId: flashcard._id,
        front: flashcard.front,
        back: flashcard.back,
        noteTopic: flashcard.noteTopic,
        noteSubject: flashcard.noteSubject,
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `🃏 Shared a flashcard: ${flashcard.noteTopic || "Study Card"}`,
      type: "flashcard",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a flashcard: "${flashcard.noteTopic || "Study Card"}"`,
          "shared_flashcard",
          group._id,
        );
      }
    }

    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${req.params.id}`).emit("newGroupMessage", {
        _id: savedMessage._id,
        user: req.user._id,
        userName: req.user.name,
        message: newMessage.message,
        type: "flashcard",
        sharedData: savedContent,
        deleted: false,
        createdAt: new Date(),
      });
    }

    res
      .status(201)
      .json({ message: "Flashcard shared successfully", data: savedContent });
  } catch (err) {
    console.error("Share flashcard error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share AI insight in group
const shareInsight = async (req, res) => {
  try {
    const { insightId } = req.body;
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    let insightTitle = "AI Learning Insight";
    let insightContent =
      "Based on your learning patterns, you're making great progress!";

    try {
      const AIInsights = require("../models/AIInsight");
      const insight = await AIInsights.findOne({
        _id: insightId,
        user: req.user._id,
      });
      if (insight) {
        insightTitle = insight.title || insightTitle;
        insightContent = insight.content || insightContent;
        console.log(
          "Found insight:",
          insightTitle,
          "Content length:",
          insightContent.length,
        );
      } else {
        console.log("Insight not found with ID:", insightId);
        const anyInsight = await AIInsights.findOne({ user: req.user._id });
        if (anyInsight) {
          insightTitle = anyInsight.title || insightTitle;
          insightContent = anyInsight.content || insightContent;
          console.log("Using alternative insight:", insightTitle);
        }
      }
    } catch (err) {
      console.log("AIInsights model error:", err.message);
    }

    const sharedContent = {
      type: "insight",
      title: insightTitle,
      content: insightContent.substring(0, 300),
      link: `/dashboard`,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        insightId: insightId || "default",
        title: insightTitle,
        fullContent: insightContent,
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `💡 Shared an AI insight: ${insightTitle.substring(0, 50)}...`,
      type: "insight",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared an AI insight: "${insightTitle.substring(0, 50)}..."`,
          "shared_insight",
          group._id,
        );
      }
    }

    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${req.params.id}`).emit("newGroupMessage", {
        _id: savedMessage._id,
        user: req.user._id,
        userName: req.user.name,
        message: newMessage.message,
        type: "insight",
        sharedData: savedContent,
        deleted: false,
        createdAt: new Date(),
      });
    }

    res
      .status(201)
      .json({ message: "Insight shared successfully", data: savedContent });
  } catch (err) {
    console.error("Share insight error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get shared content in group
const getSharedContent = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id).populate(
      "sharedContent.sharedBy",
      "name",
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group.sharedContent.sort((a, b) => b.sharedAt - a.sharedAt));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============ VIEW SHARED CONTENT FUNCTIONS ============
const viewSharedNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    console.log("View shared note called:", {
      groupId,
      noteId,
      userId: req.user._id,
    });

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      console.log("Group not found:", groupId);
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      console.log("User not a member of group");
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const sharedContent = group.sharedContent.find(
      (content) =>
        content.type === "note" && content.metadata?.noteId === noteId,
    );

    if (!sharedContent) {
      console.log("Shared note not found in group");
      return res.status(404).json({ message: "Shared note not found" });
    }

    res.json({
      _id: noteId,
      title: sharedContent.title,
      content: sharedContent.metadata?.fullContent || sharedContent.content,
      subject: sharedContent.metadata?.subject,
      topic: sharedContent.metadata?.topic,
      sharedBy: sharedContent.sharedByName,
      sharedAt: sharedContent.sharedAt,
    });
  } catch (err) {
    console.error("View shared note error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share entire flashcard group (all flashcards of a note)
const shareFlashcardGroup = async (req, res) => {
  try {
    const { noteId } = req.body;
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const Flashcard = require("../models/Flashcard");
    const flashcards = await Flashcard.find({
      user: req.user._id,
      noteId: noteId,
    });

    if (!flashcards || flashcards.length === 0) {
      return res
        .status(404)
        .json({ message: "No flashcards found for this note" });
    }

    const firstCard = flashcards[0];
    const flashcardCount = flashcards.length;

    let flashcardContent = `**${flashcardCount} Flashcards**\n\n`;
    flashcards.forEach((card, index) => {
      flashcardContent += `**${index + 1}. Q:** ${card.front}\n`;
      flashcardContent += `**A:** ${card.back}\n\n`;
    });

    const sharedContent = {
      type: "flashcard",
      title: `📚 Flashcard Set: ${firstCard.noteTopic || "Study Cards"} (${flashcardCount} cards)`,
      content: flashcardContent.substring(0, 500),
      link: `/flashcards`,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        noteId: noteId,
        noteTopic: firstCard.noteTopic,
        noteSubject: firstCard.noteSubject,
        flashcardCount: flashcardCount,
        flashcards: flashcards.map((card) => ({
          front: card.front,
          back: card.back,
        })),
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `🃏 Shared a flashcard set: "${firstCard.noteTopic || "Study Cards"}" (${flashcardCount} cards)`,
      type: "flashcard",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a flashcard set: "${firstCard.noteTopic || "Study Cards"}" (${flashcardCount} cards)`,
          "shared_flashcard",
          group._id,
        );
      }
    }

    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${req.params.id}`).emit("newGroupMessage", {
        _id: savedMessage._id,
        user: req.user._id,
        userName: req.user.name,
        message: newMessage.message,
        type: "flashcard",
        sharedData: savedContent,
        deleted: false,
        createdAt: new Date(),
      });
    }

    res
      .status(201)
      .json({
        message: "Flashcard set shared successfully",
        data: savedContent,
      });
  } catch (err) {
    console.error("Share flashcard group error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const viewSharedQuiz = async (req, res) => {
  try {
    const { groupId, quizId } = req.params;
    console.log("View shared quiz called:", {
      groupId,
      quizId,
      userId: req.user._id,
    });

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const sharedContent = group.sharedContent.find(
      (content) =>
        content.type === "quiz" && content.metadata?.quizId === quizId,
    );

    if (!sharedContent) {
      return res.status(404).json({ message: "Shared quiz not found" });
    }

    res.json({
      _id: quizId,
      topic: sharedContent.metadata?.topic,
      questions: sharedContent.metadata?.questions || [],
      description: sharedContent.metadata?.description,
      sharedBy: sharedContent.sharedByName,
      sharedAt: sharedContent.sharedAt,
    });
  } catch (err) {
    console.error("View shared quiz error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const viewSharedFlashcard = async (req, res) => {
  try {
    const { groupId, flashcardId } = req.params;
    console.log("View shared flashcard called:", {
      groupId,
      flashcardId,
      userId: req.user._id,
    });

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const sharedContent = group.sharedContent.find(
      (content) =>
        content.type === "flashcard" &&
        content.metadata?.flashcardId === flashcardId,
    );

    if (!sharedContent) {
      return res.status(404).json({ message: "Shared flashcard not found" });
    }

    res.json({
      _id: flashcardId,
      front: sharedContent.metadata?.front,
      back: sharedContent.metadata?.back,
      noteTopic: sharedContent.metadata?.noteTopic,
      noteSubject: sharedContent.metadata?.noteSubject,
      sharedBy: sharedContent.sharedByName,
      sharedAt: sharedContent.sharedAt,
    });
  } catch (err) {
    console.error("View shared flashcard error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Share file in group
const shareFile = async (req, res) => {
  try {
    const file = req.file;
    const groupId = req.params.id;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const fileUrl = `/uploads/shared/${file.filename}`;
    const fileType = file.mimetype;
    const fileName = file.originalname;
    const fileSize = file.size;

    let fileIcon = "📄";
    if (fileType === "application/pdf") fileIcon = "📕";
    else if (fileType.includes("word")) fileIcon = "📘";
    else if (fileType.includes("image")) fileIcon = "🖼️";
    else if (fileType === "text/plain") fileIcon = "📃";

    const sharedContent = {
      type: "file",
      title: `${fileIcon} ${fileName}`,
      content: `File size: ${(fileSize / 1024).toFixed(2)} KB. Click View to download or preview.`,
      link: fileUrl,
      sharedBy: req.user._id,
      sharedByName: req.user.name,
      sharedAt: new Date(),
      metadata: {
        fileUrl: fileUrl,
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        fileIcon: fileIcon,
      },
    };

    group.sharedContent.push(sharedContent);
    group.updatedAt = new Date();
    await group.save();

    const savedContent = group.sharedContent[group.sharedContent.length - 1];

    const newMessage = {
      user: req.user._id,
      userName: req.user.name,
      message: `${fileIcon} Shared a file: ${fileName}`,
      type: "file",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    try {
      const memberIds = group.members.map((m) => m.user);
      const members = await User.find({ _id: { $in: memberIds } });
      for (const member of members) {
        if (member._id.toString() !== req.user._id.toString()) {
          await sendGroupEmailNotification(
            member.email,
            member.name,
            group.name,
            `${req.user.name} shared a file: "${fileName}"`,
            "shared_file",
            group._id,
          );
        }
      }
    } catch (emailErr) {
      console.error(
        "Email notification error (non-critical):",
        emailErr.message,
      );
    }

    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${groupId}`).emit("newGroupMessage", {
        _id: savedMessage._id,
        user: req.user._id,
        userName: req.user.name,
        message: newMessage.message,
        type: "file",
        sharedData: savedContent,
        deleted: false,
        createdAt: new Date(),
      });
    }

    res
      .status(201)
      .json({ message: "File shared successfully", data: savedContent });
  } catch (err) {
    console.error("Share file error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    // Remove user from members
    group.members = group.members.filter(
      (m) => m.user.toString() !== req.user._id.toString(),
    );

    // If creator leaves, assign new creator or delete group
    if (group.createdBy.toString() === req.user._id.toString()) {
      if (group.members.length > 0) {
        // Assign new creator (first member)
        group.createdBy = group.members[0].user;
        await group.save();

        // Notify new creator
        const newCreator = await User.findById(group.createdBy);
        if (newCreator) {
          await sendGroupEmailNotification(
            newCreator.email,
            newCreator.name,
            group.name,
            `${req.user.name} left the group. You are now the group creator.`,
            "member_left",
            group._id,
          );
        }
      } else {
        // Delete group if no members left
        await StudyGroup.findByIdAndDelete(id);

        // Emit socket event for group deletion
        const io = req.app.locals.io;
        if (io) {
          io.to(`group_${id}`).emit("groupDeleted", { groupId: id });
        }
        return res.json({
          message: "Group deleted as you were the last member",
        });
      }
    }

    await group.save();

    // Get updated members list
    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } }).select(
      "name email _id",
    );
    const membersWithDetails = members.map((m) => ({
      _id: m._id,
      name: m.name,
      email: m.email,
    }));

    // Notify other members
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} has left the group.`,
          "member_left",
          group._id,
        );
      }
    }

    // Emit socket event for real-time member update
    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${id}`).emit("memberLeft", {
        userId: req.user._id,
        userName: req.user.name,
        members: membersWithDetails,
      });
    }

    res.json({
      message: "Left group successfully",
      members: membersWithDetails,
    });
  } catch (err) {
    console.error("Leave group error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove member from group (only creator can do this)
const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if current user is creator
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only group creator can remove members" });
    }

    // Check if member exists
    const memberExists = group.members.some(
      (m) => m.user.toString() === memberId,
    );
    if (!memberExists) {
      return res.status(404).json({ message: "Member not found in group" });
    }

    // Cannot remove yourself
    if (memberId.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Use leave group to remove yourself" });
    }

    // Remove member
    group.members = group.members.filter((m) => m.user.toString() !== memberId);
    await group.save();

    // Notify removed member
    const removedUser = await User.findById(memberId);
    if (removedUser) {
      await sendGroupEmailNotification(
        removedUser.email,
        removedUser.name,
        group.name,
        `You have been removed from the group by ${req.user.name}.`,
        "member_removed",
        group._id,
      );
    }

    // Get updated members list
    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } }).select(
      "name email _id",
    );
    const membersWithDetails = members.map((m) => ({
      _id: m._id,
      name: m.name,
      email: m.email,
    }));

    // Notify other members
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${removedUser?.name || "A member"} has been removed from the group.`,
          "member_removed",
          group._id,
        );
      }
    }

    // Emit socket event for real-time member update
    const io = req.app.locals.io;
    if (io) {
      io.to(`group_${id}`).emit("memberRemoved", {
        userId: memberId,
        userName: removedUser?.name,
        members: membersWithDetails,
      });
    }

    res.json({
      message: "Member removed successfully",
      members: membersWithDetails,
    });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get group members (for modal)
const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await StudyGroup.findById(id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const memberIds = group.members.map((m) => m.user);
    const members = await User.find({ _id: { $in: memberIds } }).select(
      "name email _id",
    );
    const creator = await User.findById(group.createdBy).select(
      "name email _id",
    );

    res.json({
      members: members,
      createdBy: creator,
      isCreator: group.createdBy.toString() === req.user._id.toString(),
      memberCount: members.length,
    });
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupDetails,
  sendMessage,
  deleteMessage,
  deleteSharedContent,
  shareNote,
  shareQuiz,
  shareYouTubeSummary,
  shareInsight,
  shareFlashcard,
  shareFlashcardGroup,
  shareFile,
  getSharedContent,
  viewSharedNote,
  viewSharedQuiz,
  viewSharedFlashcard,
  leaveGroup,
  removeMember,
  getGroupMembers,
};
