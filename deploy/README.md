# Deploying Artintele.ai on a VM (AWS Lightsail / EC2)

A single Ubuntu box runs the app behind **Caddy**, which auto-provisions HTTPS.
Your leads DB and uploads persist in Docker volumes across restarts/redeploys.

## Prerequisites
- An Ubuntu 22.04/24.04 server (Lightsail $5–7 plan is plenty), Mumbai region.
- Ports **80** and **443** open in the firewall.
- A **domain** with an **A record → the server's public IP** (HTTPS + Google login require it).

## One-time setup
```bash
# 1) SSH into the server, then get the code (private repo):
#    use a GitHub Personal Access Token (repo:read) or `gh auth login`
git clone https://github.com/Chiranth-P/artintele.git
cd artintele

# 2) Install Docker
bash deploy/setup-server.sh
newgrp docker          # or log out/in

# 3) Configure secrets
cd deploy
cp .env.example .env
nano .env              # set SITE_DOMAIN, PUBLIC_BASE_URL, SESSION_SECRET,
                       # GOOGLE_CLIENT_ID/SECRET (after creating the OAuth client)

# 4) Launch (builds the image, starts app + Caddy, issues HTTPS cert)
docker compose up -d --build
```
Visit `https://<your-domain>` — the site is live with a valid certificate.

## Updating after a code change
```bash
cd artintele && git pull
cd deploy && docker compose up -d --build
```

## Useful commands
```bash
docker compose ps              # status
docker compose logs -f app     # app logs
docker compose logs -f caddy   # cert / proxy logs
docker compose down            # stop (data volumes are kept)
```

## Notes
- **HTTPS needs the domain pointed first.** If DNS isn't ready, Caddy will keep
  retrying the certificate until it resolves.
- The Google OAuth redirect URI must be `https://<your-domain>/auth/callback`.
- `.env` holds secrets and is git-ignored — never commit it.
- Always-on box = no cold starts (unlike Fly's suspend mode).
