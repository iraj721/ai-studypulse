const Bookmark = require("../models/Bookmark");
const Note = require("../models/Note");
const Quiz = require("../models/Quiz");
const Activity = require("../models/Activity");
const VideoSummary = require("../models/VideoSummary");

// Create bookmark
const createBookmark = async (req, res) => {
  try {
    const { type, itemId, collectionName, tags } = req.body;
    
    // Check if already bookmarked
    const existing = await Bookmark.findOne({ user: req.user._id, type, itemId });
    if (existing) {
      return res.status(400).json({ message: "Already bookmarked" });
    }
    
    let title = "";
    let subtitle = "";
    
    // Fetch item details
    if (type === 'note') {
      const note = await Note.findOne({ _id: itemId, user: req.user._id });
      if (note) {
        title = `${note.subject} - ${note.topic}`;
        subtitle = note.content.substring(0, 100);
      }
    } else if (type === 'quiz') {
      const quiz = await Quiz.findOne({ _id: itemId, user: req.user._id });
      if (quiz) {
        title = `Quiz: ${quiz.topic}`;
        subtitle = `${quiz.questions?.length || 0} questions`;
      }
    } else if (type === 'activity') {
      const activity = await Activity.findOne({ _id: itemId, user: req.user._id });
      if (activity) {
        title = `${activity.subject} - ${activity.topic}`;
        subtitle = `${activity.durationMinutes} minutes`;
      }
    } else if (type === 'video') {
      const video = await VideoSummary.findOne({ _id: itemId, user: req.user._id });
      if (video) {
        title = video.title;
        subtitle = video.author;
      }
    }
    
    const bookmark = await Bookmark.create({
      user: req.user._id,
      type,
      itemId,
      title,
      subtitle,
      collectionName: collectionName || 'Default',
      tags: tags || []
    });
    
    res.status(201).json(bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's bookmarks
const getUserBookmarks = async (req, res) => {
  try {
    const { collection, starred } = req.query;
    let query = { user: req.user._id };
    
    if (collection && collection !== 'all') {
      query.collectionName = collection;
    }
    if (starred === 'true') {
      query.starred = true;
    }
    
    const bookmarks = await Bookmark.find(query).sort({ starred: -1, createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get collections
const getCollections = async (req, res) => {
  try {
    const collections = await Bookmark.distinct('collectionName', { user: req.user._id });
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update bookmark (star, collection, tags)
const updateBookmark = async (req, res) => {
  try {
    const { starred, collectionName, tags } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { starred, collectionName, tags },
      { new: true }
    );
    res.json(bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete bookmark
const deleteBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBookmark,
  getUserBookmarks,
  getCollections,
  updateBookmark,
  deleteBookmark
};