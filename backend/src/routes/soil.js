import express from "express";
import { getSoilAdvisory } from "../services/soilAdvisory.js";
import { translateText } from "../services/translatorService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query, language } = req.body;

  try {
    let advice = await getSoilAdvisory(query);
    if (language && language !== "en") {
      advice = await translateText(advice, language);
    }

    return res.json({ reply: advice });
  } catch (err) {
    console.error("Soil advisory route error:", err.message);
    const msg = "Sorry, I couldn't fetch soil advisory right now. Please try again later.";
    const reply = language && language !== "en" ? await translateText(msg, language) : msg;
    return res.json({ reply });
  }
});

export default router;
