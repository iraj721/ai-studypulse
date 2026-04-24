const Message = require("../models/Message");
const ChatSession = require("../models/ChatSession");  // ✅ ADD THIS
const askHF = require("../services/aiService");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Get messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      user: req.user._id,
      $or: [
        { type: "chat" },
        { type: { $exists: false } }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ STRONG SYSTEM PROMPT FOR STREAMING
const STRONG_SYSTEM_PROMPT = `You are StudyPulse AI, a world-class study assistant. Follow these rules STRICTLY:
1. Give ACCURATE, FACTUAL information only. If unsure, say "I'm not sure"
2. Keep responses CLEAR and STRUCTURED with bullet points when helpful
3. For math/equations, use clear notation (like x² = y)
4. For code, use proper formatting
5. Be CONCISE but COMPLETE - no fluff or repetition
6. Always be helpful and encouraging to students
7. Break complex topics into simple, easy-to-understand parts
8. Use emojis occasionally to make learning engaging 📚✨
9. NEVER say "as an AI" or "I don't have personal opinions"
10. Give EXAMPLES when explaining concepts
11. Always stay RELEVANT to the user's question
12. If question is unclear, ask for clarification`;

// ✅ Streaming AI response (like ChatGPT)
const sendMessageStream = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userMessage = await Message.create({
      user: req.user._id,
      role: "user",
      text,
      type: "chat",
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'user', message: userMessage })}\n\n`);

    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: "",
      type: "chat",
    });

    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: STRONG_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1000,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content, messageId: aiMessage._id })}\n\n`);
      }
    }

    aiMessage.text = fullResponse;
    await aiMessage.save();

    res.write(`data: ${JSON.stringify({ type: 'done', messageId: aiMessage._id })}\n\n`);
    res.end();

  } catch (err) {
    console.error("Chat Error:", err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
};

// Regular non-streaming send (fallback)
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userMessage = await Message.create({
      user: req.user._id,
      role: "user",
      text,
      type: "chat",
    });

    const aiText = await askHF(text, req.user?._id);

    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: aiText,
      type: "chat",
    });

    return res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error("Chat Error:", err);
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
    
    let session = await ChatSession.findOne({ _id: id, user: req.user._id });
    if (!session) {
      session = await ChatSession.create({
        user: req.user._id,
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        messages: []
      });
    }
    
    const userMessage = {
      role: "user",
      text: text.trim(),
      createdAt: new Date()
    };
    session.messages.push(userMessage);
    
    if (session.messages.length === 1 && session.title === "New Chat") {
      session.title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
    }
    
    await session.save();
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    res.write(`data: ${JSON.stringify({ type: 'user', message: userMessage, sessionId: session._id })}\n\n`);
    
    const conversationHistory = session.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
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

module.exports = { getMessages, sendMessage, sendMessageStream, sendMessageInSession };