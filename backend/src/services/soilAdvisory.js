import fs from "fs";
import path from "path";
import { getAIResponse } from "./geminiService.js"; 

const soilDataPath = path.join(process.cwd(), "src/data/soil.json");
const soilData = JSON.parse(fs.readFileSync(soilDataPath, "utf-8"));

const locationMapping = {
  jaipur: "desert",
  lucknow: "alluvial",
  nagpur: "black",
  hyderabad: "red",
  kerala: "laterite",
  patna: "alluvial"
};

export async function getSoilAdvisory(query) {
  if (!query) return "Please provide your village, soil type, or crop name.";

  const userInput = query.toLowerCase();

  if (soilData[userInput]) {
    const soil = soilData[userInput];
    return `You have ${userInput} soil. 🌱 Recommended crops: ${soil.crops}. 💡 Fertilizer tip: ${soil.fertilizers}`;
  }
  if (locationMapping[userInput]) {
    const soilType = locationMapping[userInput];
    const soil = soilData[soilType];
    return `In ${query}, the soil is mostly ${soilType} soil. 🌱 Crops: ${soil.crops}. 💡 Fertilizer tip: ${soil.fertilizers}`;
  }

  for (const [soilType, details] of Object.entries(soilData)) {
    if (details.crops.toLowerCase().includes(userInput)) {
      return `${query}? 🌱 ${details.crops} grow best in ${soilType} soil. 💡 Fertilizer tip: ${details.fertilizers}`;
    }
  }
  try {
    const aiSoilType = await getAIResponse(query);
    if (aiSoilType && soilData[aiSoilType]) {
      const soil = soilData[aiSoilType];
      return `Based on what you said, it seems your area has ${aiSoilType} soil. 🌱 Crops: ${soil.crops}. 💡 Fertilizer tip: ${soil.fertilizers}`;
    }
  } catch (err) {
    console.error("Gemini soil fallback error:", err.message);
  }

  return `I don’t have exact soil data for "${query}". Could you share your soil type or village name?`;
}
