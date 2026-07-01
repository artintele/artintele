"""Central configuration, loaded from environment variables (.env).

Nothing here is secret by default — the app runs out of the box for a demo.
Configure SMTP_* to actually deliver email; otherwise mail is logged to the
console and the lead is still stored.
"""
import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Storage -------------------------------------------------------------
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'artintele.db'}")

UPLOAD_DIR = BASE_DIR / "frontend" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- Email ---------------------------------------------------------------
# Every new lead notifies marketing (and is stored in the CRM). Marketing is
# the primary inbox; sales is optional (blank until the company is registered).
MARKETING_EMAIL = os.getenv("MARKETING_EMAIL", "marketing@artintele.ai")
SALES_EMAIL = os.getenv("SALES_EMAIL", "")
# Optional extra recipients, comma-separated.
_EXTRA_NOTIFY = os.getenv("LEAD_NOTIFY_EMAILS", "")
LEAD_NOTIFY_EMAILS = list(dict.fromkeys(
    e.strip() for e in ([MARKETING_EMAIL, SALES_EMAIL] + _EXTRA_NOTIFY.split(","))
    if e and e.strip()
))
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "no-reply@artintele.ai")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

EMAIL_CONFIGURED = bool(SMTP_HOST and SMTP_USER and SMTP_PASS)

# --- Telecaller dashboard auth: Google Workspace SSO ---------------------
# Only Google accounts on this email domain may sign in. Enforced server-side
# (not just the Google `hd` hint).
ALLOWED_EMAIL_DOMAIN = os.getenv("ALLOWED_EMAIL_DOMAIN", "prachalas.com")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
OAUTH_CONFIGURED = bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)

# Explicit public origin used to build the OAuth redirect URI (e.g.
# https://artintele.up.railway.app). Falls back to the request URL when unset.
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")

# Canonical public site origin, used for SEO (robots.txt, sitemap.xml, canonical
# URLs). Defaults to the production domain; override via PUBLIC_BASE_URL.
SITE_URL = (PUBLIC_BASE_URL or "https://artintele.ai").rstrip("/")

# Session signing + cookie hardening.
SESSION_SECRET = os.getenv("SESSION_SECRET", secrets.token_urlsafe(48))
SESSION_HTTPS_ONLY = os.getenv("SESSION_HTTPS_ONLY", "false").lower() == "true"
SESSION_MAX_AGE = int(os.getenv("SESSION_MAX_AGE", str(60 * 60 * 8)))  # 8h

# Dev-only: when true, /auth/dev-login grants a session WITHOUT Google.
# MUST stay false in production. Defaults off.
DASHBOARD_DEV_BYPASS = os.getenv("DASHBOARD_DEV_BYPASS", "false").lower() == "true"

# --- App -----------------------------------------------------------------
APP_NAME = "Artintele.ai"
