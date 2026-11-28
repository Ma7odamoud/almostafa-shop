# Production deployment

> **Recommended path:** the ready-made single-server stack in [`deploy/`](../deploy) (Docker Compose: PostgreSQL,
> API, website and Caddy with automatic HTTPS, plus `backup.sh` / `restore.sh`). Step-by-step instructions:
> [LAUNCH.md](LAUNCH.md). The rest of this page explains the moving parts for custom setups.

## Topology

```
Internet ──HTTPS──► reverse proxy (Caddy / nginx / cloud LB)
                         │  overwrites X-Forwarded-For, terminates TLS
                         ▼
                   Next.js  (next start, :3000)  ──private network──►  ASP.NET Core API (:8080)  ──► PostgreSQL 16
                                                                              │
                                                                              └─► uploads volume (persistent disk)
```

- Only the reverse proxy is public. Expose **only** Next.js through it; the API is reached by Next.js over the private network.
- Run **one** API instance while uploads use local disk (or mount a shared volume). For several instances, implement
  `IFileStorage` for object storage (S3 / Cloudflare R2 / Azure Blob); sessions are already shared through the database.

## Reverse proxy requirement: client IP

Next.js rewrites forward whatever `X-Forwarded-For` the client sent and do not add the client's IP. Rate limiting is
per client IP, so **the edge proxy must overwrite the header** with the real address. The API trusts only the
right-most entry from a known proxy (by default the loopback address, i.e. Next.js on the same host).

nginx:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;   # overwrite, never append the client's value
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Caddy (`reverse_proxy` sets `X-Forwarded-For` from the real peer by default and ignores untrusted client values):

```
shop.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

If Next.js and the API run on different hosts/containers, add the Next.js address to
`ForwardedHeaders__KnownProxies__0` (or its subnet to `ForwardedHeaders__KnownNetworks__0`) on the API.

## Backend

```bash
cd backend
dotnet publish src/AlMostafa.API -c Release -o /srv/almostafa/api
```

Run with (example values — keep real ones in your secret store, not in files in git):

```bash
ASPNETCORE_ENVIRONMENT=Production \
ASPNETCORE_URLS=http://0.0.0.0:8080 \
ConnectionStrings__Database='Host=db;Database=almostafa;Username=almostafa_app;Password=<secret>' \
ADMIN_EMAIL=<owner email> ADMIN_PASSWORD=<owner password> \
Storage__UploadsPath=/var/lib/almostafa/uploads \
dotnet /srv/almostafa/api/AlMostafa.API.dll
```

- Use a database role that owns only this database. Production defaults: secure cookies, HSTS, JSON logs on stdout,
  no OpenAPI UI.
- **Data Protection keys** (which encrypt the session cookie and antiforgery tokens) are stored in the
  `data_protection_keys` table, so sessions survive restarts and are shared by all API instances. Treat database
  backups as sensitive for that reason.
- Health check for the orchestrator / load balancer: `GET /health`.

## Frontend

```bash
cd frontend
npm ci
API_INTERNAL_URL=http://api.internal:8080 npm run build
API_INTERNAL_URL=http://api.internal:8080 npm run start
```

`API_INTERNAL_URL` must be set **at build time** (it is compiled into the rewrites) and at runtime (used by `proxy.ts`
and server components).

## Database migration process

Never let a production deployment change the schema implicitly. Recommended flow per release:

1. Generate an idempotent SQL script from the migrations in the release:
   ```bash
   cd backend
   dotnet tool restore
   dotnet ef migrations script --idempotent --project src/AlMostafa.Infrastructure --startup-project src/AlMostafa.API -o migrate.sql
   ```
2. Review it, **back up the database** (`pg_dump -Fc`), then apply it:
   ```bash
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrate.sql
   ```
   The script is wrapped in a transaction per migration and is safe to re-run.
3. Deploy the new API version.

Alternatively set `Database__MigrateOnStartup=true` for a single-instance deployment; pending migrations are then
applied when the API starts.

## Migrating the existing production data

The previous version stored data on the web server's disk: `data/fabrics.json`, `data/orders.json` and photos in
`public/uploads/`. Nothing below deletes or modifies those files.

1. Back up the old `data/` and `public/uploads/` directories.
2. Copy them somewhere the API can read, e.g. `/srv/almostafa/legacy/data` and `/srv/almostafa/legacy/uploads`.
3. Start the API once with:
   ```bash
   LegacyImport__DataPath=/srv/almostafa/legacy/data
   LegacyImport__UploadsPath=/srv/almostafa/legacy/uploads
   ```
   - fabrics are imported if the `fabrics` table is empty (ids such as `fab-001`, order and hidden flags preserved),
   - orders are imported by id (re-running never duplicates them; legacy status `demo-pending` becomes `pending`),
   - photos are copied into `Storage__UploadsPath` without overwriting, so stored `/uploads/...` URLs keep working,
   - every skipped record is logged with the reason.
4. Check the log lines `Imported N of M legacy fabrics` / `Imported N legacy orders`, verify the admin panel, then
   remove the two `LegacyImport__*` variables.

The admin keeps logging in with the same `ADMIN_EMAIL` / `ADMIN_PASSWORD`; the password must be at least 8 characters.
Existing browser sessions from the old JWT cookie are not carried over — the admin signs in once after the switch.

## Backups

Back up together and on the same schedule: the PostgreSQL database (`pg_dump`) and the uploads directory.
