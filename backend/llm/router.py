from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from . import service

router = APIRouter()


class Structurelabelrequest(BaseModel):
    ocr_text:str

class Structurelabelresponce(BaseModel):
    product_name: Optional[str] = None
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    simple_explanation: Optional[str] = None

@router.post("/api/structure-label", response_model=Structurelabelresponce)
async def structurelabel(request: Structurelabelrequest):
    #result = None

    try:
        result = service.cleanresult(service.processtext(request.ocr_text))
    except ValueError:
        raise HTTPException(503, detail="no api key set up")

    except ConnectionError:
        raise HTTPException(502, detail="llm server error")

    except Exception:
        raise HTTPException(502, detail="process failed")



    return result


