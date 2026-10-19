from pydantic import BaseModel
from typing import Optional


class Createcard(BaseModel):
    product_name: str
    frequency: int
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    personal_notes: Optional[str] = None
    reminder_times: Optional[str] = None
    ocr_text: Optional[str] = None
    image_path: Optional[str] = None


class Updatecard(BaseModel):
    product_name: Optional[str] = None
    frequency: Optional[int] = None
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    personal_notes: Optional[str] = None
    reminder_times: Optional[str] = None
    ocr_text: Optional[str] = None
    image_path: Optional[str] = None


class Cardresponce(BaseModel):
    id: int
    user_id: int
    product_name: str
    frequency: Optional[int] = None
    strength: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    personal_notes: Optional[str] = None
    reminder_times: Optional[str] = None
    ocr_text: Optional[str] = None
    image_path: Optional[str] = None
    created_at: str
    updated_at: str
