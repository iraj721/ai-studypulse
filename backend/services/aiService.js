const Groq = require("groq-sdk");
const axios = require("axios");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODELS = {
  groqFast: "llama-3.1-8b-instant",
  groqBalanced: "llama-3.3-70b-versatile",
  groqBest: "llama-4-maverick-17b-128e-instruct",
  hfDefault: process.env.HF_MODEL || "meta-llama/Llama-3.2-1B-Instruct",
};

// ✅ Timeout promise (30 seconds)
const withTimeout = (promise, timeoutMs = 30000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("AI request timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

async function askGroq(prompt, model = MODELS.groqBalanced) {
  try {
    const response = await withTimeout(
      groq.chat.completions.create({
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
      }),
      30000
    );
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq API Error:", err.message);
    return null;
  }
}

async function askHuggingFace(prompt) {
  try {
    const response = await withTimeout(
      axios.post(
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
      ),
      30000
    );
    return response.data?.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("Hugging Face API Error:", err.message);
    return null;
  }
}

async function askAI(prompt, mode = "fast") {
  let result = null;

  try {
    if (mode === "complex") {
      console.log("🧠 Using Hugging Face (quality mode)...");
      result = await askHuggingFace(prompt);
      if (!result) {
        console.log("⚠️ HF failed, falling back to Groq...");
        result = await askGroq(prompt);
      }
    } else {
      console.log("⚡ Using Groq (fast mode)...");
      result = await askGroq(prompt);
      
      if (!result && process.env.HF_API_KEY) {
        console.log("⚠️ Groq failed, falling back to HF...");
        result = await askHuggingFace(prompt);
      }
    }
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return "I'm having trouble generating a response. Please try again in a few seconds.";
  }

  return result || "Unable to generate response. Please try again.";
}

module.exports = askAI;
module.exports.askGroq = askGroq;
module.exports.askHuggingFace = askHuggingFace;