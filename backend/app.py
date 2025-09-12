from fastapi import FastAPI
from routers import advice, weather, prices

app = FastAPI(title="Farmer Advisory Chatbot")

app.include_router(advice.router, prefix="/advice", tags=["Advice"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(prices.router, prefix="/prices", tags=["Market Prices"])

@app.get("/")
def root():
    return {"msg": "Farmer Advisory Chatbot API running!"}
