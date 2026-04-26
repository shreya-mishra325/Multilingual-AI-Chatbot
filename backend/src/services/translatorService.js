import { translate } from "@vitalets/google-translate-api";

let lastCallTime = 0;

export async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === "en") return text;

  const now = Date.now();

  if (now - lastCallTime < 1500) {
    return text;
  }

  lastCallTime = now;

  try {
    const res = await translate(text, { to: targetLang });
    return res.text;
  } catch (error) {
    console.error("🌍 Translation skipped:", error.message);
    return text;
  }
}