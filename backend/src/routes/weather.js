import express from "express";
import {getWeatherAdvisory} from "../services/weatherService.js";
import {translateText} from "../services/translatorService.js";
import {getAIResponse} from "../services/geminiService.js";
import {detectIntent} from "../services/dialogFlowService.js";

const router = express.Router();

router.post("/advisory", async (req, res) => {
let { query, location, language } = req.body;
let dfResponse = {};

try {
  if (query && !location){
    try {
      dfResponse = await detectIntent(query);
    } catch (err) {
      console.error("Dialogflow detectIntent error:", err.message);
    }

    const params = dfResponse?.parameters || {};
    const entities = dfResponse?.entities || {};

    location = location || params.location || params["geo-city"] || params.city || params.village || entities.location || 
    entities["geo-city"] || entities.city || entities.village || null;
  }

  if (!location && query) {
    try {
      const aiPrompt = `Extract the village or city name from this farmer query: "${query}". Only return the name.`;
      location = await getAIResponse(aiPrompt);
      location = location.trim().replace(/[.?!]$/, "");
    } catch (err) {
      console.error("AI location extraction failed:", err.message);
    }
  }
  if (!location) {
    const msg = "❌ Please provide your village or city name to check weather alerts.";
    const reply = language && language !== "en" ? await translateText(msg, language) : msg;
    console.log("Dialogflow response:", JSON.stringify(dfResponse, null, 2));
    return res.status(400).setHeader("Content-Type", "text/plain").send(reply);
  }
  let advisory = await getWeatherAdvisory(location);

  if (!advisory || advisory.toLowerCase().includes("not available")) {
    console.log("Weather advisory not found, using AI fallback.");

    const aiPrompt = `You are a helpful farming assistant.
Provide a short, direct weather advisory for farmers.
Use emojis to indicate conditions: 🌤️ clear, ☔ rain, 🌪️ storm, ⚠️ alert.
Keep it 1-2 sentences.
Location: ${location}`;
    advisory = await getAIResponse(aiPrompt);
  }

  if (language && language !== "en") {
    try {
      advisory = await translateText(advisory, language);
    } catch (translateErr) {
      console.error("Translation error:", translateErr.message);
    }
  }

  return res.setHeader("Content-Type", "text/plain").send(advisory);

} catch (err) {
  console.error("Weather advisory route error:", err.message);

  try {
    const aiPrompt = `You are a helpful farming assistant.
Provide a short, direct weather advisory for farmers.
Use emojis to indicate conditions: 🌤️ clear, ☔ rain, 🌪️ storm, ⚠️ alert.
Keep it 1-2 sentences.
Location: ${location || query}`;

  let aiReply = await getAIResponse(aiPrompt);

  if (language && language !== "en") {
      aiReply = await translateText(aiReply, language);
    }

  return res.setHeader("Content-Type", "text/plain").send(aiReply);
  } catch {
    const msg = "❌ Sorry, I couldn’t fetch weather details right now.";
    const reply = language && language !== "en" ? await translateText(msg, language) : msg;
    return res.status(500).setHeader("Content-Type", "text/plain").send(reply);
  }
}
});

export default router;
