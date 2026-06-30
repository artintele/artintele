"""Database models.

Lead              -> contact / demo-booking submissions (the telecaller pipeline)
TalentApplication -> careers "talent network" submissions
"""
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from .database import Base

# Telecaller follow-up pipeline stages.
LEAD_STATUSES = [
    "new",          # just submitted, not yet contacted
    "contacted",    # caller reached out
    "follow_up",    # needs a call back
    "demo_booked",  # demo scheduled
    "won",          # converted
    "lost",         # not interested
]


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    company = Column(String(160), default="")
    email = Column(String(160), nullable=False, index=True)
    phone = Column(String(60), default="")
    intent = Column(String(80), default="")        # what the user picked on the form
    message = Column(Text, default="")
    source = Column(String(60), default="website")  # which page / channel submitted

    # --- qualifying details captured on the contact form ---
    website = Column(String(300), default="")       # prospect's company website
    call_volume = Column(String(60), default="")    # calls per month (range)
    services = Column(Text, default="")             # services of interest (comma-joined)
    lead_source = Column(String(400), default="")   # where their leads come from (comma-joined)

    # --- telecaller / follow-up fields ---
    status = Column(String(40), default="new", index=True)
    assigned_to = Column(String(120), default="")   # which telecaller owns it
    call_notes = Column(Text, default="")           # running follow-up notes
    follow_up_at = Column(DateTime, nullable=True)   # next call back

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def is_demo(self) -> bool:
        return "demo" in (self.intent or "").lower()

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "email": self.email,
            "phone": self.phone,
            "intent": self.intent,
            "message": self.message,
            "source": self.source,
            "website": self.website,
            "call_volume": self.call_volume,
            "services": self.services,
            "lead_source": self.lead_source,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "call_notes": self.call_notes,
            "follow_up_at": self.follow_up_at.isoformat() if self.follow_up_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class TalentApplication(Base):
    __tablename__ = "talent_applications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    email = Column(String(160), nullable=False, index=True)
    linkedin = Column(String(300), default="")
    interest = Column(String(120), default="")
    resume_filename = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "linkedin": self.linkedin,
            "interest": self.interest,
            "resume_filename": self.resume_filename,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
