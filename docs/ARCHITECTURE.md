# Architecture

Al-Mostafa is a bilingual (Arabic/English) fabric store with bespoke-tailoring enquiries and a private admin area.
It is split into two independently deployable applications:

```
┌──────────── Browser ────────────┐
│  Next.js pages (React 19)       │
│  fetch("/api/v1/...")           │  same origin, HttpOnly session cookie
└───────────────┬─────────────────┘
                │ HTTPS
        ┌───────▼────────┐  edge reverse proxy (TLS, sets X-Forwarded-For)
        └───────┬────────┘
┌───────────────▼─────────────────┐
│ frontend/  Next.js 16           │  UI only. Rewrites /api/* and /uploads/*
│  - pages, components, features  │  to the backend; proxy.ts guards /admin.
└───────────────┬─────────────────┘
                │ HTTP (private network, API_INTERNAL_URL)
┌───────────────▼─────────────────┐
│ backend/   ASP.NET Core .NET 10 │  All business rules, auth, validation,
│  API → Application → Domain     │  persistence and file storage.
│        Infrastructure ──────────┼──► PostgreSQL 16   ──► uploads directory
└─────────────────────────────────┘
```

**Rule of the split:** the frontend never touches the database, the file system or secrets. Every business decision
(prices, totals, visibility, validation, who is an admin) is made by the backend.

---

## 1. What existed before (Phase 1 inventory)

| Concern | Before the migration | After |
|---|---|---|
| Rendering | Next.js 16, all pages `"use client"` | unchanged |
| Data store | `data/fabrics.json`, `data/orders.json` via `fs` | PostgreSQL + EF Core 10, imported once |
| API | 7 Route Handlers under `app/api/**` | ASP.NET Core minimal APIs under `/api/v1` |
| Auth | One admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, **plain-text compare**, HS256 JWT cookie (12 h) | ASP.NET Core Identity: hashed password, lockout, encrypted cookie (12 h), antiforgery |
| Route guard | `proxy.ts` verified the JWT with a shared secret | `proxy.ts` asks the backend (`/auth/me`) |
| Order pricing | **total and prices sent by the browser were stored as-is** | server re-prices every line from the catalogue |
| Uploads | any file, any size, into `public/uploads/` | images only (magic-byte check), size limit, random names, served at the same `/uploads/*` URLs |
| Validation / rate limiting / logging | none | FluentValidation + domain invariants, per-IP rate limits, Serilog structured logs |
| Server Actions, background jobs, external APIs | none | none (contact form is a `mailto:` link, unchanged) |
| Tests | none | 35 unit + 32 integration (backend) and a scripted browser run |

## 2. Backend (`backend/`)

Clean Architecture with modular-monolith boundaries. Dependencies point inwards only:

```
AlMostafa.API ──► AlMostafa.Application ──► AlMostafa.Domain
      │                    ▲
      └──► AlMostafa.Infrastructure ┘
```

| Project | Responsibility | Depends on |
|---|---|---|
| `AlMostafa.Domain` | Aggregates (`Fabric`, `Order`), value objects (`LocalizedText`, `FabricAttribute`, `FabricPhoto`), invariants, `DomainException` | nothing |
| `AlMostafa.Application` | Use cases (application services), DTOs, request validators, ports (`IFabricRepository`, `IOrderRepository`, `IUnitOfWork`, `IIdentityService`, `IFileStorage`) | Domain, FluentValidation |
| `AlMostafa.Infrastructure` | EF Core `AppDbContext` (+ Identity), configurations, migrations, repositories, Identity adapter, admin seeding, local file storage, legacy JSON importer | Application, EF Core/Npgsql, Identity |
| `AlMostafa.API` | Endpoints, DI composition, cookie auth/authorization, antiforgery, CORS, rate limiting, Problem Details, security headers, Serilog, health checks, OpenAPI | Application, Infrastructure |

### Modules

Each module is a folder in every layer (`Catalog/`, `Ordering/`, `Identity/`, `Media/`).

| Module | Owns | Talks to other modules via |
|---|---|---|
| **Catalog** | fabrics, taxonomy (patterns, categories), search/facets | exposes `ICatalogPricing` |
| **Ordering** | orders, order lines (name/price snapshots), payment methods | consumes `ICatalogPricing` only |
| **Identity** | admin sign-in/out, roles, admin bootstrap | — |
| **Media** | image validation and storage | `IFileStorage` port |

