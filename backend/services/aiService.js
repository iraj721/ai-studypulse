const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || "meta-llama/Llama-3.2-1B-Instruct";

async function askHF(prompt) {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/v1/chat/completions",
      {
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200, 
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data?.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("HF API ERROR:", err.response?.data || err.message);
    return "";
  }
}

module.exports = askHF;
