from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from service import *

router = APIRouter()

class ocrrequest(BaseModel):
    def __init__(self, json):

        super().__init__()

        if 'filename' not in json:
            raise HTTPException(422, "no filename")

        self.filename = json['filename']



@router.post("/api/ocr")
async def runocr(request: ocrrequest):
    pass