Ordering never queries the fabrics table directly; if Ordering is ever extracted, only `ICatalogPricing` needs a new implementation.

### Key design decisions

| Decision | Why |
|---|---|
| **No MediatR / CQRS pipeline** | ~12 use cases with no cross-cutting pipeline needs. Plain application services are easier to read and debug (MediatR is also commercially licensed now). |
| **Minimal APIs, not controllers** | Endpoints are one-line delegations to application services; route groups give per-module organisation and shared policies. |
| **Repositories, but only two** | They keep Application free of EF Core and hold the PostgreSQL-specific search (`ILIKE`). No generic repository. |
| **Validation in two places, on purpose** | FluentValidation gives field-level 400 errors for the UI; the aggregates still enforce every invariant so no code path can bypass them. |
| **Server-owned taxonomy labels** | Clients send only `pattern`/`category` codes; labels come from `FabricTaxonomy`, so they cannot be spoofed or drift. |
| **No domain events** | Nothing consumes them today. Add an `OrderPlaced` event when e-mail notifications are built (see recommendations). |
| **Order lines have no FK to fabrics** | A line is a historical snapshot (name + price at purchase time) and must survive the fabric being deleted. |
| **Photos as a `jsonb` column** | An ordered list of value objects that is always loaded with its fabric; mapped as an EF Core 10 complex collection. |
| **URL path versioning (`/api/v1`)** | One version today; a route group per version keeps the door open without a versioning library. |

### Error contract

Every error is an RFC 9457 `application/problem+json` body with a stable `code` and the `traceId` that appears in the logs:

```json
{ "status": 400, "title": "One or more validation errors occurred.", "detail": "Name is required.",
  "code": "validation_failed", "errors": { "name": ["Name is required."] }, "traceId": "0HN…" }
```

| Status | `code` examples |
|---|---|
| 400 | `validation_failed`, `name_required`, `bad_request` |
| 401 | `unauthorized`, `invalid_credentials` |
| 403 | `forbidden`, `invalid_csrf_token` |
| 404 | `not_found` |
| 409 | `fabric_unavailable`, `concurrency_conflict` |
| 413 / 415 | `file_too_large`, `unsupported_media_type` |
| 429 | `rate_limited` |
| 500 | `internal_error` (details only in logs) |

## 3. Database

PostgreSQL 16, snake_case naming, schema managed by EF Core migrations (`Infrastructure/Persistence/Migrations`).

```
fabrics (id PK varchar(64) e.g. "fab-001")
  name_ar/en, description_ar/en, price_per_meter numeric(12,2), stock_meters numeric(12,2),
  color, color_label_ar/en, material, material_label_ar/en, pattern, pattern_label_ar/en,
  category, category_label_ar/en, photos jsonb [{src, alt}], hidden, created_at, updated_at
  idx: hidden, created_at

orders (id PK varchar(64))                order_items (id PK identity)
  customer_name, shipping_address,   1──*   order_id FK → orders (cascade)
  payment_method, status, total,            fabric_id (indexed, no FK), fabric_name_ar/en,
  created_at (idx)                          meters numeric(10,2), price_per_meter numeric(12,2)

identity_users / identity_roles / identity_user_roles / … (ASP.NET Core Identity)
data_protection_keys (keys that encrypt session cookies; shared across instances/restarts)
```

Business meanings preserved from the original app: `price_per_meter = 0` → "price upon inquiry";
`stock_meters = 0` → "made to order" (never blocks ordering); first photo = card image, second = hover image.

