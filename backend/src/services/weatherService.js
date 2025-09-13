import fetch from "node-fetch";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function getCoordinates(location) {
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${WEATHER_API_KEY}`;
  const res = await fetch(geoUrl);
  const data = await res.json();

  if (!data || data.length === 0) return null;
  return { lat: data[0].lat, lon: data[0].lon };
}

export async function getWeatherAdvisory(location) {
  try {
    const coords = await getCoordinates(location);
    if (!coords) {
      return `❌ Sorry, I couldn’t find "${location}". Please try again with a nearby city or district.`;
    }

    const { lat, lon } = coords;
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    const res = await fetch(weatherUrl);
    const data = await res.json();

    if (data.alerts && data.alerts.length > 0) {
      const alert = data.alerts[0];
      return (
        `⚠️ Weather Alert for ${location}:\n` +
        `${alert.event}\n` +
        `From: ${new Date(alert.start * 1000).toLocaleString()}\n` +
        `To: ${new Date(alert.end * 1000).toLocaleString()}\n` +
        `Advisory: ${alert.description}`
      );
    }

    return `✅ No major weather alerts for ${location} right now. Farming can continue safely.`;
  } catch (error) {
    console.error("Weather service error:", error);
    return "❌ Sorry, I faced an issue while fetching weather advisory. Please try again later.";
  }
}
