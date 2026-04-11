import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
export async function getAIResponse(prompt, context = {}) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("✅ Gemini success (primary)");
    return text;

  } catch (error) {
    console.error("🔥 Gemini Error (primary):", error.message);
    try {
      await delay(1000);

      const retryModel = genAI.getGenerativeModel({
        model: "gemini-flash-latest"
      });

      const retryResult = await retryModel.generateContent(prompt);
      const retryText = retryResult.response.text();

      console.log("🔁 Gemini success (retry)");
      return retryText;

    } catch (retryError) {
      console.error("🔥 Gemini Retry Failed:", retryError.message);
      try {
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-flash-lite-latest"
        });

        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackText = fallbackResult.response.text();

        console.log("🔄 Gemini success (fallback)");
        return fallbackText;

      } catch (fallbackError) {
        console.error("🔥 Gemini Fallback Failed:", fallbackError.message);
        return "⚠️ AI is currently busy. Please try again in a few seconds.";
      }
    }
  }
}