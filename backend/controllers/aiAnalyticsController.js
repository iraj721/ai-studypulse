const AIUsage = require("../models/AIUsage");
const User = require("../models/User");

// AI Limits Configuration - CORRECTED
const AI_LIMITS = {
  groq: {
    dailyTokens: 14400,        // 14,400 tokens per day
    monthlyTokens: 432000,     // 30 days × 14400 = 432,000 tokens per month
    perMinuteRequests: 30,
    tokensPerRequest: 500
  },
  huggingFace: {
    dailyTokens: 30000,        // 30,000 tokens per day
    monthlyTokens: 900000,     // 30 days × 30000 = 900,000 tokens per month
    perMinuteRequests: 30
  }
};

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
    
    // Also update user's total tokens
    await User.findByIdAndUpdate(userId, {
      $inc: { totalTokensUsed: tokensUsed }
    });
  } catch (err) {
    console.error("Error recording AI usage:", err);
  }
};

// Get overall analytics for admin
const getOverallAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const monthStart = firstDayOfMonth.toISOString().split('T')[0];
    
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
      { $sort: { totalTokens: -1 } }
    ]);
    
    // Populate user names
    const userIds = userWiseUsage.map(u => u._id);
    const users = await User.find({ _id: { $in: userIds } }).select("name email totalTokensUsed");
    const userMap = {};
    users.forEach(u => userMap[u._id] = u);
    
    const enrichedUserWise = userWiseUsage.map(u => ({
      ...u,
      user: userMap[u._id] || { name: "Unknown", email: "unknown", totalTokensUsed: 0 }
    }));
    
    // Get today's usage
    const todayUsage = await AIUsage.aggregate([
      { $match: { date: today } },
      { $group: { _id: null, totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Get this month's usage
    const monthlyUsage = await AIUsage.aggregate([
      { $match: { date: { $gte: monthStart } } },
      { $group: { _id: null, totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Get overall total tokens
    const overallTotal = await AIUsage.aggregate([
      { $group: { _id: null, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Calculate remaining tokens - USING CORRECT LIMITS
    const dailyUsedTokens = todayUsage[0]?.totalTokens || 0;
    const monthlyUsedTokens = monthlyUsage[0]?.totalTokens || 0;
    
    // Daily limits - using Groq daily limit
    const dailyRemainingTokens = Math.max(0, AI_LIMITS.groq.dailyTokens - dailyUsedTokens);
    const dailyPercentUsed = Math.min(100, Math.round((dailyUsedTokens / AI_LIMITS.groq.dailyTokens) * 100));
    
    // Monthly limits - using Groq monthly limit (432,000)
    const monthlyRemainingTokens = Math.max(0, AI_LIMITS.groq.monthlyTokens - monthlyUsedTokens);
    const monthlyPercentUsed = Math.min(100, Math.round((monthlyUsedTokens / AI_LIMITS.groq.monthlyTokens) * 100));
    
    res.json({
      usageByFeature: usageByFeature.map(f => ({ feature: f._id, requests: f.totalRequests, tokens: f.totalTokens })),
      dailyUsage: dailyUsage.map(d => ({ date: d._id, requests: d.totalRequests, tokens: d.totalTokens })),
      userWiseUsage: enrichedUserWise,
      todayUsage: todayUsage[0] || { totalRequests: 0, totalTokens: 0 },
      monthlyUsage: monthlyUsage[0] || { totalRequests: 0, totalTokens: 0 },
      overallTotal: overallTotal[0]?.totalTokens || 0,
      remaining: {
        daily: {
          used: dailyUsedTokens,
          remaining: dailyRemainingTokens,
          limit: AI_LIMITS.groq.dailyTokens,
          percentUsed: dailyPercentUsed
        },
        monthly: {
          used: monthlyUsedTokens,
          remaining: monthlyRemainingTokens,
          limit: AI_LIMITS.groq.monthlyTokens,
          percentUsed: monthlyPercentUsed
        }
      },
      limits: {
        groq: AI_LIMITS.groq,
        huggingFace: AI_LIMITS.huggingFace
      }
    });
  } catch (err) {
    console.error("Get overall analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user-specific analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user exists
    const user = await User.findById(userId).select("name email totalTokensUsed");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's usage by feature
    const usageByFeature = await AIUsage.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$feature", totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Get user's daily usage for last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dailyUsage = await AIUsage.aggregate([
      { $match: { user: user._id, date: { $gte: last7Days.toISOString().split('T')[0] } } },
      { $group: { _id: "$date", totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get today's usage
    const todayUsage = await AIUsage.aggregate([
      { $match: { user: user._id, date: today } },
      { $group: { _id: null, totalRequests: { $sum: "$requestsCount" }, totalTokens: { $sum: "$tokensUsed" } } }
    ]);
    
    // Get user's total from User model
    const userTotalTokens = user.totalTokensUsed || 0;
    
    res.json({
      user: { name: user.name, email: user.email },
      usageByFeature: usageByFeature.map(f => ({ feature: f._id, requests: f.totalRequests, tokens: f.totalTokens })),
      dailyUsage: dailyUsage.map(d => ({ date: d._id, requests: d.totalRequests, tokens: d.totalTokens })),
      todayUsage: todayUsage[0] || { totalRequests: 0, totalTokens: 0 },
      totalTokensUsed: userTotalTokens
    });
  } catch (err) {
    console.error("Get user analytics error:", err);
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
    
    // Fill missing hours (0-23)
    const filledData = [];
    for (let i = 0; i < 24; i++) {
      const existing = hourlyData.find(h => h._id === i);
      filledData.push({ _id: i, totalRequests: existing?.totalRequests || 0, totalTokens: existing?.totalTokens || 0 });
    }
    
    res.json(filledData);
  } catch (err) {
    console.error("Get hourly usage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { recordAIUsage, getOverallAnalytics, getUserAnalytics, getHourlyUsage };