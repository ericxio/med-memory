from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from backend.auth import service

oauth2scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2scheme)) -> dict:
    userid = service.decodetoken(token)

    if userid is None:
        raise HTTPException(status_code=401, detail="token invalid or expired")


    user = service.getuserbyid(userid)
    if user is None:
        raise HTTPException(status_code=401, detail="user not found")

    return {"id": user["id"], "email": user["email"], "created_at": user["created_at"]}


