from pydantic import BaseModel
from typing import Optional


class Createcard(BaseModel):
    profile_name: str
    product_name: str
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    personal_notes: Optional[str] = None
    reminder_times: Optional[str] = None
    ocr_text: Optional[str] = None
    image_path: Optional[str] = None


class Updatecard(BaseModel):
    profile_name: Optional[str] = None
    product_name: Optional[str] = None
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    personal_notes: Optional[str] = None
    reminder_times: Optional[str] = None
    ocr_text: Optional[str] = None
    image_path: Optional[str] = None

class Cardresponce(BaseModel):
    id: int
    profile_name: str
    product_name: str
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    personal_notes: Optional[str] = None
    reminder_times: Optional[str] = None
    ocr_text: Optional[str] = None
    image_path: Optional[str] = None
    created_at: str
    updated_at: str


