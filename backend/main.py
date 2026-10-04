from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles

from backend.database import initdatabase

initdatabase()


app = FastAPI()
from pathlib import Path


from backend.upload.router import router as uploadrouter
from backend.ocr.router import router as ocrrouter

from backend.cards.router import router as cardrouter


from backend.upload.service import uploaddirchecker

from backend.llm.router import router as llmrouter
from backend.matching.router import router as matchingrouter
from backend.usage.router import router as usage_router

from backend.auth.router import router as authrouter



uploaddirchecker()

app.include_router(uploadrouter)
app.include_router(ocrrouter)
app.include_router(cardrouter)
app.include_router(llmrouter)
app.include_router(matchingrouter)
app.include_router(usage_router)



app.include_router(authrouter)



@app.get("/")

def read_root():
    return {"Hello": "World"}

uploaddir = Path(__file__).parent.parent / Path("uploads")


app.mount("/uploads", StaticFiles(directory=uploaddir), name="uploads")


frontenddir = Path(__file__).parent.parent / Path("frontend")

app.mount("/", StaticFiles(directory=frontenddir, html=True), name="static")

print("loading complete")
