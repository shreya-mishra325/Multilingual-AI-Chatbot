import express from "express";
import {getPriceAdvisory} from "../services/priceService.js";
import {translateText} from "../services/translatorService.js";

const router = express.Router();

router.post("/advisory", async (req, res) => {
  const { commodity, state, district, language } = req.body;

  if (!commodity) {
    return res.status(400).send("Please tell me which crop’s price you want to check.");
  }

  const advisoryInEnglish = await getPriceAdvisory(commodity, state, district);
  const finalAdvisory = language && language !== "en" ? await translateText(advisoryInEnglish, language) : advisoryInEnglish;

  res.send(finalAdvisory);
});

export default router;
