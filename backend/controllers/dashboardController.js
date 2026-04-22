const AIInsight = require("../models/AIInsight");
const askHF = require("../services/aiService");

// Fetch all insights for the logged-in user
const getInsights = async (req, res) => {
  try {
    const insights = await AIInsight.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(insights);
  } catch (err) {
    console.error("Fetch Insights Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate a new AI insight
const createInsight = async (req, res) => {
  try {
    const { title, prompt } = req.body;
    if (!title || !prompt) {
      return res.status(400).json({ message: "Title and prompt are required" });
    }

    const content = await askHF(prompt);

    const newInsight = await AIInsight.create({
      user: req.user._id,
      title,
      content,
    });

    res.json(newInsight);
  } catch (err) {
    console.error("Create Insight Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getInsights, createInsight };
