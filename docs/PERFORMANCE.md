# Performance and data architecture

How data is stored, queried, cached, transferred and displayed, what was measured, and how to keep it fast.

## 1. How data moves

```
Browser ──HTTPS──► Caddy (gzip/zstd) ──► Next.js server ──► ASP.NET Core API ──► PostgreSQL
                                          │  renders pages with   │  output cache      │  indexes:
                                          │  data (SSR)           │  (public GETs)     │  trigram search,
                                          │  /api, /uploads ──────┘                    │  created_at, PKs
                                          └─ static JS/CSS/fonts (long-cached)
Uploaded photos: API writes 480 / 960 / ≤2000 px WebP to the uploads volume, the untouched original to a private volume.
```

| Page | Data path |
|---|---|
| Home, fabric list, fabric page | Fetched **on the Next.js server** during rendering and sent inside the HTML (no browser→API round trip before content appears). |
| Filters, search, "load more" | Browser → `/api/v1/fabrics?...` (debounced 250 ms, previous request cancelled, previous results stay visible). |
| Search suggestions | Browser → same endpoint with `pageSize=6` (debounced 200 ms, 2+ characters). |
| Cart | Browser only (localStorage). Prices shown are snapshots; the server re-prices at checkout. |
| Checkout | One POST with an `Idempotency-Key`; one database transaction. |
| Admin | Browser → `/api/v1/admin/*`, never cached. |

## 2. Measurements

Realistic test catalogue: **2,000 fabrics** (8% hidden, two photos each, 40 distinct 12-megapixel phone photos)
and 3,000 orders, on the production Docker stack (Caddy → Next.js → API → PostgreSQL) on one machine.
Lighthouse 12, mobile preset (simulated slow 4G, 4× CPU slowdown), median of 3 runs.

### Customer-perceived speed (Lighthouse mobile)

| Page | | Score | LCP | TBT | CLS | Bytes | Images |
|---|---|---|---|---|---|---|---|
| Fabric list | before | 61 | **10.59 s** | 407 ms | 0.127 | 3,623 KB | 3,379 KB |
| | after | **94** | **2.86 s** | 132 ms | **0.000** | 544 KB | 302 KB |
| Fabric page | before | 86 | 3.48 s | 212 ms | 0.125 | 584 KB | 339 KB |
| | after | **99** | **2.11 s** | 84 ms | **0.001** | 485 KB | 248 KB |
| Home (placeholder hero) | before | 90 | 2.25 s | 321 ms | 0.000 | 1,121 KB | 876 KB |
| | after | 94 | 2.95 s | 86 ms | 0.000 | 537 KB | 297 KB |
| Home (real 2.2 MB hero photo) | after | **98** | **2.31 s** | — | 0.000 | 436 KB | — |

LCP = time until the main content is visible; TBT = time the page is unresponsive; CLS = layout jumping (< 0.1 is good).

Why the home page with the *placeholder* is slower than before: the placeholder SVG now competes with the
server-rendered content and fonts for bandwidth. It only exists until the owner adds `hero.jpg`; with a real photo the
page reaches 2.31 s while downloading 36 KB for the hero on a phone instead of the 2.2 MB original.

### API (10 concurrent visitors, full path through Caddy and Next.js)

| Endpoint | p50 before → after | p99 before → after | Requests/s | Response size |
|---|---|---|---|---|
| Listing (24) | 24 → 13 ms | 57 → 37 ms | 386 → 629 | 31.2 → 18.1 KB |
| Search "navy" | **75 → 9 ms** | 160 → 26 ms | 127 → 909 | 31.1 → 17.9 KB |
| Search "كشمير" | **73 → 10 ms** | 135 → 25 ms | 131 → 913 | 31.8 → 18.5 KB |
| Combined filters + sort | 20 → 10 ms | 43 → 26 ms | 456 → 888 | 21.2 → 12.4 KB |
| Filter options | 34 → 8 ms | 85 → 22 ms | 269 → 1,059 | 1.9 KB |
| Fabric | 11 → 8 ms | 20 → 22 ms | 878 → 1,097 | 1.7 KB |
| Place order | 9 → 10 ms | 18 → 25 ms | 404 → 334 | — |

Uncached search (every query different, one visitor): median **3.7 ms**, max 6 ms (was 24 ms).

### Database at 10× the catalogue (20,000 fabrics)

