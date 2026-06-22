# Deploying Artintele.ai (for the founder demo)

Two parts: **(1)** create a Google OAuth client so the `@prachalas.com`-only
dashboard login works, **(2)** deploy the container to Railway or Fly.io.

There's a small chicken-and-egg: the OAuth client needs your final URL, and the
app needs the OAuth client. So: deploy once to learn your URL, then set the
OAuth + secrets, then redeploy.

---

## 1. Google OAuth client (dashboard login)

You need a Google Cloud project on the **prachalas.com** Workspace (or any
project — the domain lock is enforced by the app, not the project).

1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. Configure the **OAuth consent screen**: User type **Internal** (this alone
   restricts to your Workspace), app name "Artintele CRM".
3. **Create Credentials → OAuth client ID → Web application**.
4. **Authorized redirect URIs** — add `https://YOUR-URL/auth/callback`
   (e.g. `https://artintele.up.railway.app/auth/callback`). You can add the
   final URL after the first deploy.
5. Copy the **Client ID** and **Client secret**.

You'll set these as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` below.

---

## 2A. Deploy to Railway

```bash
npm i -g @railway/cli      # or: brew install railwayapp/railway/railway
railway login
railway init                # create a new project
railway up                  # builds the Dockerfile and deploys
```

Then set environment variables (Railway dashboard → Variables, or CLI):

```bash
railway variables set \
  ALLOWED_EMAIL_DOMAIN=prachalas.com \
  SESSION_HTTPS_ONLY=true \
  SESSION_SECRET="$(python -c 'import secrets;print(secrets.token_urlsafe(48))')" \
  GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com \
  GOOGLE_CLIENT_SECRET=xxxx \
  PUBLIC_BASE_URL=https://YOUR-RAILWAY-URL \
  SALES_EMAIL=sales@prachalas.com \
  SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USE_TLS=true \
  SMTP_USER=devteam@artintele.ai SMTP_FROM=devteam@artintele.ai \
  SMTP_PASS=your-gmail-app-password
```

Railway generates a domain under **Settings → Networking → Generate Domain**.
Put that URL in `PUBLIC_BASE_URL` *and* in the Google redirect URI, then redeploy.

> Note: Railway's container filesystem is ephemeral. For a founder demo that's
> fine. To persist leads across redeploys, add a Railway **Volume** mounted at
> `/app/data`, or attach a Postgres plugin and set `DATABASE_URL`.

## 2B. Deploy to Fly.io

```bash
brew install flyctl
fly auth login
fly apps create artintele                  # or edit `app` in fly.toml
fly volumes create artintele_data --size 1 # persists the SQLite DB
fly secrets set \
  SESSION_SECRET="$(python -c 'import secrets;print(secrets.token_urlsafe(48))')" \
  GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com \
  GOOGLE_CLIENT_SECRET=xxxx \
  PUBLIC_BASE_URL=https://artintele.fly.dev \
  SMTP_USER=devteam@artintele.ai SMTP_FROM=devteam@artintele.ai \
  SMTP_HOST=smtp.gmail.com SMTP_PORT=587 \
  SMTP_PASS=your-gmail-app-password
fly deploy
```

`fly.toml` already sets `ALLOWED_EMAIL_DOMAIN`, `SESSION_HTTPS_ONLY=true`, and
the data volume mount.

---

## 3. Verify

- `https://YOUR-URL/`            → marketing site
- `https://YOUR-URL/contact.html`→ book a demo (stores lead + emails sales)
- `https://YOUR-URL/dashboard`   → redirects to `/login` → **Sign in with Google**
  - A `@prachalas.com` account gets in.
  - Any other account is rejected with "not on the @prachalas.com domain".

`GET /api/health` shows `oauth_configured` and `login_domain` so you can confirm
the env landed.

## Security checklist (what's enforced)

- Dashboard + all `/api/admin/*` require a valid session; anonymous → 401 / login redirect.
- Login is Google-only; the email must be **verified** and end in `@prachalas.com`
  (checked server-side — a spoofed `hd` or lookalike domain is rejected).
- Session cookie is **HttpOnly**, **SameSite=Lax**, **Secure** (HTTPS-only) in prod, 8h expiry.
- `DASHBOARD_DEV_BYPASS` must remain unset/false in production (it's off by default).
- Secrets live in the platform's secret store / `.env` (git-ignored), never in the repo.
