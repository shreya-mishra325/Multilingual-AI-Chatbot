import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function getCoordinates(location) {
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},IN&limit=5&appid=${WEATHER_API_KEY}`;
    const res = await fetch(geoUrl);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return null;
    const indianMatch = data.find(
      (loc) => loc.country === "IN"
    );

    const bestMatch = indianMatch || data[0];

    return {
      lat: bestMatch.lat,
      lon: bestMatch.lon,
      name: bestMatch.name,
      state: bestMatch.state
    };

  } catch {
    return null;
  }
}

async function getWeatherAdvisory(location) {
  try {
    const coords = await getCoordinates(location);
    if (!coords) {
      return `❌ Could not find location "${location}".`;
    }

    const { lat, lon } = coords;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const res = await fetch(weatherUrl);
    const data = await res.json();

    if (data.cod !== 200) {
      return `❌ Weather data not available for ${location}.`;
    }

    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const condition = data.weather[0].main.toLowerCase();

    let advice = "";

    if (condition.includes("rain")) {
      advice = "🌧️ Rain expected. Avoid irrigation and protect crops.";
    } else if (condition.includes("clear")) {
      advice = "☀️ Clear weather. Good for farming activities.";
    } else if (condition.includes("cloud")) {
      advice = "☁️ Cloudy weather. Monitor crops for humidity-related issues.";
    } else if (condition.includes("storm") || condition.includes("thunder")) {
      advice = "⚠️ Storm conditions. Take precautions to protect crops.";
    } else {
      advice = "🌤️ Moderate weather. Continue normal farming.";
    }

    return `📍 ${coords.name}${coords.state ? ", " + coords.state : ""}
    🌡️ Temperature: ${temp}°C
    💧 Humidity: ${humidity}%
    🌬️ Wind: ${wind} m/s

    ${advice}`;

  } catch (error) {
    console.error("Weather service error:", error.message);
    return "❌ Unable to fetch weather data.";
  }
}

export { getWeatherAdvisory };