| Query | Before | After |
|---|---|---|
| Search "navy" (count) | 219 ms, sequential scan of 12 columns | **13 ms**, trigram index |
| Default listing page | 0.19 ms (index on created_at) | unchanged |
| Combined filters | 10 ms | unchanged (sequential scan; fine at this size) |

### Resources (idle after load test)

API 154 MB · website 90 MB · PostgreSQL 68 MB · Caddy 19 MB — about 330 MB in total.
Photo upload (12 MP, 2 MB JPEG → three WebP sizes + original): about 1.2 s.

## 3. Database

PostgreSQL 16. The catalogue is a single `fabrics` table on purpose: the shop sells fabric by the metre, so the fabric
*is* the product. There are no separate product, customer-account or inventory tables because the business has none;
add them when the business needs them (see Future improvements).

| Decision | Reason |
|---|---|
| Colour / material / pattern / category stored as code + bilingual label columns on `fabrics` (not lookup tables) | Every listing needs them; lookups would add four joins to the hottest query for no benefit at this size. Pattern and category labels are server-owned, so they cannot drift. |
| `photos` as `jsonb` | Ordered list always read with its fabric. |
| `search_text` (derived column) | All searchable text, normalised once on save, so search is one indexed predicate instead of 12 `ILIKE`s. |
| `order_items` without FK to `fabrics` | Lines are snapshots (name, price) and must survive fabric deletion. |

### Indexes

| Index | Serves |
|---|---|
| `pk_fabrics (id)` | fabric page, order pricing (`IN (...)`) |
| `ix_fabrics_created_at` | default catalogue order, admin list |
| `ix_fabrics_search_text_trgm` (GIN, `gin_trgm_ops`) | search and suggestions (`ILIKE '%…%'`, 3+ characters) |
| `pk_orders`, `ix_orders_created_at` | admin order list (newest first) |
| `ux_orders_idempotency_key` (unique, partial) | duplicate-submission protection |
| `ix_order_items_order_id` | loading an order's lines |

Removed: `ix_fabrics_hidden` (a boolean is never selective enough to be used) and `ix_order_items_fabric_id`
(never queried; cost on every order). No index on colour/material/category: at 20,000 fabrics a filtered scan takes
10 ms and the cache absorbs repeats. Revisit when the catalogue passes ~50,000 fabrics (a composite partial index
`(category, created_at) WHERE NOT hidden` would be the first to add).

### Access patterns

- Listings project only card columns in SQL (`FabricSummaryDto`: no descriptions, specifications or search text).
- Count + page = 2 queries per listing; facets = 3 small `GROUP BY` queries; similar fabrics = 1 ranked query with `LIMIT`.
- Order placement = 1 lookup of the requested fabrics (`IN`) + 1 transaction for the order and its lines.
- No N+1 patterns: order lines load in a split query; nothing loads per row.
- Connections are pooled by Npgsql (default pool, `DISCARD ALL` on return); every query is async with cancellation.

## 4. Search

- Normalisation (`SearchText.Normalize`, used both when saving and when searching): Arabic أ/إ/آ/ٱ → ا, ى → ي,
  ة → ه, ؤ → و, ئ → ي, diacritics and tatweel removed, Arabic-Indic digits → 0-9, lower-case, single spaces.
  So "أزرق", "ازرق" and "اَزْرَق" find the same fabrics.
- Covers names, descriptions, colour/material/pattern/category labels and composition, in both languages.
- `LIKE` wildcards in the query are escaped; queries are capped at 100 characters.
- PostgreSQL's trigram index is sufficient up to hundreds of thousands of fabrics. A dedicated search engine is not
  justified. Consider PostgreSQL full-text ranking (or an engine) only if relevance ordering, typo tolerance or
  synonyms become requirements.

## 5. Caching

| Layer | What | Freshness |
|---|---|---|
| API output cache (in memory, 64 MB cap) | `GET /fabrics`, `/fabrics/facets`, `/fabrics/{id}`, `/fabrics/{id}/similar`, `/orders/options` | Evicted **immediately** on any fabric create/update/hide/delete (tag `catalog`); 10-minute safety expiry. |
| Next.js server | Catalogue fetches use `no-store` | Always reads the API cache, so there is exactly one place to invalidate. |
| Browser | `/_next/static/*` 1 year immutable · `/uploads/*` 1 year immutable (random names) · `/fonts/*` 1 year · logos/placeholders 1 day | Changing a photo creates a new file name; fonts are never edited in place. |
| Next.js image optimizer | Hero/showroom/logo WebP renditions | Rebuilt per deployment (cache lives in the container). |

