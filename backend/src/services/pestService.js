import axios from "axios";

const GEMINI_API_URL = "https://api.gemini.ai/v1/response";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function getPestAdvice(userMessage, context = {}) {
  try {
    const payload = {
      prompt: `Provide pest management advice: ${userMessage}`,
      context,
      max_tokens: 150,
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.reply || "Sorry, I couldn't provide pest advice for this.";
  } catch (error) {
    console.error("Error in pestService:", error.message);
    return "Sorry, I am unable to provide pest advice right now.";
  }
}

