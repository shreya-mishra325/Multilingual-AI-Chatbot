import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import {translateText} from "./translatorService.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const filePath = new URL("../data/pests.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

export async function getPestAdvice(userMessage, options = {}) {
  const {language = "en"} = options;

try {
  const input = userMessage.toLowerCase();
    for (const [crop, details] of Object.entries(data)){
    if (input.includes(crop.toLowerCase())) {
      let advice = `🐛 Pest Advisory for ${crop}\n\n`+
                  `⚠️ Common pests: ${details.pests.join(", ")}\n`+
                  `💡 Control tips: ${details.control}`;

        if (language && language !== "en"){
          try {
            advice = await translateText(advice, language);
          } catch (err) {
            console.error("Translation error:", err.message);
          }
        }

        return advice;
      }
    }
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Provide pest management advice in 70 words point wise with emojis for: ${userMessage}`
            }
          ]
        }
      ]
    };

    const response = await axios.post(GEMINI_API_URL, payload);
    let aiAdvice = response.data.candidates[0].content.parts[0].text;
    aiAdvice = aiAdvice.replace(/\*\*/g, "");

    if (language && language !== "en") {
      try {
        aiAdvice = await translateText(aiAdvice, language);
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    }

    return aiAdvice;

  } catch (error) {
    console.error("Error in pestService:", error.message);
    return "❌ Sorry, I am unable to provide pest advice right now.";
  }
}