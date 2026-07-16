from typing import Union
from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()
from pathlib import Path


from upload.router import router as uploadrouter



from upload.service import uploaddirchecker

uploaddirchecker()

app.include_router(uploadrouter)





@app.get("/")

def read_root():
    return {"Hello": "World"}

uploaddir = Path(__file__).parent.parent / Path("uploads")


app.mount("/uploads", StaticFiles(directory=uploaddir), name="uploads")


app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")


