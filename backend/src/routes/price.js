import express from "express";
import {getPriceAdvisory} from "../services/priceService.js";
import {translateText} from "../services/translatorService.js";
import {detectIntent} from "../services/dialogFlowService.js";
import {getAIResponse} from "../services/geminiService.js";

const router = express.Router();

function extractCommodityFromText(query) {
  const match = query.match(/(?:price (?:of|for)|how much is)?\s*([\w\s]+?)\s+(?:in)\s+/i);
  return match ? match[1].trim() : null;
}

function extractDistrictFromText(query) {
  const match = query.match(/\s+in\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

router.post("/advisory", async (req, res) => {
  let { commodity, state, district, language, query } = req.body;

try {
  if (query && (!commodity || !state || !district)) {
    try {
      const dfResponse = await detectIntent(query);
      const entities = dfResponse?.entities || {};

      commodity =
        commodity ||
        entities.commodity ||
        entities.crop ||
        extractCommodityFromText(query);
      state = state || entities.state || null;
      district =
        district || entities.district || entities.city || extractDistrictFromText(query);
    } catch (err) {
      console.error("Dialogflow detectIntent error:", err.message);
    }
  }

  if ((!commodity || !state || !district) && query) {
    try {
      const aiPrompt = `Extract the crop/commodity, state, and district from this farmer query: "${query}".
      Return ONLY valid JSON in this format:
      { "commodity": "...", "state": "...", "district": "..." }
      If state or district is not mentioned, set them to "unknown".`;

      const aiResult = await getAIResponse(aiPrompt);
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        commodity = commodity || (parsed.commodity && String(parsed.commodity).trim());
        state = state || (parsed.state && String(parsed.state).trim());
        district = district || (parsed.district && String(parsed.district).trim());
      }
    } catch (err) {
      console.error("AI extraction failed:", err.message);
    }
  }

  commodity = commodity != null ? String(commodity).trim() : null;
  state = state != null ? String(state).trim() : "unknown";
  district = district != null ? String(district).trim() : "unknown";

  if (!commodity) {
      const aiPrompt = `Extract the crop/commodity, state, and district from this farmer query: "${query}".
      Return ONLY valid JSON:
      { "commodity": "...", "state": "...", "district": "..." }`;

  const aiResult = await getAIResponse(aiPrompt);
  const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    commodity = parsed.commodity?.trim() || null;
    state = parsed.state?.trim() || null;
    district = parsed.district?.trim() || null;
  }
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
  State: ${state || "unknown"}
  District: ${district || "unknown"}`;

  let aiReply = await getAIResponse(aiPrompt);
  if (language && language !== "en") {
    aiReply = await translateText(aiReply, language);
  }
  return res.setHeader("Content-Type", "text/plain").send(aiReply);

  } catch {
  const msg = "❌ Sorry, I couldn’t fetch price details right now.";
  const reply =
    language && language !== "en" ? await translateText(msg, language) : msg;
  return res.status(500).setHeader("Content-Type", "text/plain").send(reply);
  }
}
});

export default router;

