import {translate} from "@vitalets/google-translate-api";

export async function translateText(text, targetLang) {
  try {
    const res = await translate(text, {to: targetLang});
    return res.text;
  } catch (error) {
    console.error("Translation error:", error.message);
    return text; 
  }
}