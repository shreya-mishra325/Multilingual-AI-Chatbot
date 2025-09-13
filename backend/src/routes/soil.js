import express from "express";
import {getSoilAdvisory } from "../services/soilAdvisory.js";
import {translateText} from "../services/translatorService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query, language } = req.body;

  if (!query) {
    return res.json({
      reply: "❌Please provide a soil type, crop name, or village."
    });
  }

  try {
    let advice = await getSoilAdvisory(query);
    if (language && language !== "en") {
      try {
        advice = await translateText(advice, language);
      } catch (translateErr) {
        console.error("Translation error:", translateErr.message);
      }
    }

    return res.json({ reply: advice });
  } catch (err) {
    console.error("Soil advisory route error:", err.message);

    const msg = "❌ Sorry, I couldn't fetch soil advisory right now. Please try again later.";
    let reply = msg;

    if (language && language !== "en") {
      try {
        reply = await translateText(msg, language);
      } catch {
        reply = msg;
      }
    }
    return res.json({ reply });
  }
});

export default router;

