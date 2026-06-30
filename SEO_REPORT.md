# Artintele.ai — SEO Optimization Report

> Prepared from a full audit of the live codebase (`frontend/` + `backend/`).
> Domain assumed: **https://artintele.ai**
> Status: **✅ Implemented** (2026-06-30) — Pillars A–G applied to the code. Only the schema placeholders (email + social URLs) and the off-site tasks in §7 remain, plus deployment.

---

## 1. Executive summary

The site has a **solid technical base** (clean HTML, unique titles, meta descriptions on marketing pages, mobile-responsive, fast single-CSS-file load) but is **missing every "discoverability" layer** that search engines and social platforms rely on:

- ❌ No `robots.txt`
- ❌ No `sitemap.xml`
- ❌ No Open Graph / Twitter Card tags (link previews are blank everywhere)
- ❌ No canonical URLs (duplicate-content risk)
- ❌ No structured data / JSON-LD (no rich Google result)
- ❌ No social share image
- ❌ Login & dashboard are crawlable (should be hidden from Google)
- ⚠️ The 13 services + industries + case studies exist **only in JavaScript** (`home.js`) — the keyword-rich content is not in the static HTML

**Effort to fix the technical layer: ~1 implementation pass.** This is the highest impact-per-effort work available and is the focus of this report.

---

## 2. Current state — file-by-file audit

### `frontend/index.html` (Home)
| Item | Status | Notes |
|---|---|---|
| `<title>` | ✅ | `Artintele.ai — Automate Your Business With AI` |
| meta description | ✅ | line 9 — present, decent |
| viewport / lang / charset | ✅ | lines 2, 4, 5 |
| favicon / apple-touch-icon | ✅ | lines 7–8 |
| canonical | ❌ | missing |
| Open Graph tags | ❌ | missing — blank previews on WhatsApp/LinkedIn/X |
| Twitter Card | ❌ | missing |
| JSON-LD structured data | ❌ | missing |
| theme-color | ❌ | missing |
| H1 / heading order | ✅ | single H1 (hero), proper H2s |
| **Service content in HTML** | ⚠️ | **13 services injected via `home.js` only — not in static markup** |
| image `alt` text | ⚠️ | logo images need `alt` |

### `frontend/contact.html` (Book a Demo)
| Item | Status |
|---|---|
| `<title>` / meta description | ✅ present |
| canonical / OG / Twitter / theme-color | ❌ missing |
| H1 (`We speak your customers' language.`) | ✅ |

### `frontend/careers.html` (Careers)
| Item | Status |
|---|---|
| `<title>` / meta description | ✅ present |
| canonical / OG / Twitter / theme-color | ❌ missing |
| H1 (`Build the AI that businesses run on.`) | ✅ |

### `frontend/login.html` & `frontend/dashboard.html` (CRM)
| Item | Status |
|---|---|
| `<title>` | ✅ present |
| meta description | ❌ none (acceptable — should not be indexed) |
| **`robots` noindex** | ❌ **missing — these are currently crawlable and must be blocked** |

### `backend/main.py`
- Static frontend mounted at `/` via `StaticFiles` (line ~267); `/`, `/dashboard`, `/login` served by `FileResponse`.
- **No route serves `robots.txt` or `sitemap.xml`** — both need adding.
- ✅ A `PUBLIC_BASE_URL` env var already exists — we'll reuse it so canonical/sitemap URLs resolve to the real domain automatically.

### Site-wide
- ❌ No `/robots.txt`
- ❌ No `/sitemap.xml`
- ❌ No `og-image.png` (1200×630 social share image)

---

## 3. Keyword strategy

### Primary (high intent, competitive)
`AI agents` · `AI voice assistants` · `workflow automation` · `WhatsApp automation` · `AI telecaller`

### Secondary (broader reach, lower competition — to weave in naturally)
`AI automation company` · `AI solutions for businesses` · `custom AI software development` · `business process automation` · `AI chatbot development` · `AI voice agent development` · `enterprise AI solutions` · `generative AI development` · `AI consulting`

### Regional / long-tail (lowest competition, highest local intent — a key differentiator)
Languages are **customizable to any regional language**, not a fixed list. This unlocks valuable long-tail terms:
`regional language AI voice agent` · `multilingual AI agents` · `Kannada AI voice agent` · `Tamil AI telecaller` · `Hindi AI chatbot` · `Telugu / Malayalam AI support`

### Mapping keywords → existing real content (no stuffing)
| Keyword cluster | Lives naturally in |
|---|---|
| AI automation company / AI solutions for businesses | Homepage hero + services intro + Organization schema |
| Custom AI software development / generative AI | "Custom AI Development", "Knowledge Assistants" services |
| Business process / workflow automation | "Workflow Automation" service copy |
| AI chatbot development | "AI Chatbots" service |
| AI voice agent / AI telecaller | "AI Voice Agents" service + Telecaller CRM |
| AI consulting | "AI Consulting" service |
| Regional / multilingual | "Custom AI Voices" + Voices section + meta descriptions |

> **Principle:** weave terms into headings, the services intro paragraph, meta descriptions, and structured-data `serviceType` — readable for humans, broad for search. No repetition/stuffing.

---

## 4. The plan — what gets done, by SEO pillar

### Pillar A — Crawl control (NEW files + backend routes)
1. **`robots.txt`** (served via FastAPI route)
   ```
   User-agent: *
   Allow: /
   Disallow: /dashboard
   Disallow: /login
   Disallow: /api/
   Disallow: /auth/

   Sitemap: https://artintele.ai/sitemap.xml
   ```
