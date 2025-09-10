import requests
from config import PRICE_API_KEY

BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

def get_crop_price(commodity: str, state: str = None, district: str = None):
    params = {
        "api-key": PRICE_API_KEY,
        "format": "json",
        "filters[commodity]": commodity
    }
    if state:
        params["filters[state]"] = state
    if district:
        params["filters[district]"] = district

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    if response.status_code != 200 or "records" not in data:
        return {"error": "Price data not available"}

    return data["records"][:5]