**Existing data** is imported by `LegacyDataImporter` on startup when `LegacyImport:DataPath` is set: fabrics only while
the table is empty (ids and order preserved), orders by id (existing rows untouched), uploads copied without overwriting.
Source files are only read. See [DEPLOYMENT.md](DEPLOYMENT.md#migrating-the-existing-production-data).

## 4. Authentication flow

```
Browser                    Next.js                         ASP.NET Core
  │ POST /api/v1/auth/login ─rewrite──────────────────────► AuthService → Identity
  │                                                         (hash check, lockout 5×/15 min)
  │ ◄──── 204 Set-Cookie: almostafa_session (HttpOnly, SameSite=Strict, Secure in prod, 12 h)
  │
  │ GET /admin ─────────► proxy.ts ── GET /auth/me (cookie) ─► 200 {roles:[Admin]} / 401
  │                       admin/page.tsx (server) ── same check, then render
  │
  │ GET /api/v1/auth/csrf ───────────────────────────────────► antiforgery token (kept in memory)
  │ POST/PUT/PATCH/DELETE /api/v1/admin/* + X-XSRF-TOKEN ───► Admin policy + antiforgery filter
  │ POST /api/v1/auth/logout ────────────────────────────────► cookie cleared
```

- The session cookie is opaque (Data Protection-encrypted) and never readable by JavaScript; nothing auth-related is in `localStorage`.
- The backend is the only authority: Next.js never decodes the cookie or holds a signing secret.
- The admin account is bootstrapped from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (same variables as before), so the owner's
  existing login keeps working. The password is stored as a salted PBKDF2 hash. Minimum length is 8.
- CSRF: `SameSite=Strict` cookie **plus** an antiforgery token on every state-changing admin request.
- Rate limits per client IP: login 5/min, orders 10/min, everything 300/min (configurable).

## 5. Frontend (`frontend/`)

```
frontend/src/
├── app/                      routes (URLs unchanged) + layout.tsx + providers.tsx
├── features/
│   ├── catalog/              components (FabricCard, FilterSidebar, SizeGuideModal), services, types, size-guide data
│   ├── cart/                 cart context (localStorage, display-only prices)
│   ├── checkout/             orders service
│   ├── admin/                AdminDashboard, FabricForm, admin service
│   └── auth/                 auth service, session.server.ts (server-only session lookup)
├── components/{layout,ui}/   Header, Footer, Icons
├── lib/
│   ├── api/                  client.ts, errors.ts, types.ts, schema.d.ts (generated)
│   ├── preferences/          theme + language providers
│   ├── constants/store.ts    store address / hours / contact
│   └── i18n.ts               UI strings (AR + EN)
└── proxy.ts                  /admin route guard
```

- **One API client** (`lib/api/client.ts`): same-origin calls in the browser, `API_INTERNAL_URL` on the server,
  JSON/FormData bodies, automatic antiforgery header for admin mutations (with one refresh-and-retry), and a single
  `ApiError` type carrying the backend's `code`, field errors and `traceId`. Network failures become `code: "network_error"`.
- **Types come from the backend**: `npm run gen:api` turns `backend/openapi/almostafa-api.json` (generated on every
  backend build) into `src/lib/api/schema.d.ts`. CI fails if they drift (`npm run check:api`).
- **State**: React context only — preferences and cart in `localStorage` (non-sensitive), server data fetched per page.
  No global store is needed at this size.
- **Rendering**: pages remain client components because the language/theme are read from `localStorage` before first
  paint (unchanged UX). The admin page is a Server Component that checks the session on the server.
- The browse page now delegates filtering, search and pagination to the API (debounced), with filter options from
  `/fabrics/facets`; previous results stay on screen while refreshing.

## 6. Security checklist

| Threat | Mitigation |
|---|---|
| Price tampering | Server re-prices every order; client totals/prices ignored (tested). |
| Credential theft / brute force | Hashed passwords, lockout, login rate limit, generic error messages. |
| XSS stealing sessions | HttpOnly cookie; no tokens in `localStorage`; photo `src` must be a site-relative path. |
| CSRF | SameSite=Strict + antiforgery header on admin mutations. |
| Malicious uploads | Magic-byte image check (JPEG/PNG/WebP/GIF/AVIF), size cap, random file names, `nosniff` + sandbox CSP on `/uploads`. |
| Injection | EF Core parameterised queries; `LIKE` wildcards escaped. |
| Information leakage | Problem Details without stack traces; hidden fabrics indistinguishable from missing ones. |
| Spoofed client IPs | Forwarded headers trusted only from configured proxies; edge proxy must overwrite `X-Forwarded-For` (see DEPLOYMENT.md). |
| Secrets | None in the repo. Connection string, admin credentials via environment variables. |
