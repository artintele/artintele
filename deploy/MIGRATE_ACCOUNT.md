# Moving Artintele.ai to a different AWS account

Lightsail has **no cross-account transfer**. Snapshots copy between *regions*,
but they cannot be shared with another *account*. AWS's own workaround —
snapshot → export to an EC2 AMI → re-encrypt with a customer-managed KMS key →
share the AMI → launch — leaves you on **EC2 rather than Lightsail**, which
means losing the flat $5/mo plan and taking on EC2's billing and management.

So we don't transfer. We **rebuild** on the new account and carry the data over.
The whole server is reproducible from the repo; the only state that can't be
rebuilt is two Docker volumes:

| Volume | Holds | Rebuildable? |
|---|---|---|
| `app_data` | SQLite leads DB (`artintele.db`) | ❌ must be copied |
| `app_uploads` | Uploaded resumes | ❌ must be copied |
| `caddy_data` | TLS certificates | ✅ Caddy re-issues automatically |
| `caddy_config` | Caddy's autosave | ✅ regenerated |

**Budget:** ~45 minutes, of which the site is only down for the DNS cutover
(1–3 min if you do PART B first).

**Keep the old instance running until PART I says otherwise.** Nothing here is
destructive to it, and it stays your rollback.

---

## PART A — Collect what you need

From the **old** account / existing setup:
- [ ] The current `.env` contents — SSH in and run `cat ~/artintele/deploy/.env`.
      Copy it somewhere safe. It holds the Google OAuth client, SMTP, and the
      current session secret.
- [ ] Lightsail → **Account → SSH keys** → download the default key for the
      region. You need a real terminal for file transfer; the browser SSH
      window can't `scp`.

From the **new** account:
- [ ] Billing set up, and confirm which credits/free tier apply.
- [ ] Lightsail → **Account → SSH keys** → download that account's default key.

Elsewhere:
- [ ] A fresh GitHub fine-grained PAT (Contents: Read-only on
      `Chiranth-P/artintele`) — see PART E of `LIGHTSAIL_GUIDE.md`.
- [ ] Namecheap login for `artintele.ai`.

✅ You have both SSH keys, the old `.env`, and a new PAT.

---

## PART B — Lower the DNS TTL (do this first, ideally a day ahead)

Namecheap → **Domain List → Manage → Advanced DNS**. Edit both A records
(`@` and `www`) and set **TTL → 1 min** (or the lowest offered). Save.

This is what keeps the cutover in PART G short. If you skip it, the old TTL
(often 30 min) is how long some visitors keep hitting the old server.

✅ Both A records show a 1-minute TTL.

---

## PART C — Build the new instance

Follow `LIGHTSAIL_GUIDE.md` **PARTS A, B, C, F and G** on the new account,
with two deliberate changes:

1. **PART G‑4 (`.env`)** — paste the old `.env` you saved in PART A, but
   **generate a new session secret**:
   ```bash
   openssl rand -hex 32
   ```
   Put that in `SESSION_SECRET`. Do not reuse the old value: it was published
   in this repo's history and is considered compromised (see PART J). Rotating
   it signs out current dashboard sessions — users just log in again.

2. **Skip PART D (DNS).** The domain still points at the old server, and it
   stays that way until PART G.

Everything else is identical: swap, clone, `setup-server.sh`, `docker compose
up -d --build`.

**Caddy will fail to get a certificate at this stage.** That is expected and
correct — `artintele.ai` still resolves to the old box, so Let's Encrypt can't
validate. Caddy retries on its own and will succeed minutes after PART G.

Verify the app itself is healthy instead of going through HTTPS:
```bash
cd ~/artintele/deploy
docker compose ps                                  # app + caddy both running
docker compose exec -T caddy wget -qO- http://app:8080/ | head -5
```

✅ `docker compose ps` shows both services running, and the `wget` prints HTML.

---

## PART D — Back up the data on the OLD server

SSH into the **old** server.

Confirm the volume names first — Compose prefixes them with the project
directory, so they are normally `deploy_app_data` and `deploy_app_uploads`:
```bash
docker volume ls | grep -E 'app_data|app_uploads'
```
Use whatever that prints in the commands below.

Stop the app so nothing writes to SQLite mid-copy (Caddy keeps serving; the
site returns errors for these few seconds):
```bash
cd ~/artintele/deploy
docker compose stop app

docker run --rm -v deploy_app_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/app_data.tgz -C /data .
docker run --rm -v deploy_app_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/app_uploads.tgz -C /data .

docker compose start app
ls -lh app_data.tgz app_uploads.tgz
```

✅ Two tarballs exist and the app is running again.

---

## PART E — Move the tarballs across

Server-to-server copying needs the new server to trust the old server's key,
which is more setup than it's worth. Route them through your laptop.

