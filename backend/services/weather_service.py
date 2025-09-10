import requests
from config import WEATHER_API_KEY

BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather(city: str, lang: str = "en"):
    params = {
        "q": city,
        "appid": WEATHER_API_KEY,
        "units": "metric",
        "lang": lang
    }
    response = requests.get(BASE_URL, params=params)
    data = response.json()

    if response.status_code != 200:
        return {"error": data.get("message", "Weather data not available")}

    return {
        "city": data["name"],
        "temperature": data["main"]["temp"],
        "condition": data["weather"][0]["description"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"]
    }
