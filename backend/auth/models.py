from pydantic import BaseModel, EmailStr, Field

class Registerrequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length = 8)

class Tokenresponce(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Userresponce(BaseModel):
    id: int
    email: str
    created_at: str = Field(min_length = 8)