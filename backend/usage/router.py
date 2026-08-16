from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.usage.models import (
    Logeventrequest, Logeventresponce,
    Usagehistory, Cardusagesummary
)
from backend.usage import service as usageservice
from backend.cards import service as cardsservice

router = APIRouter()


@router.post("/api/cards/{card_id}/log",
             response_model=Logeventresponce,
             status_code=201)
async def logusageevent(card_id: int, request: Logeventrequest):
    card = cardsservice.getcardbyid(card_id)
    if not card: raise HTTPException(404, "card does not exist")

    try:
        result = usageservice.logevent(
        card_id, request.event_type, request.notes)


    except ValueError as e:
        raise HTTPException(400, str(e))

    return result

@router.get("/api/cards/{card_id}/history",
            response_model=List[Usagehistory])
async def gethistory(cardid: int, limit: int = 20):
    card = cardsservice.getcardbyid(cardid)
    if not card: raise HTTPException(404, "card does not exist")

    return usageservice.gethistory(card, limit)


@router.get("/api/cards/{card_id}/usage-summary",
            response_model=Cardusagesummary)
async def getcardusagesummary(cardid: int):

    card = cardsservice.getcardbyid(cardid)
    if not card: raise HTTPException(404, "card does not exist")

    return {
        "last_taken_at": card.last_taken_at,
        "last_scanned_at": card.last_scanned_at
    }


