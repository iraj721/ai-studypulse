const Message = require("../models/Message");
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

    // Save user message
    const userMessage = await Message.create({
      user: req.user._id,
      role: "user",
      text,
      type: "chat",
    });

    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send user message confirmation
    res.write(`data: ${JSON.stringify({ type: 'user', message: userMessage })}\n\n`);

    // Create AI message placeholder
    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: "",
      type: "chat",
    });

    // Stream AI response with STRONG prompt
    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: STRONG_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 1000, // ✅ Increased for better responses
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

    // Update AI message with full response
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

// Regular non-streaming send (fallback) - also use strong prompt
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

    const aiText = await askHF(text);

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

module.exports = { getMessages, sendMessage, sendMessageStream };