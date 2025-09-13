import express from "express";
import { getPestAdvice } from "../services/pestService.js";
import { translateText } from "../services/translatorService.js";

const router = express.Router();

let pestChatHistory = [];
let pestContext = {};

router.post("/ask", async (req, res) => {
  const { message, village, crop, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (village) pestContext.village = village;
  if (crop) pestContext.crop = crop;

  const messageInEnglish =
    language && language !== "en"
      ? await translateText(message, "en")
      : message;

  const adviceInEnglish = await getPestAdvice(messageInEnglish, pestContext);

  const finalResponse =
    language && language !== "en"
      ? await translateText(adviceInEnglish, language)
      : adviceInEnglish;

  pestChatHistory.push({ user: message, bot: finalResponse });

  res.json({ response: finalResponse });
});

router.get("/history", (req, res) => {
  res.json(pestChatHistory);
});

export default router;
