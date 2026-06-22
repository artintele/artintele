"""Pydantic request/response schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    company: str = Field("", max_length=160)
    email: EmailStr
    phone: str = Field("", max_length=60)
    intent: str = Field("", max_length=80)
    message: str = Field("", max_length=4000)
    source: str = Field("website", max_length=60)


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
    status: str
    assigned_to: str
    call_notes: str
    follow_up_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
