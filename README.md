# Al-Mostafa — المصطفى

Fine fabrics and bespoke tailoring: a bilingual (Arabic / English) storefront with a private admin area.

| Part | Tech | Folder |
|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript | [`frontend/`](frontend) |
| Backend API | ASP.NET Core (.NET 10), Clean Architecture, EF Core 10 | [`backend/`](backend) |
| Database | PostgreSQL 16 | migrations in `backend/src/AlMostafa.Infrastructure/Persistence/Migrations` |

The Next.js app is frontend-only. All business logic, authentication, validation, persistence and file storage live in
the ASP.NET Core API. The browser talks only to the Next.js origin, which proxies `/api/*` and `/uploads/*` to the API.

## Quick start

Requirements: .NET SDK 10, Node.js 22, PostgreSQL 16 (user `postgres` / password `postgres` on localhost for the
default development settings).

Terminal 1 — API on http://localhost:5080 (API reference at `/docs`):

```bash
cd backend
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='choose-a-password' dotnet run --project src/AlMostafa.API --launch-profile http
```

Terminal 2 — website on http://localhost:3000:

```bash
cd frontend
npm ci
npm run dev
```

Admin area: http://localhost:3000/admin/login (not linked from the customer navigation).

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — structure, modules, database, authentication flow, security, design decisions
- [API reference](docs/API.md) — endpoints, request/response shapes, error codes
- [Local development](docs/DEVELOPMENT.md) — setup, tests, environment variables, migrations, API type generation
- [**Launch guide**](docs/LAUNCH.md) — put the shop online on one server, step by step
- [Production deployment](docs/DEPLOYMENT.md) — topology, reverse proxy, migrations, importing the old JSON data

## Tests

```bash
cd backend
dotnet test
```

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs all of the above plus contract checks (OpenAPI document and generated
TypeScript types up to date, no un-migrated model changes).

## Owner checklist before going live

| Item | Status |
|---|---|
| Real database | ✅ PostgreSQL with migrations — provision a production instance |
| Hashed admin password | ✅ ASP.NET Core Identity (min. 8 characters, lockout after 5 failures) |
| Server-side price calculation | ✅ Orders are priced by the API |
| Real prices and stock | ⚠️ Set in the admin panel, shown in EGP (0 = "upon inquiry" / "by order") |
| Real fabric photos and specifications | ⚠️ Upload photos and fill in composition / width / weight / season / care in the admin panel |
| File storage | ⚠️ Local disk — back it up, or move to object storage for multiple servers |
| Payment | ✅ Cash on delivery, mobile wallet, Visa — arranged by phone when confirming. Online card payment would need a provider (e.g. Paymob) |
| Delivery | ✅ Cairo and Giza. ⚠️ Delivery fees not set yet — checkout says "confirmed by phone" |
| Contact form e-mail | ⚠️ Still a `mailto:` link |
| Size guide meterage | ⚠️ Confirm values in `frontend/src/features/catalog/data/size-guide.ts` |
| Store phone / map link | ⚠️ Fill in `frontend/src/lib/constants/store.ts` |
| Hero / showroom photos | ⚠️ Add `frontend/public/assets/hero/hero.jpg` and `frontend/public/assets/showroom/showroom.jpg` |
| HTTPS + hosting | ✅ Ready: `deploy/` stack with automatic HTTPS and backups — follow [LAUNCH.md](docs/LAUNCH.md) |
