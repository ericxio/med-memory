from typing import Union
from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import initdatabase

initdatabase()


app = FastAPI()
from pathlib import Path


from upload.router import router as uploadrouter
from ocr.router import router as ocrrouter

from backend.cards.router import router as cardrouter


from upload.service import uploaddirchecker



uploaddirchecker()

app.include_router(uploadrouter)
app.include_router(ocrrouter)
app.include_router(cardrouter)






@app.get("/")

def read_root():
    return {"Hello": "World"}

uploaddir = Path(__file__).parent.parent / Path("uploads")


app.mount("/uploads", StaticFiles(directory=uploaddir), name="uploads")


app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")

print("loading complete")


