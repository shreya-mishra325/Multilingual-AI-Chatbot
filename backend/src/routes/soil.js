import express from "express";
import { getSoilAdvisory } from "../services/soilAdvisory.js";
import { translateText } from "../services/translatorService.js";
import { getAIResponse } from "../services/geminiService.js";
import { detectIntent } from "../services/dialogFlowService.js";

const router = express.Router();

const isGenericAdvice = (advice) => {
  if (!advice) return true;
  const lower = advice.toLowerCase();
  return (
    lower.includes("not found") ||
    lower.includes("no data") ||
    lower.includes("please provide") ||
    lower.includes("i don’t have exact soil data")
  );
};

function unwrapToText(result) {
  if (!result) return "";
  try {
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    if (parsed.reply) return parsed.reply;
  } catch {}
  return typeof result === "string" ? result : JSON.stringify(result);
}

router.post("/", async (req, res) => {
  let { query, crop, soilType, village, language } = req.body;

  try {
    if (query && (!crop || !soilType || !village)) {
      try {
        const dfResponse = await detectIntent(query);
        const entities = dfResponse?.entities || {};

        crop = crop || entities.crop || null;
        soilType = soilType || entities.soilType || null;
        village = village || entities.village || entities.city || null;

      } catch (err) {
        console.error("Dialogflow error:", err.message);
      }
    }

    // 🔍 STEP 2: Build query
    const advisoryQuery = crop || soilType || village || query;

    if (!advisoryQuery) {
      const msg = "❌ Please provide a crop, soil type, or village.";
      const reply =
        language && language !== "en"
          ? await translateText(msg, language)
          : msg;

      return res.status(400).send(reply);
    }

    console.log("🌱 Soil Query:", advisoryQuery);

    // 📊 STEP 3: Get base data
    let baseAdvice = await getSoilAdvisory(advisoryQuery);

    let advice;

    // 🚀 STEP 4: DATA + AI Enhancement
    if (!isGenericAdvice(baseAdvice)) {
      console.log("✅ Using DATA + AI enhancement");

      advice = await getAIResponse(`
      You are an agricultural expert.

      Explain this soil advisory in a simple and farmer-friendly way.

      Crop: ${crop || "unknown"}
      Location: ${village || "unknown"}

      Base advisory:
      ${baseAdvice}

      Rules:
      - Keep answer short (2–3 lines)
      - Do NOT change facts
      - Add 1 line about local soil if possible
      - Use simple language
      - Use emojis 🌱 💡
      `);

    } else {
      console.log("⚠️ Using AI fallback (no data found)");
      advice = await getAIResponse(`
      You are a helpful farming assistant.

      Provide soil advice for:
      Crop: ${crop || "unknown"}
      Location: ${village || "unknown"}

      Rules:
      - Short answer
      - Bullet style
      - Include fertilizer tip
      - No questions
      - Use emojis 🌱 💡
      `);
    }

    advice = unwrapToText(advice);
    if (language && language !== "en") {
      try {
        advice = await translateText(advice, language);
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    }

    return res
      .setHeader("Content-Type", "text/plain")
      .send(advice);
  } catch (err) {
    console.error("🔥 Soil route error:", err.message);

    try {
      let fallback = await getAIResponse(
        `Provide soil advice for: ${query || crop || "farming"}`
      );

      fallback = unwrapToText(fallback);

      if (language && language !== "en") {
        fallback = await translateText(fallback, language);
      }

      return res.send(fallback);

    } catch {
      const msg =
        "❌ Sorry, I couldn't fetch soil advisory right now.";

      const reply =
        language && language !== "en"
          ? await translateText(msg, language)
          : msg;

      return res.status(500).send(reply);
    }
  }
});

export default router;