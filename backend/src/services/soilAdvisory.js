import fs from "fs";
import path from "path";
import { getAIResponse } from "./geminiService.js";

const soilDataPath = path.join(process.cwd(), "src/data/soil.json");
const soilJson = JSON.parse(fs.readFileSync(soilDataPath, "utf-8"));

const soilData = soilJson.soil_data;
const locationMapping = soilJson.location_mapping;

function normalize(text) {
  if (!text) return "";
  return text.toLowerCase().trim();
}

async function getSoilAdvisory(query) {
  if (!query) {
    return "❌ Please provide your village, soil type, or crop name.";
  }

  const userInput = normalize(query);

  const foundLocation = Object.keys(locationMapping).find(loc =>
    userInput.includes(loc.toLowerCase())
  );

  if (foundLocation) {
    const mappedSoilKey = locationMapping[foundLocation];

    if (mappedSoilKey && soilData[mappedSoilKey]) {
      const soil = soilData[mappedSoilKey];

      const mentionedCrop = soil.crops.find(c =>
        userInput.includes(c.toLowerCase())
      );

      return `📍 In ${foundLocation}, the soil is mostly ${soil.soil_type}.
      🌱 Recommended crops: ${soil.crops.join(", ")}.
      💡 Fertilizer tip: ${soil.fertilizers}${
        mentionedCrop ? `\n✅ Yes, "${mentionedCrop}" grows well here.` : ""
      }`;
    }
  }

  for (const [soilType, details] of Object.entries(soilData)) {
    const cropMatch = details.crops.find(c =>
      userInput.includes(c.toLowerCase())
    );

    if (cropMatch) {
      return `🌱 ${cropMatch} grows best in ${details.soil_type}.
        💡 Fertilizer tip: ${details.fertilizers}`;
    }
  }

  try {
    const aiSoilType = await getAIResponse(
      `Identify soil type from this query: "${query}". Return only soil type name.`
    );

    const cleanAI = normalize(aiSoilType);

    const soilKeyFromAI = Object.keys(soilData).find(
      key => key.toLowerCase() === cleanAI
    );

    if (soilKeyFromAI) {
      const soil = soilData[soilKeyFromAI];

      return `🤖 Soil type: ${soil.soil_type}.
      🌱 Crops: ${soil.crops.join(", ")}.
      💡 Fertilizer tip: ${soil.fertilizers}`;
    }
  } catch (err) {
    console.error("Gemini soil fallback error:", err.message);
  }

  return `❌ I don’t have exact soil data for "${query}". Please provide your village or soil type.`;
}

export { getSoilAdvisory };