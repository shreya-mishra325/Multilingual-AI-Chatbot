import express from "express";
import {getPestAdvice} from "../services/pestService.js";
import {translateText} from "../services/translatorService.js";

const router = express.Router();

let pestChatHistory = [];
let pestContext = {};

router.post("/ask", async (req, res) => {
  const { message, village, crop, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({error: "Message is required"});
  }

  if (village) pestContext.village = village;
  if (crop) pestContext.crop = crop;

  try {
    let mainAdvice = await getPestAdvice(message, { language });
    let extraAdvice = null;
    if (mainAdvice.includes("🐛 **Pest Advisory")) {
      extraAdvice = await getPestAdvice(
        `Give additional pest prevention tips for: ${message}`,
        { language }
      );
    }
    const finalResponse = extraAdvice ? `${mainAdvice}\n\n🤖 Extra AI Tips:\n${extraAdvice}`: mainAdvice;

    pestChatHistory.push({user: message, bot: finalResponse});

    res.json({ response: finalResponse });
  } catch (err) {
    console.error("Pest route error:", err.message);
    const msg = "❌ Sorry, I couldn’t fetch pest advisory right now.";
    const reply =
      language && language !== "en" ? await translateText(msg, language) : msg;
    res.status(500).json({ response: reply });
  }
});

router.get("/history", (req, res) => {
  res.json(pestChatHistory);
});

export default router;

