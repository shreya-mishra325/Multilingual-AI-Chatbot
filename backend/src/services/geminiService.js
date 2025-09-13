import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function getAIResponse(userMessage, context = {}) {
  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ]
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });

    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not understand your question."
    );
  } catch (error) {
    console.error("Error in GeminiService:", error.response?.data || error.message);
    return "Sorry, I am having trouble answering right now.";
  }
}
