from pydantic import BaseModel

class Query(BaseModel):
    question: str
    lang: str = "hi"  
