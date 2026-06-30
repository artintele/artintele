"""Pydantic request/response schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    company: str = Field("", max_length=160)
    email: EmailStr
    phone: str = Field("", max_length=60)
    intent: str = Field("", max_length=80)
    message: str = Field("", max_length=4000)
    source: str = Field("website", max_length=60)
    # Qualifying details from the contact form.
    website: str = Field("", max_length=300)
    call_volume: str = Field("", max_length=60)
    services: List[str] = Field(default_factory=list)   # checkbox multi-select
    lead_source: str = Field("", max_length=120)


class LeadUpdate(BaseModel):
    """Used by the telecaller dashboard to work a lead."""
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    call_notes: Optional[str] = None
    follow_up_at: Optional[datetime] = None


class LeadOut(BaseModel):
    id: int
    name: str
    company: str
    email: str
    phone: str
    intent: str
    message: str
    source: str
    website: str
    call_volume: str
    services: str
    lead_source: str
    status: str
    assigned_to: str
    call_notes: str
    follow_up_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
