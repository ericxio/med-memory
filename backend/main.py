from typing import Union
from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

from upload.router import router as uploadrouter

app.include_router(uploadrouter)





@app.get("/")

def read_root():
    return {"Hello": "World"}



@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


class Item(BaseModel):
    name: str
    price: float
    is_offer: Union[bool, None] = None


@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
