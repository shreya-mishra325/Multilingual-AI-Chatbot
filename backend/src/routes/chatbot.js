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

const HINDI_MAP = {
  tamatar: "tomato",
  gehun: "wheat",
  chawal: "rice",
  aloo: "potato",
  pyaaz: "onion"
};

const extractCrop = (msg) => {
  const crops = [
    "green chilli", "chilli", "chili",
    "wheat", "rice", "maize", "tomato", "potato",
    "onion", "soybean", "cotton", "barley", "mustard"
  ];
  crops.sort((a, b) => b.length - a.length);
  return crops.find(crop => msg.includes(crop)) || null;
};

const normalizeCrop = (crop) => {
  if (!crop) return null;
  if (crop.includes("chilli") || crop.includes("chili")) return "green chilli";
  return crop;
};

const mapHindiToEnglish = (msg) => {
  for (let key in HINDI_MAP) {
    if (msg.includes(key)) return HINDI_MAP[key];
  }
  return null;
};

const extractDistrict = (msg) => {
  if (!msg) return null;

  const patterns = [
    /in\s+([a-z\s]+)/,
    /for\s+([a-z\s]+)/,
    /at\s+([a-z\s]+)/,
    /weather\s+([a-z\s]+)/,
    /([a-z\s]+)\s+weather/
  ];

  for (let pattern of patterns) {
    const match = msg.match(pattern);
    if (match) return match[1].trim();
  }

  const words = msg.split(" ");
  const ignore = [
    "weather", "price", "soil", "pest",
    "alert", "today", "tomorrow", "what", "is"
  ];

  const possible = words.filter(w => !ignore.includes(w));
  return possible.length ? possible.join(" ") : null;
};

const cleanValue = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  return val;
};

const cleanMarkdown = (text) => {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*/g, "•");
};

router.post("/chat", async (req, res) => {
  try {
    const { message, village, state, district, language, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const uid = userId || "default_user";

    if (!userContext[uid]) {
      userContext[uid] = {
        village: null,
        state: null,
        district: null,
        crops: [],
        keyFacts: [],
        lastIntent: null,
        lastCrop: null,
        lastLocation: null
      };
    }

    const ctx = userContext[uid];

    if (village) ctx.village = village;
    if (state) ctx.state = state;
    if (district) ctx.district = district;

    let messageInEnglish = message;

    if (language && language !== "en") {
      try {
        messageInEnglish = await translateText(message, "en");
      } catch {}
    }

    const msg = messageInEnglish.toLowerCase();

    let intent = "unknown";
    let entities = {};

    try {
      const df = await detectIntent(messageInEnglish);
      intent = df.intent || "unknown";
      entities = df.entities || {};
      if (df.confidence && df.confidence < 0.6) intent = "unknown";
    } catch {}

    if (
      msg.includes("price") ||
      msg.includes("mandi") ||
      msg.includes("rate") ||
      msg.includes("bhav") ||
      msg.includes("cost")
    ) intent = "get_crop_price";

    if (msg.includes("weather")) intent = "get_weather_alert";
    if (msg.includes("soil")) intent = "get_soil_health";
    if (msg.includes("pest") || msg.includes("disease")) intent = "get_pest_info";

    const detectedCrop = extractCrop(msg) || mapHindiToEnglish(msg);
    const detectedDistrict = extractDistrict(msg);

    let finalCrop =
      detectedCrop ||
      mapHindiToEnglish(msg) ||
      cleanValue(entities.crop) ||
      cleanValue(entities.commodity) ||
      ctx.lastCrop;

    finalCrop = normalizeCrop(finalCrop);

    let finalLocation =
      detectedDistrict ||
      cleanValue(entities.district) ||
      cleanValue(entities.city) ||
      ctx.lastLocation ||
      ctx.village;

    if (intent === "unknown" && ctx.lastIntent) {
      intent = ctx.lastIntent;
    }

    if (finalCrop && !ctx.crops.includes(finalCrop)) {
      ctx.crops.push(finalCrop);
    }

    ctx.lastIntent = intent;
    ctx.lastCrop = finalCrop;
    ctx.lastLocation = finalLocation;

    let finalResponse = "";

    switch (intent) {
      case "get_crop_price":
        if (!finalCrop) {
          finalResponse = "❌ Please tell me the crop name.";
        } else {
          finalResponse = await getPriceAdvisory(finalCrop, state, finalLocation);
        }
        break;

      case "get_weather_alert":
        if (!finalLocation) {
          finalResponse = "❌ Please tell me your city or village.";
        } else {
          finalResponse = await getWeatherAdvisory(finalLocation);
        }
        break;

      case "get_soil_health":
        finalResponse = await getSoilAdvisory(finalCrop || finalLocation);
        break;

      case "get_pest_info":
        if (!finalCrop) {
          finalResponse = "❌ Please tell me the crop name.";
        } else {
          finalResponse = await getPestAdvice(finalCrop);
        }
        break;

      default:
        try {
          const prompt = `
You are a helpful farming assistant.
Keep answers short and practical.

Village: ${ctx.village || "unknown"}
State/District: ${ctx.state || ""}/${ctx.district || ""}
Crops: ${ctx.crops.join(", ") || "none"}

User: ${messageInEnglish}
`;
          finalResponse = await getAIResponse(prompt);
        } catch {
          finalResponse = "⚠️ I’m having trouble right now. Please try again.";
        }
    }

    finalResponse = cleanMarkdown(finalResponse);

    if (
      language &&
      language !== "en" &&
      typeof finalResponse === "string" &&
      finalResponse.length < 500 &&
      !finalResponse.startsWith("❌")
    ) {
      try {
        finalResponse = await translateText(finalResponse, language);
      } catch {}
    }

    chatHistory.push({ userId: uid, user: message, bot: finalResponse });

    ctx.keyFacts.push(`User asked: ${message}`);
    if (ctx.keyFacts.length > 10) ctx.keyFacts.shift();

    res.json({ response: finalResponse });

  } catch (err) {
    res.json({ response: "⚠️ Something went wrong. Please try again." });
  }
});

router.get("/history", (req, res) => res.json(chatHistory));

router.delete("/history", (req, res) => {
  chatHistory = [];
  userContext = {};
  res.json({ message: "History cleared" });
});

export default router;