Never cached: anything under `/admin` or `/auth`, order placement, responses to signed-in requests (the output cache
skips authenticated requests and responses that set cookies), the cart. Public catalogue responses contain no
customer data, so a shared cache cannot leak private information.

Redis or a distributed cache is not needed while there is one API instance. With several instances, move the output
cache to Redis (`AddStackExchangeRedisOutputCache`) so evictions reach every instance.

## 6. Images

| Stored | Where | Served |
|---|---|---|
| `<name>-480.webp`, `<name>-960.webp`, `<name>.webp` (long edge ≤ 2000 px) | `uploads` volume | `/uploads/*`, cached 1 year |
| Untouched original (`<name>.jpg/.png/.webp`) | `originals` volume | never (may contain GPS data); backed up weekly |

- Every upload is decoded, rotated upright, scaled and re-encoded, which removes EXIF/GPS metadata.
- Pages use `srcset` + `sizes`, so a phone grid downloads the 480 or 960 px file, never the 2000 px one.
- The first visible cards and the fabric page's main photo load with high priority; everything else is lazy-loaded.
- Fixed aspect-ratio frames mean images never shift the layout.
- Photos stored before sizes existed get their sizes from a background job at start-up (additive only).
- The home hero/showroom photos (`frontend/public/assets/...`) go through the Next.js image optimizer.
  They must be in the repository **before** building: Next.js only serves `public/` files present at build time.

## 7. Orders

- One transaction: order + lines are saved together or not at all.
- Prices, names and totals come from the catalogue on the server; hidden or deleted fabrics are refused (409).
- `Idempotency-Key`: the checkout page sends one UUID per attempt. A repeat (double tap, retry) returns the original
  order (HTTP 200) instead of creating another; simultaneous repeats are resolved by the unique index.
- Stock is not decremented: `stock_meters = 0` means "made to order" and every order is confirmed by phone. If stock
  should be reserved at order time, that is a business decision (decrement inside the same transaction, release on
  cancellation).

## 8. Monitoring

- Every request is logged with method, path, status and duration (JSON in production).
- Database commands slower than 200 ms (`Database__SlowQueryMilliseconds`) are logged as warnings with their SQL text
  (placeholders only, never parameter values). Expect a few right after a restart while PostgreSQL's memory cache is
  cold; repeated warnings for the same query mean it needs attention.
- Health: `GET /health` (API + database).

Useful commands on the server (from `deploy/`):

```bash
docker compose logs api | grep "Slow database command"
```

```bash
docker stats --no-stream
```

## 9. Scalability

| Growth | Holds until | Next step |
|---|---|---|
| Fabrics | ~100k+ (indexed search, paged lists, cached facets) | composite filter indexes; full-text ranking |
| Visitors | one 2 vCPU / 4 GB server serves hundreds of catalogue requests per second from cache | CDN in front of Caddy for `/uploads` and static files |
| Photos | disk size | move `IFileStorage` to object storage (S3 / R2) + CDN |
| Orders | millions (indexed by date, paged) | archive old orders if needed |
| API instances | 1 (in-memory cache, local photos) | Redis output cache + object storage, then add instances |

Candidates for separate services, only if load proves it: image processing (a queue + worker) and search.
Everything else should stay in the modular monolith.

## 10. Future improvements (not done)

1. **CDN** (e.g. Cloudflare) in front of the site: the biggest remaining win for visitors far from the server.
2. **Two-column phone grid** (design change): halves the photo bytes per screen on phones.
3. **Stock reservation** at order time, if the business wants it.
4. **Composite filter index** once the catalogue passes ~50,000 fabrics.
5. Detail-page query reads the full row including `search_text`; harmless while cached, project it out if it ever
   shows up in the slow-query log.

## 11. How to re-measure

The scripts used for the numbers above (seed 2,000 fabrics, API load test with autocannon, Lighthouse runs) are simple
to recreate: run the `deploy/` stack, insert test fabrics, then

```bash
npx lighthouse https://your-domain/fabrics --only-categories=performance --preset=perf
```

Never run load tests against the production database; use a copy.
