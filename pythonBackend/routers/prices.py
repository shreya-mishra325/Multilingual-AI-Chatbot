from fastapi import APIRouter
from services.price_service import get_crop_price

router = APIRouter()

@router.get("/")
def fetch_price(commodity: str, state: str = None, district: str = None):
    return get_crop_price(commodity, state, district)
