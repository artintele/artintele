# Artintele.ai — AI Solutions & Automation

Full-stack site + lead pipeline for **artintele.ai**. When a visitor books a
demo or sends a contact request, the lead is **stored in the database** and a
notification is **emailed to `sales@prachalas.com`**. The sales team works those
leads from a built-in **telecaller CRM**, and can export the whole pipeline as a
**pandas DataFrame** (CSV / Excel) for follow-up calling.

## What's inside

| Part | Tech | Path |
|------|------|------|
| Marketing site (Home / Contact / Careers) | Standalone HTML/CSS/JS | `frontend/` |
| API + server | FastAPI | `backend/` |
| Database | SQLite via SQLAlchemy | `data/artintele.db` |
| Email notifications | SMTP (`smtplib`) | `backend/emailer.py` |
| Telecaller CRM dashboard | HTML + FastAPI (Google SSO, `@prachalas.com` only) | `frontend/dashboard.html` |
| Lead export ("the df") | pandas → CSV / XLSX | `/api/admin/leads/export.*` |

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Then open:

- **Website** → http://localhost:8000
- **Book-a-demo form** → http://localhost:8000/contact.html
- **Telecaller CRM** → http://localhost:8000/dashboard

The dashboard is protected by **Google Workspace SSO, restricted to
`@prachalas.com` accounts**. Locally, set `DASHBOARD_DEV_BYPASS=true` in `.env`
to open it without Google (the `.env` shipped for dev already does this). In
production you configure a Google OAuth client — see [DEPLOY.md](DEPLOY.md).

## How a demo booking flows

1. Visitor fills the form on `/contact.html` and submits.
2. `POST /api/leads` validates and **stores the lead** in SQLite. If the intent
   contains "demo", the lead is auto-tagged `demo_booked`.
3. A notification is **emailed to `sales@prachalas.com`** (high-priority subject
   for demos). Email never blocks the save — if SMTP isn't configured the
   message is logged instead and the lead is still recorded.
4. The lead appears in the **telecaller CRM** for follow-up calling — set status,
   assign a caller, add call notes, schedule the next call-back.
5. Sales exports the pipeline as CSV/Excel anytime for offline calling lists.

## Configuration

Everything works out of the box for a local demo. To actually send email and
change the dashboard login, copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833)
and set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`.

## API reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/leads` | — | Create a lead (contact / demo booking) + email sales |
| `POST` | `/api/talent` | — | Careers talent-network submission (+ resume upload) |
| `GET`  | `/auth/login` → `/auth/callback` | — | Google SSO sign-in |
| `GET`  | `/auth/logout` | — | Clear session |
| `GET`  | `/api/me` | Session | Current signed-in user |
| `GET`  | `/api/admin/leads` | Session | List / filter / search leads |
| `GET`  | `/api/admin/stats` | Session | Pipeline counts by status |
| `PATCH`| `/api/admin/leads/{id}` | Session | Update status / assignee / notes / follow-up |
| `GET`  | `/api/admin/leads/export.csv` | Session | Download leads as CSV |
| `GET`  | `/api/admin/leads/export.xlsx` | Session | Download leads as Excel |
| `GET`  | `/api/health` | — | Health check |

**Deployment:** see [DEPLOY.md](DEPLOY.md) for Railway / Fly.io + the Google
OAuth client setup.

## Testing

A pytest suite covers the full lead pipeline — storage, the demo-booking email
to `sales@prachalas.com`, validation, dashboard auth, telecaller updates, and
the CSV/XLSX exports. Tests run against a throwaway SQLite database and capture
email in-memory, so they never touch real data or send mail.

```bash
pip install -r requirements-dev.txt
pytest
```

```
tests/
  test_leads.py   # POST /api/leads: demo tagging, email-to-sales, validation
  test_admin.py   # session gate, stats, status updates, filters, CSV/XLSX, logout
  test_auth.py    # @prachalas.com domain restriction (incl. spoof attempts)
  test_talent.py  # careers form + resume upload
  test_email.py   # email subject/recipient + no-SMTP fallback (never raises)
```

38 tests, all passing.

## Notes

- The original design was authored in a proprietary preview runtime
  (DesignCombo `.dc.html` + React). It has been rebuilt here as framework-free
  HTML/CSS/JS so it runs anywhere, with the canvas animations, theming, and live
  demos preserved.
- `data/artintele.db` and uploaded resumes are git-ignored.
