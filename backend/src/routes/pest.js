import express from "express";
import { getPestAdvice } from "../services/pestService.js";
import { translateText } from "../services/translatorService.js";
import { getAIResponse } from "../services/geminiService.js";

const router = express.Router();

let pestChatHistory = [];
let pestContext = {};
const isGenericAdvice = (advice) => {
  if (!advice) return true;
  const lower = advice.toLowerCase();
  return (
    lower.includes("not found") ||
    lower.includes("no data") ||
    lower.includes("unable") ||
    lower.includes("sorry")
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

router.post("/ask", async (req, res) => {
  const { message, village, crop, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    if (village) pestContext.village = village;
    if (crop) pestContext.crop = crop;

    const finalCrop = crop || pestContext.crop || null;

    console.log("🐛 Pest Query:", message);
    console.log("Crop:", finalCrop);
    let baseAdvice = await getPestAdvice(message);

    let finalResponse;
    if (!isGenericAdvice(baseAdvice)) {
      console.log("Using DATA + AI enhancement");

      finalResponse = await getAIResponse(`
        You are an agricultural expert.

        Improve this pest advisory for farmers.

        Crop: ${finalCrop || "unknown"}
        Location: ${pestContext.village || "unknown"}

        Base advisory:
        ${baseAdvice}

        Rules:
        - Keep short (2–4 lines)
        - Add prevention tips
        - Use simple language
        - Use emojis 🐛 🌿 💡
        `);
    } else {
      console.log("Using AI fallback");

      finalResponse = await getAIResponse(`
      You are a farming assistant.

      Give pest control advice for:
      Crop: ${finalCrop || "unknown"}
      Problem: ${message}

      Rules:
      - Short answer
      - Include prevention tips
      - Bullet style
      - No questions
      - Use emojis 🐛 🌿 💡
      `);
    }

    finalResponse = unwrapToText(finalResponse);
    if (language && language !== "en") {
      try {
        finalResponse = await translateText(finalResponse, language);
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    }

    pestChatHistory.push({
      user: message,
      bot: finalResponse
    });

    return res.json({ response: finalResponse });

  } catch (err) {
    console.error("Pest route error:", err.message);

    try {
      let fallback = await getAIResponse(
        `Give pest control advice for: ${message}`
      );

      fallback = unwrapToText(fallback);

      if (language && language !== "en") {
        fallback = await translateText(fallback, language);
      }

      return res.json({ response: fallback });

    } catch {
      const msg =
        "❌ Sorry, I couldn’t fetch pest advisory right now.";

      const reply =
        language && language !== "en"
          ? await translateText(msg, language)
          : msg;

      return res.status(500).json({ response: reply });
    }
  }
});

router.get("/history", (req, res) => {
  res.json(pestChatHistory);
});

export default router;

