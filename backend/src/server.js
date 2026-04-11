import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
dotenv.config({
  path: path.resolve("../.env")
});

const app = express();

import soilRoutes from "./routes/soil.js";
import weatherRoutes from "./routes/weather.js";
import priceRoutes from "./routes/price.js";
import chatbotRoutes from "./routes/chatbot.js";
import pestRoutes from "./routes/pest.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://multilingual-ai-chatbot-gigu.vercel.app"
];

app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.get("/", (req, res) => {
  res.send("🌾 Welcome to the Smart Farming Advisory API!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/models", async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    console.error("🔥 FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});

app.use("/soil", soilRoutes);
app.use("/weather", weatherRoutes);
app.use("/price", priceRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/pest", pestRoutes);

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
