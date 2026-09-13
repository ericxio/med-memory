from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from backend.usage.models import (
    Logeventrequest, Logeventresponce,
    Usagehistory, Cardusagesummary
)
from backend.usage import service as usageservice
from backend.cards import service as cardsservice

from backend.auth.deps import *;

from backend.database import getconnection

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
async def gethistory(card_id: int, limit: int = 20):
    card = cardsservice.getcardbyid(card_id)
    if not card: raise HTTPException(404, "card does not exist")

    return usageservice.gethistory(card, limit)


@router.get("/api/cards/{card_id}/usage-summary", response_model=Cardusagesummary)
async def getcardusagesummary(card_id: int):
    if not cardsservice.getcardbyid(card_id):
        raise HTTPException(404, "card does not exist")
    return usageservice.usagesummary(card_id)



@router.post("/api/cards/{cardid}/log")
async def logusage(cardid: int, body: Logeventrequest, current_user: dict = Depends(get_current_user)):
    if cardsservice.getcardbyid(cardid, current_user["id"]) is None:
        raise HTTPException(status_code=404, detail="card not found")
    return usageservice.logevent(cardid, body.event_type, body.notes)





from backend.usage.models import UserHistoryItem
from typing import List, Optional

@router.get("/api/history", response_model=List[UserHistoryItem])
async def getuserhistory(limit: int = 100, event_type: Optional[str] = None):
    return usageservice.getuserhistory(limit, event_type)

