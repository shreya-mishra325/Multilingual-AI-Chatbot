import express from "express";
import { getPriceAdvisory } from "../services/priceService.js";
import { translateText } from "../services/translatorService.js";
import { detectIntent } from "../services/dialogFlowService.js";
import { getAIResponse } from "../services/geminiService.js";

const router = express.Router();
function normalizeCrop(crop) {
  if (!crop) return null;
  const c = crop.toLowerCase();

  if (c.includes("chilli") || c.includes("chili")) return "green chilli";

  return c;
}

function extractCommodityFromText(query) {
  const crops = [
    "green chilli", "chilli", "chili",
    "wheat", "rice", "maize", "tomato",
    "potato", "onion", "soybean"
  ];

  const lower = query.toLowerCase();
  crops.sort((a, b) => b.length - a.length);

  for (let crop of crops) {
    if (lower.includes(crop)) return crop;
  }
  return null;
}

function extractDistrictFromText(query) {
  const match = query.toLowerCase().match(/in\s+([a-z\s]+)/);
  if (!match) return null;

  let district = match[1].trim();
  district = district.split(" ")[0];

  return district;
}

function clean(val) {
  if (!val) return null;
  if (Array.isArray(val)) return val[0];
  return String(val).trim();
}

router.post("/advisory", async (req, res) => {
  let { commodity, state, district, language, query } = req.body;

  try {
    if (query) {
      try {
        const df = await detectIntent(query);
        const entities = df?.entities || {};

        commodity =
          commodity ||
          clean(entities.commodity) ||
          clean(entities.crop);

        state = state || clean(entities.state);

        district =
          district ||
          clean(entities.district) ||
          clean(entities.city);

      } catch (err) {
        console.error("Dialogflow error:", err.message);
      }
    }
    if (query) {
      commodity = commodity || extractCommodityFromText(query);
      district = district || extractDistrictFromText(query);
    }
    if (!commodity && query) {
      try {
        const aiPrompt = `
        Extract crop, state, district from:
        "${query}"

        Return JSON:
        { "commodity": "...", "state": "...", "district": "..." }
        `;

        const aiResult = await getAIResponse(aiPrompt);
        const match = aiResult.match(/\{[\s\S]*\}/);

        if (match) {
          const parsed = JSON.parse(match[0]);

          commodity = commodity || clean(parsed.commodity);
          state = state || clean(parsed.state);
          district = district || clean(parsed.district);
        }
      } catch (err) {
        console.error("AI extraction failed:", err.message);
      }
    }

    commodity = normalizeCrop(clean(commodity));
    state = clean(state) || "unknown";
    district = clean(district);

    console.log("💰 FINAL VALUES:");
    console.log("Commodity:", commodity);
    console.log("State:", state);
    console.log("District:", district);
    if (!commodity) {
      return res.send("❌ Please specify the crop name.");
    }
    let advisory = await getPriceAdvisory(
      commodity,
      state,
      district
    );
    if (language && language !== "en") {
      try {
        advisory = await translateText(advisory, language);
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    }

    return res
      .setHeader("Content-Type", "text/plain")
      .send(advisory);

  } catch (err) {
    console.error("🔥 Price route error:", err.message);

    try {
      let fallback = await getAIResponse(`
      Give mandi price info for:
      Crop: ${commodity || "unknown"}
      State: ${state || "unknown"}
      District: ${district || "unknown"}
      `);

      if (language && language !== "en") {
        fallback = await translateText(fallback, language);
      }

      return res.send(fallback);

    } catch {
      const msg = "❌ Sorry, I couldn’t fetch price details right now.";

      const reply =
        language && language !== "en"
          ? await translateText(msg, language)
          : msg;

      return res.status(500).send(reply);
    }
  }
});

export default router;