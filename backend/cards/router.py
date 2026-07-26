from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from .models import Createcard, Updatecard, Cardresponce
from backend.cards import service

router = APIRouter(prefix="/api/cards", tags=["cards"])

@router.post("/", response_model=Cardresponce, status_code=201)
async def createcard(card: Createcard):
    result = service.createcard(card)

    return result


@router.get("/", response_model=list[Cardresponce])
async def listcards():
    result = service.getallcards()

    return result

@router.get("/{card_id}", response_model=Cardresponce)
async def getcard(cardid):
    result = service.getcardbyid(cardid)

    if result is None:
        raise HTTPException(status_code=404, detail="card not found")

    return result

@router.put("/{card_id}", response_model=Cardresponce)
async def updatecard(cardid: int, updates: Updatecard):
    result = service.updatecard(cardid, updates)
    if result is None:
        raise HTTPException(status_code=404, detail="card not found")

    return result


@router.delete("/{card_id}")
async def deletecard(cardid: int):
    result = service.deletecard(cardid)

    if result is False:
        raise HTTPException(status_code=404, detail="card not found")

    return {
        "message": "card deleted",
    }
