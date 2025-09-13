import fs from "fs";
import path from "path";
import { getAIResponse } from "./geminiService.js"; 

const soilDataPath = path.join(process.cwd(), "src/data/soil.json");
const soilJson = JSON.parse(fs.readFileSync(soilDataPath, "utf-8"));

const soilData = soilJson.soil_data;
const locationMapping = soilJson.location_mapping;

export async function getSoilAdvisory(query) {
  if (!query) return "Please provide your village, soil type, or crop name.";

  const userInput = query.toLowerCase();
  const soilKey = Object.keys(soilData).find(
    key => key.toLowerCase() === userInput
  );

  if (soilKey) {
    const soil = soilData[soilKey];
    return `✅ You have ${soil.soil_type}.  
    🌱 Recommended crops: ${soil.crops}.  
    💡 Fertilizer tip: ${soil.fertilizers}`;
  }
  const mappedSoilKey = locationMapping[query] || locationMapping[query.charAt(0).toUpperCase() + query.slice(1)];

  if (mappedSoilKey && soilData[mappedSoilKey]) {
    const soil = soilData[mappedSoilKey];
    return `📍 In ${query}, the soil is mostly ${soil.soil_type}.  
    🌱 Crops: ${soil.crops}.  
    💡 Fertilizer tip: ${soil.fertilizers}`;
  }

  for (const [soilType, details] of Object.entries(soilData)) {
    if (details.crops.toLowerCase().includes(userInput)) {
    return `🌱 ${query}? Best suited for ${soilData[soilType].soil_type}.  
    💡 Fertilizer tip: ${details.fertilizers}`;
    }
  }
  try {
    const aiSoilType = await getAIResponse(query);
    if (aiSoilType) {
      const soilKeyFromAI = Object.keys(soilData).find(key => key.toLowerCase() === aiSoilType.toLowerCase());
      if (soilKeyFromAI) {
        const soil = soilData[soilKeyFromAI];
      return `Based on your input, it seems your area has ${soil.soil_type}.  
        🌱 Crops: ${soil.crops}.  
        💡 Fertilizer tip: ${soil.fertilizers}`;
      }
    }
  } catch (err) {
    console.error("Gemini soil fallback error:", err.message);
  }

  return `❌ I don’t have exact soil data for "${query}". Could you share your soil type or village name?`;
}
