# Hosting Artintele.ai on AWS Lightsail — Full Step-by-Step Guide

Everything from a fresh Lightsail instance to a live `https://artintele.ai`
with a working CRM login. Follow it in order.

**Your fixed values (used throughout):**
- Domain: `artintele.ai`
- Allowed dashboard login domain: `prachalas.com`
- SESSION_SECRET: `dT9DHJ0YCYg6zL8uXeTTjZB0k9QyyQgQ7FyxpRVbUJkYkPkQD6u9kApDQlsTUqA3`
- Repo: `Chiranth-P/artintele`

---

## PART A — Create the instance
1. Go to **lightsail.aws.amazon.com** → **Create instance**.
2. **Region:** click *Change AWS Region* → **Mumbai (ap-south-1)**.
3. **Platform:** Linux/Unix.
4. **Blueprint:** select **OS Only → Ubuntu 22.04 LTS**.
5. **Plan:** **$5/mo** (512 MB RAM, 2 vCPU, 20 GB SSD).
6. **Name:** `artintele` → **Create instance**.
7. Wait until **Instance status: Running**.

✅ You should see the instance card showing **Ubuntu**, **Mumbai**, **Running**.

---

## PART B — Attach a static IP (critical)
A dynamic IP changes on restart and breaks your domain. Lock it.
1. Open the `artintele` instance → **Networking** tab.
2. Under the public IP, click **Attach static IP** (or Lightsail home → Networking → **Create static IP**).
3. Name it `artintele-ip`, attach to `artintele` → **Create / Attach**.

✅ The **public IPv4 now shows your permanent static IP**. **This is the IP you use everywhere below.**

---

## PART C — Open the firewall ports
On the instance → **Networking** tab → **IPv4 Firewall**. You need all three:
| Application | Protocol | Port |
|---|---|---|
| SSH | TCP | 22 |
| HTTP | TCP | 80 |
| **HTTPS** | TCP | **443** |

If **HTTPS 443** is missing → **Add rule → HTTPS → Any IPv4 address → Create**.

✅ All three rules present.

---

## PART D — Point the domain at the server (Namecheap)
1. Namecheap → **Domain List → Manage** (artintele.ai) → **Advanced DNS**.
2. **Delete** the default records Namecheap adds:
   - `CNAME Record · www → parkingpage.namecheap.com`
   - `URL Redirect Record · @`
3. **Add Record** twice:
   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A Record | `@` | *your static IP* | Automatic |
   | A Record | `www` | *your static IP* | Automatic |
4. Save. Confirm (Domain tab) nameservers = **Namecheap BasicDNS**.

DNS takes ~5–30 min to propagate. Check from your laptop:
```bash
dig +short artintele.ai     # should print your static IP
```

✅ `dig` returns your static IP → DNS is ready.

---

## PART E — Create a GitHub token (to pull the private repo)
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name `artintele-server`; **Repository access:** Only select → `Chiranth-P/artintele`; **Permissions → Contents: Read-only**.
3. **Generate** → copy the token (starts `github_pat_…`). You'll paste it once below.

---

## PART F — Connect to the server
On the `artintele` instance → **Connect** tab → **Connect using SSH**.
A black terminal opens in your browser. All commands below run **there**.

✅ You see a prompt like `ubuntu@ip-172-…:~$`.

---

## PART G — Deploy
Paste each block in order. Replace `YOUR_TOKEN` with your GitHub token.

**1) Add swap** (so the build doesn't run out of RAM on 512 MB):
```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**2) Get the code:**
```bash
git clone https://YOUR_TOKEN@github.com/Chiranth-P/artintele.git
cd artintele
```

**3) Install Docker:**
```bash
bash deploy/setup-server.sh
newgrp docker
```

**4) Configure secrets:**
```bash
cd deploy
cp .env.example .env
nano .env
```
Set these (leave `GOOGLE_*` and SMTP blank for now):
```
SITE_DOMAIN=artintele.ai
PUBLIC_BASE_URL=https://artintele.ai
SESSION_SECRET=dT9DHJ0YCYg6zL8uXeTTjZB0k9QyyQgQ7FyxpRVbUJkYkPkQD6u9kApDQlsTUqA3
ALLOWED_EMAIL_DOMAIN=prachalas.com
SESSION_HTTPS_ONLY=true
```
Save in nano: **Ctrl+O → Enter → Ctrl+X**.

**5) Launch:**
```bash
docker compose up -d --build
```
First build takes a few minutes on 512 MB (swap engages — normal).

✅ `docker compose ps` shows **app** and **caddy** both `running`.

---

## PART H — Verify the site
- Visit **https://artintele.ai** → the site loads with a 🔒 padlock (valid HTTPS).
- If you get a cert warning at first, wait 1–2 min — Caddy is still issuing the certificate. Watch it:
```bash
docker compose logs -f caddy
```
- The **dashboard login won't work yet** — expected (Google OAuth not set).

---

## PART I — Turn on the dashboard login (Google OAuth)
Now that `https://artintele.ai` exists, create the OAuth client.
1. Google Cloud Console → project **Artintele CRM** → **APIs & Services → Credentials** (or **Clients**) → **Create OAuth client**.
2. **Application type:** Web application; **Name:** `Artintele CRM Web`.
3. **Authorized redirect URIs → Add URI:**
   ```
   https://artintele.ai/auth/callback
   ```
4. **Create** → copy the **Client ID** and **Client secret**.
5. Back on the server, edit the env and add them:
```bash
cd ~/artintele/deploy
nano .env
```
Set:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```
Save, then apply:
```bash
docker compose up -d
```

✅ Visit **https://artintele.ai/dashboard** → "Sign in with Google" → a `@prachalas.com` account gets in.

---

## PART J — Day-to-day

**Deploy a code update:**
```bash
cd ~/artintele && git pull
cd deploy && docker compose up -d --build
```

**Common commands:**
```bash
docker compose ps              # status
docker compose logs -f app     # app logs
docker compose logs -f caddy   # cert / proxy logs
docker compose restart         # restart
docker compose down            # stop (data is kept in volumes)
```

**Your data is safe:** the leads DB and uploads live in Docker volumes
(`app_data`, `app_uploads`) and survive restarts, redeploys, and `git pull`.

---

## Troubleshooting
- **Site won't load / no HTTPS:** DNS not propagated yet (`dig +short artintele.ai` must show your IP), or port 443 isn't open (Part C). Check `docker compose logs caddy`.
- **Build killed / out of memory:** make sure the swap step (Part G‑1) ran: `swapon --show` should list `/swapfile`.
- **`git clone` asks for a password:** your token is wrong/expired — regenerate (Part E).
- **`docker: permission denied`:** run `newgrp docker` (or log out and back in).
- **Login rejected:** the Google account must end in `@prachalas.com`, and the redirect URI must be exactly `https://artintele.ai/auth/callback`.

---

## Cost reminder
You're on the AWS free-credit period (~5 months, $100 credits) — **₹0 now**.
After it ends, this $5/mo plan continues at ~₹420/month. I'll flag it before then.

Moving this to a different AWS account later (for a fresh credit window, say)
is covered in [MIGRATE_ACCOUNT.md](MIGRATE_ACCOUNT.md).
