import fs from "fs";
import path from "path";
import { getAIResponse } from "./geminiService.js";

const soilDataPath = path.join(process.cwd(), "src/data/soil.json");
const soilJson = JSON.parse(fs.readFileSync(soilDataPath, "utf-8"));

const soilData = soilJson.soil_data;
const locationMapping = soilJson.location_mapping;

export async function getSoilAdvisory(query) {
  if (!query) return "❌ Please provide your village, soil type, or crop name.";

  const userInput = query.toLowerCase();
  const foundLocation = Object.keys(locationMapping).find(loc =>
    userInput.includes(loc.toLowerCase())
  );

  if (foundLocation) {
    const mappedSoilKey = locationMapping[foundLocation];
    if (mappedSoilKey && soilData[mappedSoilKey]) {
      const soil = soilData[mappedSoilKey]
      const mentionedCrop = soil.crops.find(c => userInput.includes(c.toLowerCase()));

      return `📍 In ${foundLocation}, the soil is mostly ${soil.soil_type}.
🌱 Recommended crops: ${soil.crops.join(", ")}.
💡 Fertilizer tip: ${soil.fertilizers}
${mentionedCrop ? `✅ Yes, "${mentionedCrop}" grows well here.` : ""}`;
    }
  }

  for (const [soilType, details] of Object.entries(soilData)) {
    if (details.crops.some(c => userInput.includes(c.toLowerCase()))) {
      return `🌱 ${query}? Best suited for ${details.soil_type}.
💡 Fertilizer tip: ${details.fertilizers}`;
    }
  }

  try {
    const aiSoilType = await getAIResponse(query);
    if (aiSoilType) {
      const soilKeyFromAI = Object.keys(soilData).find(
        key => key.toLowerCase() === aiSoilType.toLowerCase()
      );
      if (soilKeyFromAI) {
        const soil = soilData[soilKeyFromAI];
        return `🤖 Based on AI analysis, your area seems to have ${soil.soil_type}.
🌱 Crops: ${soil.crops.join(", ")}.
💡 Fertilizer tip: ${soil.fertilizers}`;
      }
    }
  } catch (err) {
    console.error("Gemini soil fallback error:", err.message);
  }

  return `❌ I don’t have exact soil data for "${query}". Could you share your soil type or village name?`;
}
