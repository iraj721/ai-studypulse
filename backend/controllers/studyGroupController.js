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
      members: [req.user._id],
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
    group.updatedAt = new Date();
    await group.save();

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} has joined the group!`,
          "member_joined",
        );
      }
    }

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
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

// Get single group details
const getGroupDetails = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("members", "name email")
      .populate("messages.user", "name")
      .populate("sharedContent.sharedBy", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      !group.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not a member" });
    }

    res.json(group);
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

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name}: ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}`,
          "new_message",
        );
      }
    }

    const io = req.app.locals.io;
    io.to(`group_${req.params.id}`).emit("newGroupMessage", {
      _id: savedMessage._id,
      user: req.user._id,
      userName: req.user.name,
      message: message,
      type: type,
      sharedData: sharedData,
      deleted: false,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Message sent", data: savedMessage });
  } catch (err) {
    console.error(err);
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

    if (!group.members.includes(req.user._id)) {
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

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a note: "${note.subject} - ${note.topic}"`,
          "shared_note",
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

    if (!group.members.includes(req.user._id)) {
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

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a quiz: "${quiz.topic}"`,
          "shared_quiz",
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

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a video summary: "${video.title}"`,
          "shared_video",
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

    res.status(201).json({
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

    if (!group.members.includes(req.user._id)) {
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

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared a flashcard: "${flashcard.noteTopic || "Study Card"}"`,
          "shared_flashcard",
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
      const AIInsight = require("../models/AIInsight");
      const insight = await AIInsight.findOne({
        _id: insightId,
        user: req.user._id,
      });
      if (insight) {
        insightTitle = insight.title || insightTitle;
        insightContent = insight.content || insightContent;
      }
    } catch (err) {
      console.log("AIInsight model not found, using default insight");
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
        insightId: insightId,
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
      message: `💡 Shared an AI insight: ${insightTitle}`,
      type: "insight",
      sharedData: savedContent,
      deleted: false,
      createdAt: new Date(),
    };
    group.messages.push(newMessage);
    await group.save();

    const savedMessage = group.messages[group.messages.length - 1];

    const members = await User.find({ _id: { $in: group.members } });
    for (const member of members) {
      if (member._id.toString() !== req.user._id.toString()) {
        await sendGroupEmailNotification(
          member.email,
          member.name,
          group.name,
          `${req.user.name} shared an AI insight: "${insightTitle}"`,
          "shared_insight",
        );
      }
    }

    const io = req.app.locals.io;
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
// View shared note (accessible by all group members)
const viewSharedNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    console.log("View shared note called:", { groupId, noteId, userId: req.user._id });

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      console.log("Group not found:", groupId);
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      console.log("User not a member of group");
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const sharedContent = group.sharedContent.find(
      (content) => content.type === "note" && content.metadata?.noteId === noteId
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

// View shared quiz (accessible by all group members)
const viewSharedQuiz = async (req, res) => {
  try {
    const { groupId, quizId } = req.params;
    console.log("View shared quiz called:", { groupId, quizId, userId: req.user._id });

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const sharedContent = group.sharedContent.find(
      (content) => content.type === "quiz" && content.metadata?.quizId === quizId
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

// View shared flashcard (accessible by all group members)
const viewSharedFlashcard = async (req, res) => {
  try {
    const { groupId, flashcardId } = req.params;
    console.log("View shared flashcard called:", { groupId, flashcardId, userId: req.user._id });

    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const sharedContent = group.sharedContent.find(
      (content) => content.type === "flashcard" && content.metadata?.flashcardId === flashcardId
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
    
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
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
        fileIcon: fileIcon
      }
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
      createdAt: new Date()
    };
    group.messages.push(newMessage);
    await group.save();
    
    const savedMessage = group.messages[group.messages.length - 1];
    
    try {
      const members = await User.find({ _id: { $in: group.members } });
      for (const member of members) {
        if (member._id.toString() !== req.user._id.toString()) {
          await sendGroupEmailNotification(
            member.email,
            member.name,
            group.name,
            `${req.user.name} shared a file: "${fileName}"`,
            "shared_file"
          );
        }
      }
    } catch (emailErr) {
      console.error("Email notification error (non-critical):", emailErr.message);
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
        createdAt: new Date()
      });
    }
    
    res.status(201).json({ message: "File shared successfully", data: savedContent });
  } catch (err) {
    console.error("Share file error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
  shareFile,
  getSharedContent,
  viewSharedNote,
  viewSharedQuiz,
  viewSharedFlashcard,
};