2. **`sitemap.xml`** (dynamic route, uses `PUBLIC_BASE_URL`)
   - Lists `/`, `/contact.html`, `/careers.html`
   - Excludes login/dashboard/api

### Pillar B — Per-page `<head>` meta (index, contact, careers)
- `<link rel="canonical">` — the one true URL per page
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
- Twitter Card: `summary_large_image`
- `<meta name="robots" content="index,follow">`
- `<meta name="theme-color" content="#1f9d5b">` (brand green)

### Pillar C — Keep the CRM out of search
- Add `<meta name="robots" content="noindex,nofollow">` to `login.html` + `dashboard.html`

### Pillar D — Structured data (JSON-LD on homepage)
- **Organization** — name, logo, url, description, `sameAs` (socials), contact
- **WebSite** — enables Google sitelinks
- **ProfessionalService** — `serviceType` list (all 13 services), `areaServed`, `availableLanguage`

### Pillar E — Social share image
- Generate **`assets/img/og-image.png`** (1200×630): logo + "Automate Your Business With AI" + service strip + `artintele.ai` on brand gradient

### Pillar F — Crawlability of JS-rendered content ⚠️ (important)
The 13 services, industries, and case studies are injected by `home.js` at runtime. Googlebot *can* render JS, but it's slower and less reliable. **Recommendation:**
- Add a `<noscript>` fallback **or** server-render the service names + descriptions into static HTML so the keyword content is guaranteed crawlable.
- This is where most of your service keywords live, so it matters.

### Pillar G — Polish
- Descriptive `alt` text on logo/images
- Confirm one `<h1>` per page (already ✅)
- Fonts already use `display=swap` ✅

---

## 5. Exact copy to be inserted

### Home (`index.html`)
- **title:** `AI Agents, Voice Assistants & Automation | Artintele.ai`
- **description:** `Artintele.ai is an AI automation company building custom AI agents, voice assistants, chatbots & workflow automation that help businesses cut costs and scale 24/7.`
- **og:title:** `Artintele.ai — Automate Your Business With AI`
- **og:description:** `Custom AI agents, voice assistants & automations, built and deployed for your business — fluent in any language, including regional Indian languages.`

### Contact (`contact.html`)
- **title:** `Book a Free AI Consultation & Demo | Artintele.ai`
- **description:** `Book a free consultation or live demo with Artintele.ai. Our AI voice agents and telecallers speak your customers' language — any regional language, 24/7.`

### Careers (`careers.html`)
- **title:** `Careers — Build AI That Businesses Run On | Artintele.ai`
- **description:** `Join the Artintele.ai talent network. Work on production AI agents, voice assistants, and automation for real businesses. Remote-friendly.`

> Final copy will reflect your answers on Prachalas / geo-focus / AI-telecaller billing (see §8).

---

## 6. Implementation checklist

- [x] `robots.txt` route in `backend/main.py` (uses `config.SITE_URL`)
- [x] `sitemap.xml` route in `backend/main.py` (uses `config.SITE_URL`)
- [x] index.html — canonical + OG + Twitter + theme-color + JSON-LD (Organization + WebSite + ProfessionalService)
- [x] contact.html — canonical + OG + Twitter + theme-color
- [x] careers.html — canonical + OG + Twitter + theme-color
- [x] login.html + dashboard.html — `noindex,nofollow`
- [x] Generate `assets/img/og-image.png` (1200×630)
- [x] `alt` text on logo images → `alt="Artintele.ai logo"`
- [x] `<noscript>` fallback for the 13 services (crawlable without JS)
- [ ] **Fill schema placeholders** in `index.html`: `PLACEHOLDER_EMAIL`, `PLACEHOLDER_LINKEDIN`, `PLACEHOLDER_TWITTER`, `PLACEHOLDER_INSTAGRAM`

---

## 7. Out of scope here (your action, after code ships)

These are **not code** and can't be done from the repo — but they're how SEO actually pays off:

1. **Deploy** (`fly deploy`) so the changes go live.
2. **Connect the domain** `artintele.ai` (Fly: `fly certs add artintele.ai` + DNS records).
3. **Google Search Console** — verify the domain, submit `sitemap.xml`, monitor indexing.
4. **Google Business Profile** — major for local/India SEO.
5. **Content / blog** (the long game) — articles targeting buyer searches like *"AI voice agent for hospitals"*, *"WhatsApp automation for real estate"*, *"Kannada AI telecaller"*. This is the single biggest long-term ranking lever and would warrant its own `/blog` section later.
6. **Backlinks & directory listings** — Clutch, GoodFirms, LinkedIn company page, etc.

---

## 8. Open questions (needed for final accuracy)

1. **Prachalas** — parent company? Include as `parentOrganization` in schema, or keep everything under "Artintele.ai"?
2. **Geographic focus** — India-primary, or position as serving clients globally too?
3. **"AI Telecaller"** — give it flagship billing in titles/keywords, or treat as one capability among the voice services?
4. **Placeholders for schema:**
   - Public contact email (`sales@prachalas.com`, `hello@artintele.ai`, …?)
   - Social profile URLs (LinkedIn / X / Instagram)
   - Phone number (optional — adds click-to-call signal)

---

*Once §8 is answered, the technical layer (Pillars A–G) can be implemented in a single pass.*
