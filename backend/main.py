"""Artintele.ai — full-stack app.

  Public site            ->  /            (Home, Contact, Careers)
  Lead capture API       ->  POST /api/leads
  Talent network API     ->  POST /api/talent
  Telecaller dashboard   ->  /dashboard   (Google SSO, @prachalas.com only)
  Lead pipeline API      ->  /api/admin/* (session-protected)
  DataFrame export       ->  /api/admin/leads/export.csv | .xlsx
"""
import io
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.responses import (
    FileResponse,
    PlainTextResponse,
    RedirectResponse,
    Response,
    StreamingResponse,
)
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from . import config
from .auth import current_user, require_user, router as auth_router
from .database import get_db, init_db
from .emailer import send_lead_notification
from .models import LEAD_STATUSES, Lead, TalentApplication
from .schemas import LeadCreate, LeadOut, LeadUpdate

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("artintele")

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("Artintele.ai started. Email configured: %s", config.EMAIL_CONFIGURED)
    yield


app = FastAPI(title=config.APP_NAME, version="1.0.0", lifespan=lifespan)

# Signed session cookies (carry the Google-authenticated user).
app.add_middleware(
    SessionMiddleware,
    secret_key=config.SESSION_SECRET,
    https_only=config.SESSION_HTTPS_ONLY,
    same_site="lax",
    max_age=config.SESSION_MAX_AGE,
)
app.include_router(auth_router)


