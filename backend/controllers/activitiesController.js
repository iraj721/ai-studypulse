const Activity = require('../models/Activity');
const Message = require('../models/Message');
const askHF = require('../services/aiService');
const AIInsight = require('../models/AIInsight'); 
const { getStats: getNotesStats } = require('./notesController');


/**
 * Get all activities of current user
 */
exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new activity with AI analysis
 */
exports.createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes } = req.body;

    // Combine activity data to send to AI for insights
    const prompt = `
      Subject: ${subject}
      Topic: ${topic}
      Notes: ${notes || "No notes provided."}
      Provide 3-5 actionable study insights and suggest difficulty level (easy, medium, hard).
    `;

    // Ask AI
    const aiResponse = await askHF(prompt);

    // Split AI response into insights
    const insightsArray = aiResponse.split(/\n|;/).filter(line => line.trim() !== '');
    let difficulty = 'medium';
    if (/easy/i.test(aiResponse)) difficulty = 'easy';
    else if (/hard|difficult|challenging/i.test(aiResponse)) difficulty = 'hard';

    // Combine all insights into a single string for AIInsight
    const combinedInsights = insightsArray.join('\n');

    // Store activity
    const activity = await Activity.create({
      user: req.user._id,
      subject,
      topic,
      durationMinutes: parseFloat(durationMinutes) || 0, // ensure number
      notes: notes || '',
      difficulty,
      insights: insightsArray // array for frontend display if needed
    });

    // Save AI insights as a single AIInsight document
    await AIInsight.create({
      user: req.user._id,
      title: `${subject} - ${topic}`,
      content: combinedInsights
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const result = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!result) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: 1 });
    const totalStudyHours = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
    const completedTasks = activities.filter(a => a.completed).length;
    const completionRate = activities.length ? Math.round((completedTasks / activities.length) * 100) : 0;

    // Weekly graph (last 7 days)
    const today = new Date();
    const weeklyGraph = Array(7).fill(0);
    activities.forEach(a => {
      const diff = Math.floor((today - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) weeklyGraph[6 - diff] += a.durationMinutes || 0;
    });

    // Difficulty Analysis
    const difficultyAnalysis = { easy: 0, medium: 0, hard: 0 };
    activities.forEach(a => {
      if (a.difficulty) difficultyAnalysis[a.difficulty] = (difficultyAnalysis[a.difficulty] || 0) + 1;
    });

    // Last note & class (safe)
    const notesStatsRes = await getNotesStats(req, res, true);
    const lastNote = notesStatsRes?.lastNote || null;
    const lastClass = activities[activities.length - 1]?.subject || null;

    res.json({
      totalStudyHours,
      completionRate,
      weeklyGraph,
      difficultyAnalysis,
      lastNote,
      lastClass,
      classesCount: activities.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
