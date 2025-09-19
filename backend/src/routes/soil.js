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
    lower.includes("i don’t have exact soil data") ||
    lower.includes("please provide") ||
    lower.includes("not found")
  );
};

function unwrapToText(result) {
  if (!result) return "";
  try {
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    if (parsed.reply) return parsed.reply;
  } catch {
  }
  return typeof result === "string" ? result : JSON.stringify(result);
}

router.post("/", async (req, res) => {
  let { query, crop, soilType, village, language } = req.body;

  try {
    if (query && (!crop || !soilType || !village)) {
      let dfResponse = {};
      try {
        dfResponse = await detectIntent(query);
      } catch (err) {
        console.error("Dialogflow detectIntent error:", err.message);
      }

      const entities = dfResponse?.entities || {};
      crop = crop || entities.crop || null;
      soilType = soilType || entities.soilType || null;
      village = village || entities.village || null;
    }

    const advisoryQuery = crop || soilType || village || query;
    if (!advisoryQuery) {
      const msg = "❌ Please provide a soil type, crop name, or village.";
      const reply =
        language && language !== "en" ? await translateText(msg, language) : msg;
      return res.status(400).setHeader("Content-Type", "text/plain").send(reply);
    }

    let advice = await getSoilAdvisory(advisoryQuery);
    if (isGenericAdvice(advice)) {
      console.log("Generic soil advisory detected, using AI fallback.");

      const aiPrompt = `
You are a helpful farming assistant.
Provide short, direct soil advisory in 1–2 sentences.
Include crop-specific and fertilizer tips if applicable.
Do NOT ask a question and do NOT repeat the user query.
Respond in a concise, bullet-point style, starting with 🌱 or 💡.
Provide advice for the following: ${crop || "unknown crop"}, ${soilType || "unknown soil"}, ${village || "unknown location"}.
`;
      advice = await getAIResponse(aiPrompt);
    }

    advice = unwrapToText(advice);
    if (language && language !== "en") {
      try {
        advice = await translateText(advice, language);
      } catch (translateErr) {
        console.error("Translation error:", translateErr.message);
      }
    }

    return res.setHeader("Content-Type", "text/plain").send(advice);
  } catch (err) {
    console.error("Error in soil advisory route:", err.message);

    try {
      let aiReply = await getAIResponse(`Provide soil advisory for: ${query}`);
      aiReply = unwrapToText(aiReply);

      if (language && language !== "en") {
        aiReply = await translateText(aiReply, language);
      }
      return res.setHeader("Content-Type", "text/plain").send(aiReply);
    } catch {
      const msg =
        "❌ Sorry, I couldn't fetch soil advisory right now. Please try again later.";
      const reply =
        language && language !== "en" ? await translateText(msg, language) : msg;
      return res
        .status(500)
        .setHeader("Content-Type", "text/plain")
        .send(reply);
    }
  }
});

export default router;
