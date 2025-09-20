import express from "express";
import { getAIResponse } from "../services/geminiService.js";
import { translateText } from "../services/translatorService.js";
import { getWeatherAdvisory } from "../services/weatherService.js";
import { getPriceAdvisory } from "../services/priceService.js";
import { getSoilAdvisory } from "../services/soilAdvisory.js";
import { getPestAdvice } from "../services/pestService.js";
import { detectIntent } from "../services/dialogFlowService.js";

const router = express.Router();

let chatHistory = [];
let userContext = {}; 

const COMMON_CROPS = ["wheat", "maize", "rice", "tomato", "potato"];
const COMMON_STATES = ["Punjab", "Haryana", "Bihar", "Maharashtra"];
const COMMON_DISTRICTS = ["Ludhiana", "Mohali", "Ropar", "Patiala"];

router.post("/chat", async (req, res) => {
  const {message, village, state, district, language, userId} = req.body;

  if (!message || !message.trim())
  return res.status(400).json({ error: "Message is required" });
  if (!userContext[userId]) userContext[userId] = {
    village: null,
    state: null,
    district: null,
    crops: [],
    keyFacts: [] 
  };

  const userCtx = userContext[userId];

  if (village) userCtx.village = village;
  if (state) userCtx.state = state;
  if (district) userCtx.district = district;

  let messageInEnglish = message;
  if (language && language !== "en") {
    try { messageInEnglish = await translateText(message, "en"); }
    catch { messageInEnglish = message; }
  }

  let nlpOutput = {intent: "unknown", entities: {}};
  try {
    const dfResponse = await detectIntent(messageInEnglish);
    nlpOutput.intent = dfResponse.intent || "unknown";
    nlpOutput.entities = dfResponse.entities || {};
  } catch {
    try { nlpOutput = await getAIResponse(messageInEnglish, userCtx, { mode: "intent"}); }
    catch { nlpOutput.intent = "unknown"; nlpOutput.entities = {}; }
  }

  const entities = nlpOutput.entities || {};
  const crop = entities.commodity || entities.crop || null;
  if (crop && !userCtx.crops.includes(crop)) userCtx.crops.push(crop);

  let finalResponse = "";
  let backendJSON = { action: nlpOutput.intent, data: {} };

  const farmingIntents = ["get_weather_alert","get_crop_price","get_soil_health","get_pest_info"];

  if (farmingIntents.includes(nlpOutput.intent)) {
    switch (nlpOutput.intent) {
      case "get_weather_alert": {
        const location = entities.city || entities.district || village || userCtx.village || "unknown";
        if (location === "unknown") finalResponse = "❌ Please provide your village or city name.";
        else {
          const advisory = await getWeatherAdvisory(location);
          finalResponse = language !== "en" ? await translateText(advisory, language) : advisory;
        }
        break;
      }
      case "get_crop_price": {
        const queryCrop = crop || userCtx.crops[userCtx.crops.length - 1];
        if (!queryCrop) finalResponse = "❌ Please tell me which crop’s price you want.";
        else {
          const advisory = await getPriceAdvisory(queryCrop, state, district);
          finalResponse = language !== "en" ? await translateText(advisory, language) : advisory;
        }
        break;
      }
      case "get_soil_health": {
        const query = crop || entities.soilType || userCtx.village || "unknown";
        if (query === "unknown") finalResponse = "❌ Please provide soil type, crop, or village.";
        else {
          const advisory = await getSoilAdvisory(query);
          finalResponse = language !== "en" ? await translateText(advisory, language) : advisory;
        }
        break;
      }
      case "get_pest_info": {
        const queryCrop = crop || userCtx.crops[userCtx.crops.length - 1];
        if (!queryCrop) finalResponse = "❌ Please tell me the crop name.";
        else {
          const advisory = await getPestAdvice(queryCrop);
          finalResponse = language !== "en" ? await translateText(advisory, language) : advisory;
        }
        break;
      }
    }

    if (crop) userCtx.keyFacts.push(`User grows ${crop}`);
  } else {
    const greetingMatch = messageInEnglish.match(/\b(hi|hello|hey|how are you)\b/i);
    if (greetingMatch) {
      finalResponse = "Hello! I’m your farming assistant. How can I help?";
      backendJSON.action = "small_talk";
    } else {
      try {
        const contextPrompt =
        `You are a helpful farming assistant.
        Keep your answer short (max 3 sentences).
        Key user context:
        - Village: ${userCtx.village || "unknown"}
        - State/District: ${userCtx.state || ""}/${userCtx.district || ""}
        - Crops: ${userCtx.crops.join(", ") || "none"}
        - Important facts: ${userCtx.keyFacts.slice(-5).join("; ") || "none"}

        Answer the user message concisely: "${messageInEnglish}"`;

        const aiResponse = await getAIResponse(contextPrompt, userCtx, {mode: "text"});
        finalResponse = language !== "en" ? await translateText(aiResponse, language) : aiResponse;
        backendJSON.action = "gemini_context_aware";
        const commodityMatch = finalResponse.match(new RegExp(COMMON_CROPS.join("|"), "i"));
        const stateMatch = finalResponse.match(new RegExp(COMMON_STATES.join("|"), "i"));
        const districtMatch = finalResponse.match(new RegExp(COMMON_DISTRICTS.join("|"), "i"));

        backendJSON.data = {
          commodity: commodityMatch ? [commodityMatch[0]] : [],
          state: stateMatch ? [stateMatch[0]] : [],
          district: districtMatch ? [districtMatch[0]] : []
        };
      } catch (err) {
        console.error("Gemini error:", err.message);
        finalResponse = "❌ Sorry, I couldn’t process your query at the moment.";
        backendJSON.action = "fallback_error";
      }
    }
  }

  chatHistory.push({userId, user: message, bot: finalResponse});
  userCtx.keyFacts.push(`User asked: ${message}`);
  if (userCtx.keyFacts.length > 10) userCtx.keyFacts.shift();

  res.json({ response: finalResponse, json: backendJSON });
});

router.get("/history", (req, res) => res.json(chatHistory));
router.delete("/history", (req, res) => {
  chatHistory = [];
  userContext = {};
  res.json({ message: "Chat history and user context cleared successfully." });
});

export default router;
