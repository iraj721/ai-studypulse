const AIUsage = require("../models/AIUsage");
const User = require("../models/User");

// Record AI usage (called from AI services)
const recordAIUsage = async (userId, feature, tokensUsed = 0) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await AIUsage.findOneAndUpdate(
      { user: userId, feature, date: today },
      { 
        $inc: { requestsCount: 1, tokensUsed: tokensUsed },
        $setOnInsert: { user: userId, feature, date: today }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Error recording AI usage:", err);
  }
};

// Get overall analytics for admin
const getOverallAnalytics = async (req, res) => {
  try {
    // Get total usage by feature
    const usageByFeature = await AIUsage.aggregate([
      { $group: { _id: "$feature", totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Get daily usage for last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const dailyUsage = await AIUsage.aggregate([
      { $match: { date: { $gte: last30Days.toISOString().split('T')[0] } } },
      { $group: { _id: "$date", totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get user-wise usage
    const userWiseUsage = await AIUsage.aggregate([
      { $group: { _id: "$user", totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } },
      { $sort: { totalRequests: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate user names
    const userIds = userWiseUsage.map(u => u._id);
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const userMap = {};
    users.forEach(u => userMap[u._id] = u);
    
    const enrichedUserWise = userWiseUsage.map(u => ({
      ...u,
      user: userMap[u._id] || { name: "Unknown", email: "unknown" }
    }));
    
    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = await AIUsage.aggregate([
      { $match: { date: today } },
      { $group: { _id: null, totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Get this month's usage
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const monthlyUsage = await AIUsage.aggregate([
      { $match: { date: { $gte: firstDayOfMonth.toISOString().split('T')[0] } } },
      { $group: { _id: null, totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    res.json({
      usageByFeature: usageByFeature.map(f => ({ feature: f._id, requests: f.totalRequests, tokens: f.totalTokens })),
      dailyUsage: dailyUsage.map(d => ({ date: d._id, requests: d.totalRequests, tokens: d.totalTokens })),
      userWiseUsage: enrichedUserWise,
      todayUsage: todayUsage[0] || { totalRequests: 0, totalTokens: 0 },
      monthlyUsage: monthlyUsage[0] || { totalRequests: 0, totalTokens: 0 },
      limits: {
        groq: { daily: 14400, perMinute: 30, tokensPerRequest: 500 },
        huggingFace: { daily: 30000, perMinute: 30 }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get hourly usage for today
const getHourlyUsage = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const hourlyData = await AIUsage.aggregate([
      { $match: { date: today } },
      { $project: { hour: { $hour: "$createdAt" }, requestsCount: 1, tokensUsed: 1 } },
      { $group: { _id: "$hour", totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(hourlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { recordAIUsage, getOverallAnalytics, getHourlyUsage };