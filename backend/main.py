"""Artintele.ai — full-stack app.

  Public site            ->  /            (Home, Contact, Careers)
  Lead capture API       ->  POST /api/leads
  Talent network API     ->  POST /api/talent
  Telecaller dashboard   ->  /dashboard   (HTTP Basic auth)
  Lead pipeline API      ->  /api/admin/* (HTTP Basic auth)
  DataFrame export       ->  /api/admin/leads/export.csv | .xlsx
"""
import io
import logging
import secrets
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import (
    FileResponse,
    JSONResponse,
    StreamingResponse,
)
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import config
from .database import get_db, init_db
from .emailer import send_lead_notification
from .models import LEAD_STATUSES, Lead, TalentApplication
from .schemas import LeadCreate, LeadOut, LeadUpdate

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("artintele")

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(title=config.APP_NAME, version="1.0.0")


@app.on_event("startup")
def _startup():
    init_db()
    log.info("Artintele.ai started. Email configured: %s", config.EMAIL_CONFIGURED)


# --------------------------------------------------------------------------
# Telecaller dashboard auth (HTTP Basic)
# --------------------------------------------------------------------------
security = HTTPBasic()


def require_admin(creds: HTTPBasicCredentials = Depends(security)) -> str:
    ok_user = secrets.compare_digest(creds.username, config.ADMIN_USER)
    ok_pass = secrets.compare_digest(creds.password, config.ADMIN_PASS)
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return creds.username


# --------------------------------------------------------------------------
# Public API — lead capture (this is what the Contact form hits)
# --------------------------------------------------------------------------
@app.post("/api/leads", response_model=LeadOut, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    """Store a contact / demo-booking request, then notify sales@prachalas.com.

    The lead is stored in the database (the follow-up DataFrame) *first*; email
    is best-effort and never blocks the save.
    """
    lead = Lead(
        name=payload.name.strip(),
        company=payload.company.strip(),
        email=str(payload.email).strip(),
        phone=payload.phone.strip(),
        intent=payload.intent.strip(),
        message=payload.message.strip(),
        source=payload.source.strip() or "website",
        status="demo_booked" if "demo" in payload.intent.lower() else "new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    emailed = send_lead_notification(lead)
    log.info("Lead #%s stored (%s). Emailed sales: %s", lead.id, lead.intent, emailed)
    return lead


@app.post("/api/talent", status_code=201)
async def create_talent(
    name: str = Form(...),
    email: str = Form(...),
    linkedin: str = Form(""),
    interest: str = Form(""),
    resume: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Careers 'talent network' submission with optional resume upload."""
    resume_filename = ""
    if resume is not None and resume.filename:
        safe = f"{datetime.utcnow():%Y%m%d%H%M%S}_{Path(resume.filename).name}"
        dest = config.UPLOAD_DIR / safe
        with open(dest, "wb") as fh:
            fh.write(await resume.read())
        resume_filename = safe

    app_row = TalentApplication(
        name=name.strip(),
        email=email.strip(),
        linkedin=linkedin.strip(),
        interest=interest.strip(),
        resume_filename=resume_filename,
    )
    db.add(app_row)
    db.commit()
    db.refresh(app_row)
    log.info("Talent application #%s stored (%s)", app_row.id, interest)
    return {"ok": True, "id": app_row.id}


# --------------------------------------------------------------------------
# Telecaller dashboard API (protected)
# --------------------------------------------------------------------------
@app.get("/api/admin/leads")
def list_leads(
    status_filter: str | None = None,
    q: str | None = None,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    stmt = select(Lead).order_by(Lead.created_at.desc())
    if status_filter and status_filter != "all":
        stmt = stmt.where(Lead.status == status_filter)
    leads = db.scalars(stmt).all()
    if q:
        ql = q.lower()
        leads = [
            l for l in leads
            if ql in (l.name or "").lower()
            or ql in (l.email or "").lower()
            or ql in (l.company or "").lower()
            or ql in (l.phone or "").lower()
        ]
    return {
        "statuses": LEAD_STATUSES,
        "count": len(leads),
        "leads": [l.as_dict() for l in leads],
    }


@app.get("/api/admin/stats")
def lead_stats(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    leads = db.scalars(select(Lead)).all()
    by_status = {s: 0 for s in LEAD_STATUSES}
    for l in leads:
        by_status[l.status] = by_status.get(l.status, 0) + 1
    return {
        "total": len(leads),
        "by_status": by_status,
        "demos": sum(1 for l in leads if l.is_demo),
    }


@app.patch("/api/admin/leads/{lead_id}", response_model=LeadOut)
def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in LEAD_STATUSES:
        raise HTTPException(422, f"status must be one of {LEAD_STATUSES}")
    for field, value in data.items():
        setattr(lead, field, value)
    db.commit()
    db.refresh(lead)
    return lead


def _leads_dataframe(db: Session) -> pd.DataFrame:
    """The follow-up 'df' — every lead as a pandas DataFrame for calling lists."""
    leads = db.scalars(select(Lead).order_by(Lead.created_at.desc())).all()
    cols = [
        "id", "created_at", "name", "company", "email", "phone",
        "intent", "status", "assigned_to", "follow_up_at", "call_notes",
        "source", "message",
    ]
    rows = [{c: l.as_dict().get(c) for c in cols} for l in leads]
    return pd.DataFrame(rows, columns=cols)


@app.get("/api/admin/leads/export.csv")
def export_csv(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    df = _leads_dataframe(db)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    fname = f"artintele_leads_{datetime.utcnow():%Y%m%d}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@app.get("/api/admin/leads/export.xlsx")
def export_xlsx(_: str = Depends(require_admin), db: Session = Depends(get_db)):
    df = _leads_dataframe(db)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Leads")
    buf.seek(0)
    fname = f"artintele_leads_{datetime.utcnow():%Y%m%d}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@app.get("/dashboard")
def dashboard(_: str = Depends(require_admin)):
    return FileResponse(FRONTEND_DIR / "dashboard.html")


@app.get("/api/health")
def health():
    return {"status": "ok", "email_configured": config.EMAIL_CONFIGURED}


# --------------------------------------------------------------------------
# Static frontend (mounted last so /api/* and /dashboard win)
# --------------------------------------------------------------------------
@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
