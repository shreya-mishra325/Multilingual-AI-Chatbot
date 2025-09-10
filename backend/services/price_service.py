import requests
from config import PRICE_API_KEY

BASE_URL = "https://api.data.gov.in/resource/${PRICE_API_KEY}"

def get_crop_price(commodity: str, state: str = None, district: str = None):
    params = {
        "api-key": PRICE_API_KEY,
        "format": "json",
        "filters[commodity]": commodity.title()
    }
    if state:
        params["filters[state]"] = state.title()
    if district:
        params["filters[district]"] = district.title()

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        data = response.json()

        if response.status_code != 200 or "records" not in data:
            return f"Sorry, I couldn’t fetch mandi prices for {commodity} right now."

        records = data["records"]

        if district and not records and state:
            params.pop("filters[district]", None)
            fallback_response = requests.get(BASE_URL, params=params, timeout=10).json()
            fallback_records = fallback_response.get("records", [])

            if not fallback_records:
                return f"Sorry, I couldn’t find any prices for {commodity} in {state}."

            r = fallback_records[0]
            return (
                f"No prices were available today for {commodity} in {district}, "
                f"but here’s data from {r.get('market', '')}, {r.get('district', '')}, {r.get('state', '')} "
                f"(on {r.get('arrival_date', '')}): "
                f"minimum ₹{r.get('min_price', '')}/quintal, maximum ₹{r.get('max_price', '')}/quintal, "
                f"and average around ₹{r.get('modal_price', '')}/quintal."
            )

        if not records:
            return f"Sorry, no prices available for {commodity} in {district or state or 'your area'}."

        r = records[0]
        return (
            f"The prices for {commodity} in {r.get('market', '')}, {r.get('district', '')}, {r.get('state', '')} "
            f"(on {r.get('arrival_date', '')}) are: "
            f"minimum ₹{r.get('min_price', '')}/quintal, maximum ₹{r.get('max_price', '')}/quintal, "
            f"and the average is around ₹{r.get('modal_price', '')}/quintal."
        )

    except Exception:
        return "Hmm, I wasn’t able to fetch the mandi prices right now. Please try again later."