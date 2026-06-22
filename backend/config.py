"""Central configuration, loaded from environment variables (.env).

Nothing here is secret by default — the app runs out of the box for a demo.
Configure SMTP_* to actually deliver email; otherwise mail is logged to the
console and the lead is still stored.
"""
import os
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
# Where booking / lead notifications are sent.
SALES_EMAIL = os.getenv("SALES_EMAIL", "sales@prachalas.com")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "no-reply@artintele.ai")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

EMAIL_CONFIGURED = bool(SMTP_HOST and SMTP_USER and SMTP_PASS)

# --- Telecaller dashboard auth (HTTP Basic) ------------------------------
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "artintele")

# --- App -----------------------------------------------------------------
APP_NAME = "Artintele.ai"
