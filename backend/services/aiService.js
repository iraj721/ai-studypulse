const Groq = require("groq-sdk");
const axios = require("axios");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const { getCachedResponse, setCachedResponse } = require("./cacheService");

// ✅ FASTER MODELS
const MODELS = {
  groqFast: "llama-3.1-8b-instant",
  groqBalanced: "llama-3.1-8b-instant",
  groqBest: "llama-3.3-70b-versatile",
  hfDefault: process.env.HF_MODEL || "meta-llama/Llama-3.2-1B-Instruct",
};

// ✅ 8 second timeout - user wait nahi karega
const withTimeout = (promise, timeoutMs = 8000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("AI request timeout")), timeoutMs),
  );
  return Promise.race([promise, timeout]);
};

// ✅ GPT-LEVEL SYSTEM PROMPT
const SYSTEM_PROMPT = `You are StudyPulse AI, a world-class study assistant. Follow these rules STRICTLY:
1. Give ACCURATE, FACTUAL information only. If unsure, say "I'm not sure"
2. Keep responses CLEAR and STRUCTURED with bullet points when helpful
3. For math/equations, use clear notation (like x² = y)
4. For code, use proper formatting
5. Be CONCISE but COMPLETE - no fluff or repetition
6. Always be helpful and encouraging to students
7. Break complex topics into simple, easy-to-understand parts
8. Use emojis occasionally to make learning engaging 📚✨
9. NEVER say "as an AI" or "I don't have personal opinions"
10. Give EXAMPLES when explaining concepts`;

async function askGroq(prompt, model = MODELS.groqFast) {
  try {
    const response = await withTimeout(
      groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        model: model,
        temperature: 0.5,
        max_tokens: 1500, // ✅ Increased for better responses
      }),
      8000,
    );
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq API Error:", err.message);
    return null;
  }
}

// Retry logic for rate limits
async function askGroqWithRetry(prompt, model, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await askGroq(prompt, model);
    } catch (err) {
      if (err.message?.includes("rate limit") && i < retries - 1) {
        console.log(`Rate limit hit, retrying in ${(i + 1) * 2} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 2000));
        continue;
      }
      throw err;
    }
  }
}

async function askHuggingFace(prompt) {
  try {
    const response = await withTimeout(
      axios.post(
        "https://router.huggingface.co/v1/chat/completions",
        {
          model: MODELS.hfDefault,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      ),
      8000,
    );
    return response.data?.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("Hugging Face API Error:", err.message);
    return null;
  }
}

async function askAI(prompt, mode = "fast") {
  // Check cache first
  const cachedResponse = getCachedResponse(prompt);
  if (cachedResponse) {
    console.log("⚡ Returning cached response");
    return cachedResponse;
  }

  let result = null;

  try {
    console.log("⚡ Using Groq...");
    result = await askGroq(prompt, MODELS.groqFast);

    if (!result && process.env.HF_API_KEY) {
      console.log("⚠️ Groq failed, falling back to HF...");
      result = await askHuggingFace(prompt);
    }
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return "I'm having trouble generating a response. Please try again in a moment. 🙏";
  }

  if (!result) {
    return "I'm here to help! Could you please rephrase your question? I'll do my best to assist you. 📚";
  }

  // Cache the response
  if (result) {
    setCachedResponse(prompt, result);
  }

  return result;
}

module.exports = askAI;
module.exports.askGroq = askGroq;
module.exports.askHuggingFace = askHuggingFace;
