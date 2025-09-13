from fastapi import APIRouter
from services.gemini_service import get_gemini_advice

router = APIRouter()

@router.get("/")
def get_advice(query: str, language: str = "en"):
    answer = get_gemini_advice(query, language)
    return {"advice": answer}

