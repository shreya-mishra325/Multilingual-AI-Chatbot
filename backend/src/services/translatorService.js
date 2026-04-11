import { translate } from "@vitalets/google-translate-api";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

let lastCall = 0;

export async function translateText(text, targetLang) {
  if (!text || targetLang === "en") return text;

  const now = Date.now();

  if (now - lastCall < 1000) {
    return text;
  }

  lastCall = now;
  try {
    const res = await translate(text, { to: targetLang });
    return res.text;
  } catch (error) {
    console.error("🌍 Translation error (retrying):", error.message);

    try {
      await delay(800);
      const res = await translate(text, { to: targetLang });
      return res.text;
    } catch (err) {
      console.error("❌ Translation failed completely:", err.message);
      return text;
    }
  }
}