from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from . import service

router = APIRouter()


class Matchrequest(BaseModel):

    filename: str

class Matchresponce(BaseModel):
    matched: bool
    new_ocr_text: Optional[str] = None
    card_id: Optional[int] = None
    product_name: Optional[str] = None
    score: Optional[float] = None
    card: Optional[dict] = None
    message: Optional[str] = None
    best_score: Optional[float] = None
    best_product: Optional[str] = None


@router.post("/api/match", response_model=Matchresponce)
async def matchbottle(matchrequest: Matchrequest):
    try:
        result = service.matchbyimage(matchrequest.filename)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404,
                            detail="image not found")

    except:
        raise HTTPException(status_code=500, detail="server error")




