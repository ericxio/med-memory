from typing import Union
from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

from upload.router import router as uploadrouter



from upload.service import uploaddirchecker

uploaddirchecker()

app.include_router(uploadrouter)





@app.get("/")

def read_root():
    return {"Hello": "World"}





app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
