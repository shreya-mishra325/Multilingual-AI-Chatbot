import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function getPestAdvice(userMessage) {
  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Provide pest management advice in 70 words point wise: ${userMessage}`
            }
          ]
        }
      ]
    };

    const response = await axios.post(GEMINI_API_URL, payload);

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error in pestService:", error.message);
    return "Sorry, I am unable to provide pest advice right now.";
  }
}
