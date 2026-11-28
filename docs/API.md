# API reference

Base path: `/api/v1`. JSON uses camelCase. Errors are Problem Details (see [ARCHITECTURE.md](ARCHITECTURE.md#error-contract)).
The machine-readable contract is [`backend/openapi/almostafa-api.json`](../backend/openapi/almostafa-api.json)
(OpenAPI 3.1, regenerated on every backend build). In Development an interactive reference is served at
`http://localhost:5080/docs` and the raw document at `/openapi/v1.json`.

## Public

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/fabrics` | Visible fabrics. Query: `search`, `colors[]`, `patterns[]`, `materials[]`, `categories[]` (repeat the key for several values), `sort` = `default`\|`newest`\|`name`\|`priceAsc`\|`priceDesc`, `page` (≥1), `pageSize` (1–100, default 24) | 200 `PagedResult<FabricDto>` |
| GET | `/fabrics/facets` | Distinct colour / pattern / material values among visible fabrics, plus the 4 categories | 200 `FabricFacetsDto` |
| GET | `/fabrics/{id}` | One visible fabric | 200 `FabricDto`, 404 |
| GET | `/orders/options` | Delivery governorates (`cairo`, `giza`) and payment methods (`cod`, `wallet`, `card`) with Arabic/English labels | 200 `CheckoutOptionsDto` |
| POST | `/orders` | Place an order. Body: `{ items: [{ fabricId, meters }], name, phone, email?, governorate, area, address, paymentMethod }`. `phone` must be an Egyptian mobile (010/011/012/015; Arabic digits and +20 accepted) and is stored as `+201XXXXXXXXX`. Prices and total are computed by the server; delivery fee is confirmed by phone. Rate-limited. | 201 `{ orderId, total, createdAt }`, 400, 409 `fabric_unavailable`, 429 |

`PagedResult<T>` = `{ items: T[], page, pageSize, totalCount, totalPages }`.

## Authentication

| Method | Path | Description | Success |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }`. Sets the HttpOnly session cookie. Rate-limited. | 204, 400, 401 `invalid_credentials`, 429 |
| POST | `/auth/logout` | Clears the session. | 204 |
| GET | `/auth/me` | Current user `{ email, roles }`. | 200, 401 |
| GET | `/auth/csrf` | Antiforgery token `{ token, headerName }` for admin mutations. Admin only. | 200, 401 |

## Admin (role `Admin`; mutations require header `X-XSRF-TOKEN`)

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/admin/fabrics` | All fabrics incl. hidden. Same query parameters as `/fabrics`. | 200 `PagedResult<FabricDto>` |
| GET | `/admin/fabrics/{id}` | One fabric incl. hidden. | 200, 404 |
| POST | `/admin/fabrics` | Create. Body `UpsertFabricRequest` (below). Id is generated (`fab-xxxxxxxxxxxx`). | 201 + `Location`, 400 |
| PUT | `/admin/fabrics/{id}` | Replace editable fields. | 200, 400, 404 |
| PATCH | `/admin/fabrics/{id}/visibility` | `{ hidden: boolean }` | 200, 404 |
| DELETE | `/admin/fabrics/{id}` | Delete. Past orders keep their snapshots. | 204, 404 |
| GET | `/admin/orders` | Orders newest first. Query `page`, `pageSize`. | 200 `PagedResult<OrderDto>` |
| POST | `/admin/uploads` | `multipart/form-data`, field `file`. JPEG/PNG/WebP/GIF/AVIF up to `Media:MaxUploadBytes` (8 MB). | 201 `{ url: "/uploads/<hex>.<ext>" }`, 413, 415 |

`UpsertFabricRequest`:

```json
{
  "nameAr": "صوف", "nameEn": "Wool",            // at least one required, ≤ 200
  "descriptionAr": "", "descriptionEn": "",       // ≤ 4000
  "pricePerMeter": 0, "stockMeters": 0,           // ≥ 0; 0 = upon inquiry / made to order
  "color": "navy", "colorLabel": { "ar": "كحلي", "en": "Navy" },
  "material": "wool", "materialLabel": { "ar": "صوف", "en": "Wool" },
  "pattern": "plain",                             // plain | checks | stripes | other (label is server-owned)
  "category": "suit",                             // suit | jacket | trousers | coat (label is server-owned)
  "photos": [{ "src": "/uploads/abc.jpg", "alt": "…" }],   // ≤ 12, site-relative paths only
  "hidden": false,
  // Optional specifications — shown on the product page only when filled in:
  "compositionAr": "", "compositionEn": "100% Wool, Super 120s",
  "widthCm": 150,                                 // 50–400
  "weightGsm": 260,                               // grams per metre, 50–1500
  "season": "autumn-winter",                      // all-season | spring-summer | autumn-winter
  "careAr": "", "careEn": "Dry clean only"
}
```

## Other

| Path | Description |
|---|---|
| `GET /health` | Liveness + database check (`Healthy` / `Unhealthy`). |
| `GET /uploads/{file}` | Uploaded photos (immutable, long-cached). |
