import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
dotenv.config();

import soilRoutes from "./routes/soil.js";
import weatherRoutes from "./routes/weather.js";
import priceRoutes from "./routes/price.js";
import chatbotRoutes from "./routes/chatbot.js";
import pestRoutes from "./routes/pest.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🌾Welcome to the Smart Farming Advisory API!");
});

app.use("/soil", soilRoutes);
app.use("/weather", weatherRoutes);
app.use("/price", priceRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/pest", pestRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
