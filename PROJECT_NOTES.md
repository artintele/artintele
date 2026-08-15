# Artintele.ai — Build & Launch Notes (start → live)

> Personal reference. Everything we built, every problem we hit, how we fixed it,
> the live setup, and how to run things going forward.
> **Status: LIVE at https://artintele.ai** — fast, secure, indexable, CRM working.
> (This file is local only — not committed to GitHub.)

---

## 1. What the project is
A full-stack site + lead pipeline + telecaller CRM for an AI automation company.

- **Frontend:** static HTML/CSS/JS (home, pricing, contact, careers) + a login-gated dashboard.
- **Backend:** FastAPI (Python) + SQLite, serving the pages and a lead API.
- **Public flow:** visitor → contact form → lead saved to DB (+ emailed to sales once SMTP is on).
- **CRM:** `/dashboard`, Google sign-in locked to `@prachalas.com`, lists/works the leads.

---

## 2. The whole timeline (what we did, in order)

### Phase 1 — SEO foundation
- Added **robots.txt** + **sitemap.xml** (dynamic FastAPI routes using the real domain).
- Per-page **canonical**, **Open Graph**, **Twitter Card**, **theme-color**, keyword-tuned titles/descriptions.
- **JSON-LD** structured data: Organization + WebSite + ProfessionalService.
- **noindex** on `/login` + `/dashboard` (keep the CRM out of search).
- Generated a branded **og-image** (1200×630) for link previews.
- `<noscript>` fallback so JS-rendered content is crawlable.

### Phase 2 — AI-answer-engine (AEO/GEO) layer
- `<noscript>` for industries / process / case studies too.
- Visible **FAQ section** + **FAQPage** + **Speakable** schema (voice search).
- **hasOfferCatalog** + **BreadcrumbList** in schema.
- **llms.txt** (summary for AI crawlers) + explicit **AI-bot allowlist** in robots.txt (GPTBot, ClaudeBot, PerplexityBot, etc.).

### Phase 3 — Content & UX
- Framed languages as **"any custom regional language"** (added the "+ your regional language" chip; the listed 6 are examples).
- Built the **Pricing page** (requirements-first, value-anchored to the cost of a human hire — no fixed prices published; routes to a custom quote). Reused the careers node-network animation.
- Reworked the **contact form**: capture **call volume, website, services (multi-select checkboxes), lead source (multi-select)**; made it mouse-only (dropped free-text).
- Removed public **sales@prachalas.com** (until company is registered).
- Removed the redundant **"Schedule Demo"** button from the bottom CTA.

### Phase 4 — Mobile + bug fixes
- Fixed **Custom AI Voices** clipping on phones + app-wide overflow guards.
- Fixed the **"How we work" connector line** floating disconnected on mobile.
- Fixed a real bug: **lead_source 422** (see Problems).

### Phase 5 — Deployment
- Chose **AWS Lightsail** (Ubuntu 22.04, Mumbai) + **Docker** + **Caddy** (automatic HTTPS).
- Bought domain **artintele.ai** on Namecheap; pointed DNS at the server.
- Set up **Google OAuth** for the dashboard login.
- Went **live with HTTPS**, then wired the CRM login.

### Phase 6 — Lighthouse polish (scored 99/100/100/100)
- Reformatted **llms.txt** to the llmstxt.org spec → **Agentic Browsing 3/3**.
- Added **security headers** (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, COOP) + **cache headers** in Caddy.
- Optimized **logo.png** (47.6 KiB → 17 KiB).

---

## 3. Problems we hit & how we solved them

