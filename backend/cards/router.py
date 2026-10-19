from fastapi import APIRouter, HTTPException, Depends
from .models import Createcard, Updatecard, Cardresponce
from backend.cards import service
from backend.auth.deps import get_current_user

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.get("/", response_model=list[Cardresponce])
async def listcards(current_user: dict = Depends(get_current_user)):
    return service.getallcards(current_user["id"])


@router.post("/", response_model=Cardresponce, status_code=201)
async def createcard(card: Createcard, current_user: dict = Depends(get_current_user)):
    return service.createcard(current_user["id"], card)


@router.get("/{cardid}", response_model=Cardresponce)
async def getcard(cardid: int, current_user: dict = Depends(get_current_user)):
    result = service.getcardbyid(cardid, current_user["id"])
    if result is None:
        raise HTTPException(status_code=404, detail="card not found")
    return result


@router.put("/{cardid}", response_model=Cardresponce)
async def updatecard(cardid: int, updates: Updatecard, current_user: dict = Depends(get_current_user)):
    result = service.updatecard(cardid, current_user["id"], updates)
    if result is None:
        raise HTTPException(status_code=404, detail="card not found")
    return result


@router.delete("/{cardid}")
async def deletecard(cardid: int, current_user: dict = Depends(get_current_user)):
    # verify ownership before removing the card and its usage history
    if service.getcardbyid(cardid, current_user["id"]) is None:
        raise HTTPException(status_code=404, detail="card not found")

    from backend.usage.service import deletehistory
    deletehistory(cardid)
    service.deletecard(cardid, current_user["id"])

    return {"message": "card deleted"}
