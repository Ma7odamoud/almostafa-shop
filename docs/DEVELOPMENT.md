# Local development

## Prerequisites

- .NET SDK 10.0.1xx (`backend/global.json`)
- Node.js 22 + npm
- PostgreSQL 16 (local install or `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`)

## 1. Backend

```bash
cd backend
dotnet tool restore
```

The admin account is created on first start from these variables (use your own values):

```bash
export ADMIN_EMAIL=you@example.com
export ADMIN_PASSWORD='at-least-8-characters'
```

```bash
dotnet run --project src/AlMostafa.API --launch-profile http
```

In Development (`appsettings.Development.json`) the API:
- listens on `http://localhost:5080`,
- connects to `Host=localhost;Database=almostafa;Username=postgres;Password=postgres` — override with the
  `ConnectionStrings__Database` environment variable or `dotnet user-secrets`,
- applies migrations automatically and imports the sample fabrics from `backend/data/legacy/`,
- stores uploads in `backend/data/uploads/` (git-ignored),
- serves the API reference at `http://localhost:5080/docs`.

## 2. Frontend

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. The admin area is at <http://localhost:3000/admin/login>.
All `/api/*` and `/uploads/*` requests are proxied to `API_INTERNAL_URL` by Next.js rewrites.

## Tests and checks

```bash
cd backend
dotnet test
```

Integration tests create and drop a temporary database per test class. They connect to `localhost` as
`postgres`/`postgres` unless `TEST_DATABASE` is set (an Npgsql connection string without `Database=`).

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Changing the API contract

1. Change DTOs / endpoints in the backend and run `dotnet build` — this rewrites `backend/openapi/almostafa-api.json`.
2. Regenerate the TypeScript types:
   ```bash
   cd frontend
   npm run gen:api
   ```
3. Commit both files. CI fails if either is stale.

## Database migrations

After changing an entity or its configuration:

```bash
cd backend
dotnet ef migrations add <DescriptiveName> --project src/AlMostafa.Infrastructure --startup-project src/AlMostafa.API --output-dir Persistence/Migrations
```

Review the generated migration before committing — make sure it never drops a column or table that holds data
without an explicit data-migration step. CI fails if the model has changes without a migration.

## Environment variables

### Backend (ASP.NET Core configuration; `__` = section separator)

| Variable | Default | Purpose |
|---|---|---|
| `ConnectionStrings__Database` | — (**required**) | Npgsql connection string |
| `ADMIN_EMAIL` | — | Admin account to bootstrap (also `Admin__Email`) |
| `ADMIN_PASSWORD` | — | Its password. Updates the stored hash if changed; may be removed after first start (also `Admin__Password`) |
| `ASPNETCORE_ENVIRONMENT` | `Production` | `Development` enables the dev settings above |
| `ASPNETCORE_URLS` | `http://localhost:5000` | Listen address, e.g. `http://0.0.0.0:8080` on a server |
| `Database__MigrateOnStartup` | `false` (`true` in Development) | Apply pending migrations at startup |
| `Auth__CookieName` | `almostafa_session` | Session cookie name (keep in sync with the frontend) |
| `Auth__SecureCookies` | `true` outside Development | Mark cookies `Secure` |
| `Cors__AllowedOrigins__0` | none | Only needed if browsers call the API host directly |
| `ForwardedHeaders__KnownProxies__0` / `ForwardedHeaders__KnownNetworks__0` | loopback only | Proxies allowed to set `X-Forwarded-For` |
| `RateLimiting__GlobalPerMinute` / `LoginPerMinute` / `OrdersPerMinute` | 300 / 5 / 10 | Per-IP limits |
| `Media__MaxUploadBytes` | 8388608 | Upload size limit |
| `Storage__UploadsPath` | `data/uploads` | Upload directory (relative to the content root) |
| `LegacyImport__DataPath` / `LegacyImport__UploadsPath` | empty | One-time import of the old JSON store / uploads |
| `Serilog__MinimumLevel__Default` | `Information` | Log level (JSON logs to stdout in Production) |

### Frontend

| Variable | Default | Purpose |
|---|---|---|
| `API_INTERNAL_URL` | `http://localhost:5080` | Backend URL as seen by the Next.js server. **Read at build time** (rewrites) and runtime. |
| `SESSION_COOKIE_NAME` | `almostafa_session` | Must match `Auth__CookieName` |

The frontend holds no secrets and exposes no `NEXT_PUBLIC_*` variables.