**On your laptop**, with the two keys from PART A:
```bash
chmod 600 old-key.pem new-key.pem

# down from the old server
scp -i old-key.pem ubuntu@OLD_STATIC_IP:~/artintele/deploy/app_data.tgz .
scp -i old-key.pem ubuntu@OLD_STATIC_IP:~/artintele/deploy/app_uploads.tgz .

# up to the new server
scp -i new-key.pem app_data.tgz    ubuntu@NEW_STATIC_IP:~/artintele/deploy/
scp -i new-key.pem app_uploads.tgz ubuntu@NEW_STATIC_IP:~/artintele/deploy/
```

✅ Both files are in `~/artintele/deploy/` on the new server.

---

## PART F — Restore the data on the NEW server

SSH into the **new** server:
```bash
cd ~/artintele/deploy
docker compose stop app

docker run --rm -v deploy_app_data:/data -v "$PWD":/backup alpine \
  tar xzf /backup/app_data.tgz -C /data
docker run --rm -v deploy_app_uploads:/data -v "$PWD":/backup alpine \
  tar xzf /backup/app_uploads.tgz -C /data

docker compose start app
```

Confirm the leads actually came across:
```bash
docker compose exec -T app python -c \
  "import sqlite3;d=sqlite3.connect('/app/data/artintele.db');\
print('leads',d.execute('select count(*) from leads').fetchone()[0]);\
print('talent',d.execute('select count(*) from talent_applications').fetchone()[0])"
docker compose exec -T app sh -c 'ls /app/frontend/uploads | wc -l'
```

✅ Both counts match the old dashboard, and the uploads directory isn't empty.

---

## PART G — Cut over the DNS

Namecheap → **Advanced DNS** → edit both A records (`@` and `www`) → replace
the old static IP with the **new** static IP. Save.

Watch it flip, from your laptop:
```bash
dig +short artintele.ai        # should start returning the NEW IP
```

Once it does, watch the new server issue its certificate:
```bash
docker compose logs -f caddy   # on the NEW server
```

✅ `https://artintele.ai` loads with a valid padlock, served by the new box.

---

## PART H — Verify before you tear anything down

- [ ] `https://artintele.ai` loads over HTTPS, no cert warning.
- [ ] `https://www.artintele.ai` redirects to the apex.
- [ ] `https://artintele.ai/dashboard` → Sign in with Google → a
      `@prachalas.com` account gets in. (The redirect URI is domain-based and
      unchanged, so the existing OAuth client needs no edit.)
- [ ] The dashboard lists the **same leads** as before the move.
- [ ] A resume uploaded before the migration still downloads.
- [ ] Submit a test contact form → it appears in the dashboard, and the
      notification email arrives.

✅ Every box ticked. Only now continue.

---

## PART I — Decommission the old account

Give it **a few days** first — stale DNS caches and your own second thoughts.

When you're ready, on the old account:
1. Lightsail → the `artintele` instance → **Delete**.
2. Lightsail → **Networking** → detach and **delete** the static IP
   (an unattached static IP is billed).
3. Delete any leftover snapshots.
4. Revoke the old server's GitHub PAT (GitHub → Settings → Developer settings).
5. Check the old account's bill drops to zero next cycle.

On your laptop and both servers, delete the tarballs — they contain the full
leads database:
```bash
rm -f app_data.tgz app_uploads.tgz
```

✅ Old account has no running resources; copies of the DB are cleaned up.

---

## PART J — While you're in here: the exposed session secret

`LIGHTSAIL_GUIDE.md` used to carry a real `SESSION_SECRET` in plain text, and
`artintele/artintele` is a **public** repo — so that value, which signs the CRM
session cookies, was publicly readable from commit `162636e` until it was
replaced with a generated placeholder.

**Treat the old value as burned.** Two things follow:

1. **PART C above generates a fresh one**, which is what actually protects you.
   Any server still running the published secret should be rotated whether or
   not you ever migrate: edit `SESSION_SECRET` in its `.env` and
   `docker compose up -d`.
2. **It remains in git history.** Removing it there needs a rewrite
   (`git filter-repo`) plus force-pushes to both remotes, and anyone who
   already cloned keeps their copy regardless. That is housekeeping, not
   protection — rotation is the fix.

---

## Troubleshooting

- **Caddy won't issue a cert after the DNS flip.** `dig +short artintele.ai`
  must return the new IP from a network outside the server. Check port 443 is
  open in the new instance's IPv4 firewall (`LIGHTSAIL_GUIDE.md` PART C).
- **`docker volume ls` shows `artintele_app_data`, not `deploy_app_data`.**
  The project name came from a different directory. Use the names it prints.
- **Dashboard login loops after the move.** The session secret changed, which
  invalidates old cookies. Clear site data and log in again.
- **Lead count is 0 on the new server.** The restore ran while the app was
  running and recreated an empty DB. Stop `app`, re-run the extract, start it.
- **`scp` permission denied.** `chmod 600` the key, and the user is `ubuntu`.

---

## Cost reminder

Lightsail bills the instance *and* any unattached static IP. PART I deletes
both — until it does, you are paying on two accounts at once. The new account
starts its own free-tier/credit window; confirm which credits applied before
you rely on them.
