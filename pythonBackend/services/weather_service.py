import requests
from config import WEATHER_API_KEY

def get_coordinates(village_name: str):
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={village_name}, India"
    response = requests.get(url).json()
    
    if not response:
        return None, None
    
    return response[0]["lat"], response[0]["lon"]

def get_weather(village_name: str):
    lat, lon = get_coordinates(village_name)
    if not lat or not lon:
        return {"error": "Location not found"}

    url = f"http://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": WEATHER_API_KEY, "units": "metric"}
    
    response = requests.get(url, params=params).json()
    
    if "main" not in response:
        return {"error": "Weather data not available"}
    
    temp = response["main"]["temp"]
    desc = response["weather"][0]["description"]
    
    return {
        "location": village_name,
        "temperature": temp,
        "condition": desc
    }