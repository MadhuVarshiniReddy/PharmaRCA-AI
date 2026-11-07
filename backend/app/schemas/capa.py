
from datetime import date
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict


CAPAStatus = Literal[
    "Proposed",
    "Approved",
    "In Progress",
    "Completed"
]


class CAPACreate(BaseModel):
    analysis_id: int
    action_type: str
    description: str
    rationale: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    status: CAPAStatus = "Proposed"
    effectiveness_check: Optional[str] = None


class CAPAResponse(BaseModel):
    id: int
    analysis_id: int
    action_type: Optional[str] = None
    description: str
    rationale: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    status: CAPAStatus
    effectiveness_check: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
