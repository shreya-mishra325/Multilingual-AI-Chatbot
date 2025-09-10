from fastapi import APIRouter
from services.weather_service import get_weather

router = APIRouter()

@router.get("/")
def fetch_weather(city: str, lang: str = "en"):
    return get_weather(city, lang)

