import express from "express";
import { getWeatherAdvisory } from "../services/weatherService.js";
import { translateText } from "../services/translatorService.js";

const router = express.Router();

router.post("/advisory", async (req, res) => {
  const { location, language } = req.body; 

  if (!location) {
    const msg = "Please provide your village or city name to check weather alerts.";
    const reply = language && language !== "en"
      ? await translateText(msg, language)
      : msg;
    return res.status(400).send(reply);
  }

  const advisoryInEnglish = await getWeatherAdvisory(location);
  const finalAdvisory = language && language !== "en" ? await translateText(advisoryInEnglish, language) : advisoryInEnglish;

  res.send(finalAdvisory);
});

export default router;

