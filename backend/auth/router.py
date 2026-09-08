from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from backend.auth import service
from backend.auth.models import Registerrequest, Tokenresponce, Userresponce
from backend.auth.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=Tokenresponce, status_code=201)
async def register(body: Registerrequest):
    user = service.createuser(body.email, body.password)
    if user is None:
        raise HTTPException(status_code=400, detail="email already registered")
    return Tokenresponce(access_token=service.createtoken(user["id"]))

@router.post("/login", response_model=Tokenresponce, status_code=200)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = service.getuserbyemail(form.username)
    if user is None or not service.verifypassword(form.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="incorrect email or password")
    return Tokenresponce(access_token=service.createtoken(user["id"]))

@router.get("/me", response_model=Userresponce, status_code=200)
async def me(current_user: dict = Depends(get_current_user)):
    return Userresponce(**current_user)