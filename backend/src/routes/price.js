import express from "express";
import {getPriceAdvisory} from "../services/priceService.js";
import {translateText} from "../services/translatorService.js";
import {detectIntent} from "../services/dialogFlowService.js";
import {getAIResponse} from "../services/geminiService.js";

const router = express.Router();

router.post("/advisory", async (req, res) => {
  let { commodity, state, district, language, query } = req.body;
  let dfResponse = {};

  try {
    if (query && (!commodity || !state || !district)) {
      try {
        dfResponse = await detectIntent(query);
      } catch (err) {
        console.error("Dialogflow detectIntent error:", err.message);
      }

      const entities = dfResponse?.entities || {};

      commodity = commodity || entities.commodity || entities.crop || null;
      state = state || entities.state || null;
      district = district || entities.district || entities.city || null;
    }
    if (!commodity && query) {
      try {
        const aiPrompt = `Extract the crop/commodity, state, and district from this farmer query: "${query}". Return as JSON { "commodity": "...", "state": "...", "district": "..." }`;
        const aiResult = await getAIResponse(aiPrompt);

        const parsed = JSON.parse(aiResult.replace(/'/g, '"'));
        commodity = commodity || parsed.commodity || null;
        state = state || parsed.state || null;
        district = district || parsed.district || null;
      } catch (err) {
        console.error("AI extraction failed:", err.message);
      }
    }

    if (!commodity) {
      const msg = "❌ Please tell me which crop’s price you want to check.";
      const reply = language && language !== "en" ? await translateText(msg, language) : msg;
      return res.status(400).setHeader("Content-Type", "text/plain").send(reply);
    }

    let advisory = await getPriceAdvisory(commodity, state, district);

    if (language && language !== "en") {
      try {
        advisory = await translateText(advisory, language);
      } catch (translateErr) {
        console.error("Translation error:", translateErr.message);
      }
    }

    return res.setHeader("Content-Type", "text/plain").send(advisory);

  } catch (err) {
    console.error("Price advisory route error:", err.message);

    try {
      const aiPrompt = `You are a helpful farming assistant.
            Provide a short, direct price advisory for farmers.
            Crop: ${commodity || "unknown"}
            State: ${state || ""}
            District: ${district || ""}
            `;        
      let aiReply = await getAIResponse(aiPrompt);

      if (language && language !== "en") {
        aiReply = await translateText(aiReply, language);
      }

      return res.setHeader("Content-Type", "text/plain").send(aiReply);
    } catch {
      const msg = "❌ Sorry, I couldn’t fetch price details right now.";
      const reply = language && language !== "en" ? await translateText(msg, language) : msg;
      return res.status(500).setHeader("Content-Type", "text/plain").send(reply);
    }
  }
});

export default router;
