from pydantic import BaseModel
from typing import Optional


class Logeventrequest(BaseModel):
    event_type: str
    notes: Optional[str] = None


class Logeventresponce(BaseModel):
    id: int
    card_id: int
    event_type: str
    timestamp: str
    notes: Optional[str] = None


class Usagehistory(BaseModel):
    id: int
    event_type: str
    timestamp: str
    notes: Optional[str] = None


class Cardusagesummary(BaseModel):
    last_taken_at: Optional[str] = None
    last_scanned_at: Optional[str] = None
