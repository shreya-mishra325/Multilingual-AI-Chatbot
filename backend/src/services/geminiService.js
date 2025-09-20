import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function getAIResponse(userMessage, context = {}, options = { mode: "text" }) {
try {
    let systemInstruction =
      options.mode === "intent" ? `Extract the farmer's intent and entities from the message. Return JSON only in this format:
{
  "intent": "get_weather_alert" | "get_crop_price" | "get_pest_info" | "get_soil_health" | "unknown",
  "entities": { "city"?: string, "crop"?: string, "village"?: string }
}`
: "You are a helpful assistant answering farmers' queries.";

const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemInstruction}\n\nUser: ${userMessage}` }]
      }
    ]
  };

const response = await axios.post(GEMINI_API_URL, payload, {
    headers: { "Content-Type": "application/json" }
  });

const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (options.mode === "intent") {
    try {
      return JSON.parse(text);
    } catch {
      return { intent: "unknown", entities: {} };
    }
  }
  return text || "Sorry, I could not understand your question.";
} catch (error) {
  console.error("Error in GeminiService:", error.response?.data || error.message);
  return options.mode === "intent"
    ? { intent: "unknown", entities: {} }
    : "Sorry, I am having trouble answering right now.";
}
}
