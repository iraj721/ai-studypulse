const ChatSession = require("../models/ChatSession");
const Message = require("../models/Message");
const Groq = require("groq-sdk");
const askHF = require("../services/aiService");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const STRONG_SYSTEM_PROMPT = `You are StudyPulse AI, a world-class study assistant. Follow these rules STRICTLY:
1. Give ACCURATE, FACTUAL information only. If unsure, say "I'm not sure"
2. Keep responses CLEAR and STRUCTURED with bullet points when helpful
3. Be CONCISE but COMPLETE - no fluff or repetition
4. Always be helpful and encouraging to students
5. Use emojis occasionally to make learning engaging 📚✨
6. NEVER say "as an AI" or "I don't have personal opinions"
7. Give EXAMPLES when explaining concepts`;

// Get all chat sessions for user
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt');
    res.json(sessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single chat session with messages
const getChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    
    res.json(session);
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new chat session
const createChatSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.create({
      user: req.user._id,
      title: title || "New Chat",
      messages: []
    });
    res.status(201).json(session);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete chat session
const deleteChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    
    res.json({ message: "Chat session deleted successfully" });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update chat session title
const updateChatTitle = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    
    res.json(session);
  } catch (err) {
    console.error("Update title error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message in a session (with streaming)
const sendMessageInSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    // Find or create session
    let session = await ChatSession.findOne({ _id: id, user: req.user._id });
    if (!session) {
      session = await ChatSession.create({
        user: req.user._id,
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        messages: []
      });
    }
    
    // Add user message
    const userMessage = {
      role: "user",
      text: text.trim(),
      createdAt: new Date()
    };
    session.messages.push(userMessage);
    
    // Update title if it's the first message
    if (session.messages.length === 1 && session.title === "New Chat") {
      session.title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
    }
    
    await session.save();
    
    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    // Send user message confirmation
    res.write(`data: ${JSON.stringify({ type: 'user', message: userMessage, sessionId: session._id })}\n\n`);
    
    // Prepare conversation history for context
    const conversationHistory = session.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // Stream AI response
    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: STRONG_SYSTEM_PROMPT },
        ...conversationHistory,
        { role: "user", content: text.trim() }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1000,
      stream: true,
    });
    
    let fullResponse = "";
    const aiMessageId = Date.now();
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content, messageId: aiMessageId })}\n\n`);
      }
    }
    
    // Add AI message to session
    const aiMessage = {
      role: "ai",
      text: fullResponse,
      createdAt: new Date()
    };
    session.messages.push(aiMessage);
    session.updatedAt = new Date();
    await session.save();
    
    res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage, sessionId: session._id })}\n\n`);
    res.end();
    
  } catch (err) {
    console.error("Send message error:", err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
};

module.exports = {
  getChatSessions,
  getChatSession,
  createChatSession,
  deleteChatSession,
  updateChatTitle,
  sendMessageInSession
};