| # | Problem | Fix |
|---|---|---|
| 1 | **OG image had garbled AI text** ("VOiQE ASsuTANTS", smeared "Automation") | Flagged it; patched the bad word, then used a clean re-generated version built from the registered logo |
| 2 | **Contact form 422** — `lead_source` is a 16-option multi-select; joined string blew past the schema's 120-char cap | Raised the cap to 400 to match the DB column |
| 3 | **Custom AI Voices clipped on mobile** — the 44-bar waveform forced the column ~409px wide, cutting off text | `min-width:0` on grid children + `overflow:hidden` on the waveform + tighter padding; added app-wide `overflow-x:hidden` guards |
| 4 | **"How we work" line disconnected on mobile** — one horizontal connector built for the desktop 7-across row | Hide the rail (`.ai-process-rail`) at ≤1024px where the grid wraps |
| 5 | **Almost deleted email DNS records** on Namecheap | Caught it — those TXT records (SPF/DKIM/DMARC/verification) are Google Workspace email, NOT parking junk. Kept them; only added A records |
| 6 | **No credit card** for hosting | Researched rails; found **AWS India now accepts UPI** for signup + recurring → went AWS |
| 7 | **Lightsail $7 vs $5 confusion** + AWS free-tier confusion | New AWS Free Tier = **$100 credits / ~5 months** (not the old 12-month). Started on **$5** plan with 2 GB swap so no future downgrade needed |
| 8 | **www.artintele.ai refused** (ECONNREFUSED) | Caddy only served the apex; added a `www → apex` 301 redirect block (own cert) |
| 9 | **git pull blocked** on the server | A hand-edit to `Caddyfile` on the server conflicted; `git checkout -- deploy/Caddyfile` then pull |
| 10 | **swap "Text file busy"** | Harmless — the command ran twice; swap was already active |
| 11 | **OAuth "Invalid origin"** error | Pasted the callback URL into *Authorized JavaScript origins* (wrong box); it belongs in *Authorized redirect URIs* |
| 12 | **Secrets pasted in chat** (GitHub token, OAuth secret) | Used them, stripped the token from the server's git remote; **TODO: revoke/rotate** (see §6) |
| 13 | **Cached CSS/old version showing** | Asset URLs are versioned `?v=…`; hard-refresh (Cmd+Shift+R) or bump the version |

---

## 4. The live setup (facts to remember)

**Hosting**
- AWS **Lightsail**, Ubuntu 22.04, region **Mumbai (ap-south-1)**, **$5/mo** plan, **static IP** attached.
- **2 GB swap** added (so 512 MB RAM handles the Docker build).
- Firewall open: **22 (SSH), 80 (HTTP), 443 (HTTPS)**.

**App runs as Docker** (in `~/artintele/deploy`)
- `docker-compose.yml` → two containers: **app** (FastAPI/uvicorn) + **caddy** (reverse proxy + auto-HTTPS).
- Data persists in Docker volumes: `app_data` (SQLite leads DB), `app_uploads` (resumes).
- Caddy serves `artintele.ai`, redirects `www.artintele.ai` → apex, auto-renews the TLS cert.

**Domain / DNS** (Namecheap → Advanced DNS, BasicDNS)
- `A  @   → <static IP>`
- `A  www → <static IP>`
- **Email records kept** (TXT: SPF/DKIM/DMARC/verification, + MX) — do not touch.

**Google / accounts**
- Workspace **prachalas.com** (also hosts the `artintele.ai` email domain).
- GCP project **"Artintele CRM"** → OAuth client, redirect URI `https://artintele.ai/auth/callback`.
- CRM login allowed for **any `@prachalas.com`** account.

**Secrets** live only in `~/artintele/deploy/.env` on the server (git-ignored):
`SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PUBLIC_BASE_URL`, `ALLOWED_EMAIL_DOMAIN`, `SITE_DOMAIN`.

**Cost:** free for ~5 months (AWS $100 credits), then ~$5/mo (~₹420). Switch to UPI AutoPay before credits/period end.

---

## 5. How to do common things (runbook)

**Get into the server:** Lightsail → `artintele` instance → **Connect → Connect using SSH** (browser terminal).