# --------------------------------------------------------------------------
# Public API — lead capture (this is what the Contact form hits)
# --------------------------------------------------------------------------
@app.post("/api/leads", response_model=LeadOut, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    """Store a contact / demo-booking request, then notify hello@artintele.ai.

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
        website=payload.website.strip(),
        call_volume=payload.call_volume.strip(),
        services=", ".join(s.strip() for s in payload.services if s.strip()),
        lead_source=payload.lead_source.strip(),
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
    _: dict = Depends(require_user),
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
def lead_stats(_: dict = Depends(require_user), db: Session = Depends(get_db)):
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
    _: dict = Depends(require_user),
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
        "website", "call_volume", "services", "lead_source",
        "source", "message",
    ]
    rows = [{c: l.as_dict().get(c) for c in cols} for l in leads]
    return pd.DataFrame(rows, columns=cols)


@app.get("/api/admin/leads/export.csv")
def export_csv(_: dict = Depends(require_user), db: Session = Depends(get_db)):
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
def export_xlsx(_: dict = Depends(require_user), db: Session = Depends(get_db)):
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
def dashboard(request: Request):
    # Page-level gate: bounce to the Google sign-in page if no session yet.
    if not current_user(request):
        return RedirectResponse(url="/login", status_code=302)
    return FileResponse(FRONTEND_DIR / "dashboard.html")


@app.get("/login")
def login_page(request: Request):
    if current_user(request):
        return RedirectResponse(url="/dashboard", status_code=302)
    return FileResponse(FRONTEND_DIR / "login.html")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "email_configured": config.EMAIL_CONFIGURED,
        "oauth_configured": config.OAUTH_CONFIGURED,
        "login_domain": config.ALLOWED_EMAIL_DOMAIN,
    }


# --------------------------------------------------------------------------
# SEO — robots.txt + sitemap.xml (served before the static mount)
# --------------------------------------------------------------------------
@app.get("/robots.txt", include_in_schema=False)
def robots_txt():
    """Allow crawling of the public site (including AI/answer-engine bots);
    keep the CRM/API out of search for every crawler."""
    rules = (
        "Allow: /\n"
        "Disallow: /dashboard\n"
        "Disallow: /login\n"
        "Disallow: /api/\n"
        "Disallow: /auth/\n"
    )
    # AI / answer-engine crawlers explicitly welcomed (same CRM/API exclusions).
    ai_bots = [
        "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai",
        "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot",
    ]
    body = f"User-agent: *\n{rules}"
    for bot in ai_bots:
        body += f"\nUser-agent: {bot}\n{rules}"
    body += f"\nSitemap: {config.SITE_URL}/sitemap.xml\n"
    return PlainTextResponse(body)


@app.get("/llms.txt", include_in_schema=False)
def llms_txt():
    """Agent-readable summary of the company + services (llms.txt convention)."""
    u = config.SITE_URL
    body = f"""# Artintele.ai

> Artintele.ai is an AI automation company (a brand of Prachalas Pvt Ltd) that builds custom AI agents, voice assistants, chatbots, AI telecallers and workflow automation for businesses across India. Solutions are built around each client's existing processes and deployed end to end. AI voice agents operate 24/7 and support multiple languages, including English, Hindi, Kannada, Tamil, Telugu and Malayalam.

Artintele.ai designs, builds and deploys AI agents and automation. Engagements run end to end: discovery, workflow analysis, solution design, development, deployment, optimization and maintenance. The company serves businesses across India and works across healthcare, education, real estate, manufacturing, finance and retail.

## Core Pages

- [Home]({u}/): Overview of Artintele.ai's AI agents, voice assistants and automation services.
- [Services]({u}/md/services.md): Full list of services — AI voice agents, telecallers, receptionists, chatbots, workflow automation and more.
- [Industries]({u}/md/industries.md): Sectors served and example automations for each.
- [Process]({u}/md/process.md): The seven-step delivery process from discovery to maintenance.
- [FAQ]({u}/md/faq.md): Answers to common questions about AI telecallers, languages, WhatsApp automation and deployment timelines.
- [Pricing]({u}/pricing): Pricing and packages.
- [Contact]({u}/contact): Book a free consultation.
- [Careers]({u}/careers): Open roles.

## Services

- AI Voice Agents — human-like agents handle inbound and outbound calls 24/7.
- AI Telecaller — automated calling that qualifies leads and books appointments.
- AI Receptionists — an always-on front desk that greets, routes and books.
- Workflow Automation — business process automation that runs repetitive steps end to end.
- AI Chatbot Development — chatbots on website and WhatsApp that qualify and convert.
- Knowledge Assistants — turn documents and SOPs into an assistant your team can ask.
- AI Consulting — mapping where AI pays off fastest and building the roadmap.
- Custom AI Software Development — bespoke AI agents and integrations.
- Custom AI Voices — branded voices in any regional language customers speak.
- WhatsApp Automation — compliant journeys on the official WhatsApp Business Platform.
- CRM Tools — custom CRM setups and integrations that capture every lead.
- Website Development & SEO — sites engineered for SEO, AEO, GEO and GAIO.
- Social Media Handling — content, scheduling and engagement.

## Optional

- [Full site as markdown]({u}/md/): Clean markdown mirrors of all key pages.
"""
    return PlainTextResponse(body)


@app.get("/sitemap.xml", include_in_schema=False)
def sitemap_xml():
    """List the indexable public pages with the canonical production domain."""
    today = f"{datetime.utcnow():%Y-%m-%d}"
    pages = [
        ("/", "1.0", "weekly"),
        ("/pricing", "0.8", "monthly"),
        ("/contact", "0.9", "monthly"),
        ("/careers", "0.7", "monthly"),
    ]
    urls = "".join(
        f"<url><loc>{config.SITE_URL}{path}</loc>"
        f"<lastmod>{today}</lastmod>"
        f"<changefreq>{freq}</changefreq>"
        f"<priority>{prio}</priority></url>"
        for path, prio, freq in pages
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f"{urls}</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


# --------------------------------------------------------------------------
# Markdown mirror — /md/ (clean plain-text pages for AI answer engines)
# Served with an explicit text/markdown content type; the whitelist keeps the
# route from serving anything outside the mirror.
# --------------------------------------------------------------------------
MD_DIR = FRONTEND_DIR / "md"
_MD_PAGES = {"home", "services", "industries", "process", "faq"}
_MD_TYPE = "text/markdown; charset=utf-8"


@app.get("/md", include_in_schema=False)
@app.get("/md/", include_in_schema=False)
def md_index():
    return FileResponse(MD_DIR / "index.md", media_type=_MD_TYPE)


@app.get("/md/{page}.md", include_in_schema=False)
def md_page(page: str):
    if page not in _MD_PAGES:
        raise HTTPException(status_code=404)
    return FileResponse(MD_DIR / f"{page}.md", media_type=_MD_TYPE)


# --------------------------------------------------------------------------
# Static frontend (mounted last so /api/* and /dashboard win)
# --------------------------------------------------------------------------
@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


# --- Clean URLs -----------------------------------------------------------
# Serve the public pages at extensionless paths (/contact, not /contact.html).
# StaticFiles(html=True) only maps directories -> index.html, so we route the
# pretty paths explicitly and 301 the old .html paths onto them (one canonical
# URL per page = no duplicate content for SEO, and old links keep working).
@app.get("/contact", include_in_schema=False)
def contact_page():
    return FileResponse(FRONTEND_DIR / "contact.html")


@app.get("/pricing", include_in_schema=False)
def pricing_page():
    return FileResponse(FRONTEND_DIR / "pricing.html")


@app.get("/careers", include_in_schema=False)
def careers_page():
    return FileResponse(FRONTEND_DIR / "careers.html")


@app.get("/contact.html", include_in_schema=False)
def contact_html():
    return RedirectResponse("/contact", status_code=301)


@app.get("/pricing.html", include_in_schema=False)
def pricing_html():
    return RedirectResponse("/pricing", status_code=301)


@app.get("/careers.html", include_in_schema=False)
def careers_html():
    return RedirectResponse("/careers", status_code=301)


@app.get("/index.html", include_in_schema=False)
def index_html():
    return RedirectResponse("/", status_code=301)


app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
