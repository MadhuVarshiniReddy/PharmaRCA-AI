from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class CauseCreate(BaseModel):
    category: Optional[str] = None
    cause_description: str
    supporting_evidence: Optional[str] = None
    confidence: Optional[str] = None
    is_confirmed: bool = False


class RCAAnalysisCreate(BaseModel):
    deviation_id: int
    method: str = "5 Whys"
    problem_statement: Optional[str] = None


class RCAAnalysisResponse(BaseModel):
    id: int
    deviation_id: int
    method: str
    problem_statement: Optional[str] = None
    ai_summary: Optional[str] = None
    findings: Optional[Any] = None
    missing_evidence: Optional[Any] = None
    review_status: str

    model_config = ConfigDict(from_attributes=True)