# Launch guide

Everything needed to put Al-Mostafa online is in the `deploy/` folder. The whole shop runs on **one rented server**:
the database, the API, the website and an HTTPS server that gets and renews the security certificate automatically.

Plan about one hour the first time. You need: a credit/debit card, an email address, and a computer with a terminal
(Mac: Terminal app · Windows: PowerShell).

---

## Step 1 — Buy a domain

Buy your address (for example `almostafa.com` or `almostafa.com.eg`) from any registrar, such as Namecheap,
Cloudflare or GoDaddy. Keep the registrar's website open; you'll need its **DNS settings** page in Step 3.

## Step 2 — Rent a server

Create a server ("VPS" or "droplet") at a provider such as Hetzner, DigitalOcean or Vultr with:

| Setting | Choose |
|---|---|
| Operating system | **Ubuntu 24.04** |
| Size | **2 vCPU, 4 GB RAM** (building the site needs the memory) — usually €5–25/month |
| Region | Europe (Frankfurt, Amsterdam…) — closest to Cairo among common options |
| Login | SSH key (recommended) or password |
| Backups | **Turn on** the provider's automatic backups if offered |

Write down the server's **IP address** (four numbers like `203.0.113.10`).

## Step 3 — Point the domain to the server

In your registrar's DNS settings add two records:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server IP |
| A | `www` | your server IP |

It can take from a few minutes to a few hours to take effect.

## Step 4 — Connect to the server and install Docker

From your computer's terminal (replace the IP):

```bash
ssh root@203.0.113.10
```

Then, on the server, install Docker and open the web ports:

```bash
curl -fsSL https://get.docker.com | sh
```

```bash
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## Step 5 — Download the shop

The repository is private, so GitHub asks for your username and a **personal access token** as the password
(GitHub → Settings → Developer settings → Personal access tokens → Fine-grained → read-only access to
`almostafa-shop`).

```bash
git clone https://github.com/Ma7odamoud/almostafa-shop.git /opt/almostafa-shop
```

```bash
cd /opt/almostafa-shop/deploy
```

## Step 6 — Fill in your settings

```bash
cp .env.example .env
```

Generate a strong database password and copy it:

```bash
openssl rand -hex 24
```

Open the settings file:

```bash
nano .env
```

Fill in the four lines, then save with **Ctrl+O, Enter** and exit with **Ctrl+X**:

```
DOMAIN=almostafa.com
ADMIN_EMAIL=you@yourmail.com
ADMIN_PASSWORD=a-long-password-only-you-know
POSTGRES_PASSWORD=the-value-from-openssl
```

Keep these somewhere safe (a password manager). Never share the `.env` file.

## Step 7 — Start the shop

```bash
docker compose up -d --build
```

The first build takes about 5–10 minutes. When it finishes, check that all four parts are running:

```bash
docker compose ps
```

You should see `db`, `api`, `web` and `caddy` with status **Up**. Open `https://your-domain` — the padlock
appears automatically within a minute (the certificate is free, from Let's Encrypt).

> The API log may show one line `Failed executing DbCommand … __EFMigrationsHistory` on the very first start.
> That is the database being created and is expected exactly once.

## Step 8 — Add your fabrics

1. Go to `https://your-domain/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. **+ Add New Fabric** → fill in names, price per metre, colour, material, category, pattern.
3. **Specifications** (optional): composition, width, weight, season, care — only filled-in values are shown.
4. **Photos**: choose a photo → **Upload Photo**. Repeat. First photo = card image, second = hover image.
   Photos up to 20 MB are accepted; they are resized for the web, turned upright and their hidden location data is
   removed automatically. On iPhone set *Settings → Camera → Formats → Most Compatible* first.
5. **Save**. The fabric appears in the shop immediately.

The shop starts with an empty catalogue. Add your fabrics before announcing the site.

## Step 9 — Turn on daily backups

Run one backup by hand to check it works:

```bash
cd /opt/almostafa-shop/deploy && ./backup.sh
```

Then schedule it every night at 03:15:

```bash
(crontab -l 2>/dev/null; echo "15 3 * * * cd /opt/almostafa-shop/deploy && ./backup.sh >> backups/backup.log 2>&1") | crontab -
```

Backups are kept for 14 days in `deploy/backups/`. They live on the same server, so also keep the provider's
automatic server backups switched on, and now and then download a copy to your computer:

```bash
scp -r root@203.0.113.10:/opt/almostafa-shop/deploy/backups ./almostafa-backups
```

To restore (this **replaces** the current data with the backup):

```bash
./restore.sh backups/db_2026-12-01_0315.dump backups/uploads_2026-12-01_0315.tar.gz
```

---

## Everyday tasks

**Update the shop after changes are pushed to GitHub:**

```bash
cd /opt/almostafa-shop && git pull && cd deploy && docker compose up -d --build
```

Database changes are applied automatically on start; they only ever add, never delete.

**See what's happening (logs):**

```bash
docker compose logs --tail 100 api
```

```bash
docker compose logs --tail 100 web
```

**Change the admin password:** edit `ADMIN_PASSWORD` in `.env`, then:

```bash
docker compose up -d api
```

**Restart everything:**

```bash
docker compose restart
```

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Browser says the site can't be reached | DNS not updated yet (Step 3), or ports 80/443 closed (Step 4). |
| No padlock / certificate error | DNS must point to the server **before** Caddy can get a certificate. Check DNS, then `docker compose restart caddy`. |
| Can't log in to admin | Check `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`; after 5 wrong tries the account locks for 15 minutes. |
| Photo upload refused | Not JPEG/PNG/WebP (iPhone HEIC), or larger than 20 MB. |
| `docker compose up --build` stops with "killed" | The server has too little memory; use one with 4 GB RAM. |

## What's stored where

| Data | Location | In backups |
|---|---|---|
| Fabrics, orders, admin account, login sessions | `pgdata` volume (PostgreSQL) | ✅ `db_*.dump` |
| Fabric photos | `uploads` volume | ✅ `uploads_*.tar.gz` |
| HTTPS certificates | `caddy_data` volume | re-issued automatically |
| Settings and passwords | `deploy/.env` | ❌ keep your own copy |
