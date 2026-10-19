from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from backend.usage.models import (
    Logeventrequest, Logeventresponce,
    Usagehistory, Cardusagesummary, UserHistoryItem
)
from backend.usage import service as usageservice
from backend.cards import service as cardsservice
from backend.auth.deps import get_current_user

router = APIRouter()


def _own_card_or_404(card_id: int, user_id: int):
    if cardsservice.getcardbyid(card_id, user_id) is None:
        raise HTTPException(404, "card does not exist")


@router.post("/api/cards/{card_id}/log",
             response_model=Logeventresponce,
             status_code=201)
async def logusageevent(card_id: int, request: Logeventrequest,
                        current_user: dict = Depends(get_current_user)):
    _own_card_or_404(card_id, current_user["id"])
    try:
        return usageservice.logevent(card_id, request.event_type, request.notes)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/api/cards/{card_id}/history",
            response_model=List[Usagehistory])
async def gethistory(card_id: int, limit: int = 20,
                     current_user: dict = Depends(get_current_user)):
    _own_card_or_404(card_id, current_user["id"])
    return usageservice.gethistory(card_id, limit)


@router.get("/api/cards/{card_id}/usage-summary",
            response_model=Cardusagesummary)
async def getcardusagesummary(card_id: int,
                              current_user: dict = Depends(get_current_user)):
    _own_card_or_404(card_id, current_user["id"])
    return usageservice.usagesummary(card_id)


@router.get("/api/history", response_model=List[UserHistoryItem])
async def getuserhistory(limit: int = 100, event_type: Optional[str] = None,
                         current_user: dict = Depends(get_current_user)):
    return usageservice.getuserhistory(current_user["id"], limit, event_type)
