const VideoSummary = require("../models/VideoSummary");
const { extractVideoId, getVideoInfo, getTranscript, generateSummary } = require("../services/youtubeService");
const askHF = require("../services/aiService");

// Summarize YouTube video
const summarizeVideo = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ message: "Video URL is required" });
    }
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }
    
    // Check if already summarized by user
    const existing = await VideoSummary.findOne({ user: req.user._id, videoId });
    if (existing) {
      return res.json({ summary: existing, isCached: true });
    }
    
    // Get video info and transcript
    const videoInfo = await getVideoInfo(videoId);
    const transcript = await getTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return res.status(400).json({ message: "No transcript available for this video" });
    }
    
    // ✅ Generate summary using generateSummary function
    const summary = await generateSummary(transcript, askHF, req.user?._id);
    
    // Save to database
    const videoSummary = await VideoSummary.create({
      user: req.user._id,
      videoUrl,
      videoId,
      title: videoInfo.title,
      author: videoInfo.author,
      thumbnail: videoInfo.thumbnail,
      summary: summary
    });
    
    res.status(201).json({ summary: videoSummary, isCached: false });
  } catch (err) {
    console.error("Video summary error:", err);
    res.status(500).json({ message: "Failed to summarize video: " + err.message });
  }
};

// Get user's saved video summaries
const getUserSummaries = async (req, res) => {
  try {
    const summaries = await VideoSummary.find({ user: req.user._id })
      .sort({ savedAt: -1 });
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete video summary
const deleteSummary = async (req, res) => {
  try {
    await VideoSummary.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { summarizeVideo, getUserSummaries, deleteSummary };