**Deploy a code update** (after it's pushed to GitHub `main`):
```bash
cd ~/artintele
git pull https://<FRESH_TOKEN>@github.com/Chiranth-P/artintele.git main
cd deploy
sudo docker compose up -d --build     # rebuilds the app
sudo docker compose restart caddy     # only if Caddyfile changed
```
> If a server-side file was hand-edited and blocks the pull: `git checkout -- <file>` first.

**Check status / logs:**
```bash
sudo docker compose ps
sudo docker compose logs -f app
sudo docker compose logs -f caddy
```

**See the CRM:** `https://artintele.ai/dashboard` → Sign in with Google (`@prachalas.com`).

**Health check:** `https://artintele.ai/api/health` → `oauth_configured`, `email_configured`, `login_domain`.

**Verify from your Mac:**
```bash
curl -sI https://artintele.ai            # headers
curl -s https://artintele.ai/llms.txt    # content
dig +short artintele.ai                  # DNS → should be the static IP
```

---

## 6. Outstanding to-do (nothing blocking — priority order)

**Security housekeeping (do soon):**
- [ ] **Revoke** the GitHub token shared in chat (GitHub → Developer settings → Fine-grained tokens → delete).
- [ ] **Rotate** the Google OAuth client secret (GCP → Clients → reset), update `.env`, `docker compose up -d`.
- [ ] (Nice) Set up a **read-only deploy key** so updates don't need a token each time.

**Get found on Google (highest value):**
- [ ] **Google Search Console** → verify `artintele.ai` (DNS TXT) → submit `https://artintele.ai/sitemap.xml` → request indexing.
- [ ] **GA4** for analytics; **Bing Webmaster Tools**.
- [ ] Google **Rich Results Test** + **Mobile** PageSpeed run.

**When the company is registered / email is live:**
- [ ] Put the **public contact email** back on the site + restore `sales@prachalas.com`.
- [ ] Configure **SMTP** in `.env` so new leads get emailed.

**Optional polish / later:**
- [ ] CSP header (test in `report-only` first — would break inline styles/fonts/canvas otherwise).
- [ ] Inline critical CSS + preload hero font (only if mobile score needs it).
- [ ] **Switch to UPI AutoPay** in AWS before the free credits/5-month period ends.
- [ ] Content/authority phase: blog, comparison pages, case studies, directory listings (drives AI citations + rankings over 2–4 months).

---

## 7. Key file locations (in the repo)
- `frontend/` — `index.html`, `pricing.html`, `contact.html`, `careers.html`, `login.html`, `dashboard.html`, `assets/`
- `backend/` — `main.py` (routes incl. robots/sitemap/llms), `models.py`, `schemas.py`, `database.py`, `emailer.py`, `auth.py`, `config.py`
- `deploy/` — `docker-compose.yml`, `Caddyfile`, `.env.example`, `setup-server.sh`, `LIGHTSAIL_GUIDE.md`, `README.md`
- `Dockerfile`, `fly.toml` (unused now — AWS instead), `SEO_REPORT.md`

---

## 8. WHY we did each thing (the reasoning)

### SEO foundation — *why each piece*
- **robots.txt** → crawlers otherwise guess what to read; we explicitly let them in for public pages and **block `/dashboard`,`/login`,`/api/`,`/auth/`** so the private CRM + lead data never get crawled.
- **sitemap.xml** → hands Google the exact list of real pages, so it discovers/indexes them faster instead of stumbling around. Built dynamically so it always uses the real domain.
- **canonical tags** → stop Google treating `/`, `/index.html`, `www`, trailing-slash as *different duplicate pages* (which splits ranking). One canonical = one strong page.
- **Open Graph / Twitter tags + og-image** → control how a shared link looks on WhatsApp/LinkedIn/X. Without them a shared link is a bare, ugly URL with no image → far fewer clicks. For a B2B agency that gets shared in DMs, this is direct lost conversion.
- **JSON-LD structured data** → a machine-readable description of the business/services so Google can show rich results and **AI engines actually understand who you are**.
- **noindex on login/dashboard** → privacy + security: prospect data must never surface in a Google search.
- **`<noscript>` fallback** → the services/industries were injected by JavaScript. Many crawlers (especially AI bots) **don't run JS**, so they saw empty pages. The fallback makes that content readable to them — otherwise your core offerings were invisible to AI search.

### AI-answer-engine layer — *why bother beyond Google*
- Search is shifting to **AI answers** (ChatGPT, Perplexity, Google AI Overviews). Ranking #1 matters less if the answer is read aloud / summarized. So:
- **FAQ + FAQPage + Speakable schema** → answer engines and voice assistants extract Q&A pairs; this is how you win "People Also Ask", featured snippets, and spoken answers.
- **llms.txt** → an emerging convention: a clean summary file AI agents read to understand and cite your site.
- **AI-bot allowlist in robots.txt** → if you want AI tools to *cite* you, you have to explicitly **let their crawlers in** (GPTBot, ClaudeBot, PerplexityBot…).

### Content & UX — *why each change*
- **"Any regional language" framing** → it's the truth (voices are custom-built per client, not a fixed list) **and** SEO-smart: long-tail terms like "Kannada AI voice agent" are far less competitive than "AI agent".
- **Pricing page, value-anchored, no fixed prices** → "how much does an AI receptionist cost?" is a top search/AI query. We answer it (anchoring on the ₹15–25k cost of a human hire = persuasive + citable) **without** publishing our prices, and route to a custom quote → qualified leads.
- **Contact form qualifying fields** (call volume, website, services, lead source) → lets you scope a quote and see where leads come from, instead of a bare name/email.
- **Removed public email + redundant CTA** → don't expose an email before the company's registered; two buttons to the same page just adds noise.

### Mobile + bug fixes — *why they mattered*
- **Mobile-first** → Google ranks on the mobile version, and most of the India target audience is on phones. A broken mobile layout hurts both ranking and trust.
- **lead_source 422** → this wasn't cosmetic — it would **silently reject real leads** when someone selected several sources. That's lost business, so it was the priority fix.

### Deployment choices — *why this stack*
- **Docker** → packages the app identically everywhere; deploys and updates are one command, no "works on my machine".
- **Caddy** → gives **automatic HTTPS** (free Let's Encrypt cert, auto-renew) with near-zero config. We needed HTTPS because **Google login refuses non-HTTPS**, and browsers warn on plain HTTP.
- **A VM (AWS Lightsail) instead of Fly/Railway** → the deciding factor was **payment**: you have no credit card, and **AWS India accepts UPI**. Bonus: a VM is **always-on (no cold-start delay)**.
- **Mumbai region** → lowest latency for Indian visitors.
- **Static IP** → a dynamic IP changes on restart and would break the domain; static keeps DNS valid.
- **2 GB swap** → 512 MB RAM is too little to build the image (pandas); swap prevents the build from being killed.
- **$5 plan** → cheapest that works (with swap); starting here avoids a painful downgrade later.
- **Domain before HTTPS** → a certificate can't be issued for a bare IP, and Google OAuth needs an HTTPS URL — so the domain had to be pointed first.
- **Kept the email DNS records** → those TXT/MX entries run your Google Workspace email; deleting them = broken email. We only *added* A records.
- **www → apex redirect** → people type `www`; without it `www` was dead. Redirecting keeps **one canonical address** (good for SEO + UX).
- **Google OAuth locked to `@prachalas.com`** → the CRM holds prospect data; restricting login to company accounts is the security boundary.

### Lighthouse polish — *why each tweak*
- **llms.txt to spec** → the audit literally checks the format; matching the spec = full "Agentic Browsing" score and genuinely better AI readability.
- **Security headers** → real protection: **HSTS** forces HTTPS, **X-Frame-Options** blocks clickjacking, **X-Content-Type-Options** stops MIME sniffing, **Referrer-Policy** limits leaked URLs, **COOP** isolates the page. Also clears the audit's "high severity" flags.
- **Cache headers on `/assets/*`** → repeat visitors reload instantly from cache. Safe because asset URLs are versioned (`?v=…`), so a change still busts the cache.
- **Optimized logo (47.6 → 17 KiB)** → smaller asset = faster first paint (LCP).
- **Skipped CSP (for now)** → a strict Content-Security-Policy would break the inline styles, inline theme script, Google Fonts, and the canvas animation. It needs careful `report-only` testing first — not worth risking a working site for one "unscored" flag.

---

*From ~25/100 machine-readiness to a live, fast, secure, fully-indexable site with a working CRM. The remaining work is go-live ops + content, not core development.*
