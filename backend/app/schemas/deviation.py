from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, Field, ConfigDict


class DeviationCreate(BaseModel):
    deviation_code: str = Field(..., min_length=3)
    title: str
    description: str

    source_type: Optional[str] = "Manual"
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    process_stage: Optional[str] = None
    severity: Optional[str] = "Medium"


class DeviationResponse(BaseModel):
    id: int
    deviation_code: str
    title: str
    description: str

    source_type: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    process_stage: Optional[str] = None
    severity: Optional[str] = None
    status: str

    extracted_data: Optional[Any] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)