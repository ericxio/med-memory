from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from pathlib import Path

from . import service

router = APIRouter()

uploaddir = Path(__file__).parent.parent.parent / Path("uploads")



class Ocrrequest(BaseModel):

    filename: str
    # def __init__(self, json):
    #
    #     super().__init__()
    #
    #     if 'filename' not in json:
    #         raise HTTPException(422, "no filename")
    #
    #     self.filename = json['filename']



@router.post("/api/ocr")
async def runocr(request: Ocrrequest):

    filename = request.filename

    filepath = uploaddir / filename

    try:
        data = service.lowconfidencefilterer(service.textextracter(str(filepath)))

    except FileNotFoundError:
        raise HTTPException(404, "file " + str(filepath) + " not found")

    except Exception as e:
        raise HTTPException(500, "ocr failed: " + str(e))



    text = ""
    lines = 0
    totalconfidence = 0

    for i in data:
        text += i['text'] + "\n"
        lines += 1
        totalconfidence += i['confidence']

    if len(text) > 0: text = text[:len(text)-1]



    result = {
        'fileid': filename,
        'text': text,
        'lines': lines,
        'confidence': totalconfidence / lines,
    }

    return result
