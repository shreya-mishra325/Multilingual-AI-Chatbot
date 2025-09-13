import express from "express";
import { getAIResponse } from "../services/geminiService.js";
import { translateText } from "../services/translatorService.js";

const router = express.Router();

let chatHistory = [];
let userContext = {};

router.post("/chat", async (req, res) => {
  const { message, village, language } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (village) {
    userContext.village = village;
  }

  const messageInEnglish = language && language !== "en" ? await translateText(message, "en") : message;
  const aiResponseInEnglish = await getAIResponse(messageInEnglish, userContext);
  const finalResponse = language && language !== "en" ? await translateText(aiResponseInEnglish, language) : aiResponseInEnglish;

  chatHistory.push({ user: message, bot: finalResponse });

  res.json({ response: finalResponse });
});

router.get("/history", (req, res) => {
  res.json(chatHistory);
});

export default router;
