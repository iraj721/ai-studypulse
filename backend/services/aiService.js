// backend/services/aiService.js
const Groq = require("groq-sdk");
const axios = require("axios");

// Groq Client (FAST)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Models
const MODELS = {
  groqFast: "llama-3.1-8b-instant",        // 840 tok/s
  groqBalanced: "llama-3.3-70b-versatile",  // 394 tok/s
  groqBest: "llama-4-maverick-17b-128e-instruct", // 600 tok/s
  hfDefault: process.env.HF_MODEL || "meta-llama/Llama-3.2-1B-Instruct",
};

/**
 * Fast AI response using Groq (for chat, quizzes, notes)
 */
async function askGroq(prompt, model = MODELS.groqBalanced) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant. Provide clear, accurate responses. Use markdown for formatting.",
        },
        { role: "user", content: prompt },
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 1500,
    });
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq API Error:", err.message);
    return null;
  }
}

/**
 * High-quality AI response using Hugging Face (for complex tasks)
 */
async function askHuggingFace(prompt) {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: MODELS.hfDefault,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data?.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("Hugging Face API Error:", err.message);
    return null;
  }
}

/**
 * Main AI function with smart routing
 * - "fast": Use Groq only (default for most tasks)
 * - "quality": Try Groq first, fallback to HF
 * - "complex": Use HF for better quality
 */
async function askAI(prompt, mode = "fast") {
  let result = null;

  if (mode === "complex") {
    // For complex tasks, try HF first for better quality
    console.log("🧠 Using Hugging Face (quality mode)...");
    result = await askHuggingFace(prompt);
    if (!result) {
      console.log("⚠️ HF failed, falling back to Groq...");
      result = await askGroq(prompt);
    }
  } else {
    // Default: Groq for speed
    console.log("⚡ Using Groq (fast mode)...");
    result = await askGroq(prompt);
    
    // Fallback to HF if Groq fails
    if (!result && process.env.HF_API_KEY) {
      console.log("⚠️ Groq failed, falling back to HF...");
      result = await askHuggingFace(prompt);
    }
  }

  return result || "I'm having trouble generating a response. Please try again.";
}

// Export both for flexibility
module.exports = askAI;
module.exports.askGroq = askGroq;
module.exports.askHuggingFace = askHuggingFace;