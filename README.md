# Al-Mostafa — Project README

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env.local` and set your values:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local`:
   - `ADMIN_EMAIL` — your admin email
   - `ADMIN_PASSWORD` — your admin password (plain text for now — see PRODUCTION NOTE)
   - `JWT_SECRET` — a long random string (at least 32 characters)

3. **Run in development**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Admin area**
   Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   Sign in with the credentials you set in `.env.local`.

---

## ⚠️ DEMO MODE — What needs to be confirmed

| Item | Status |
|------|--------|
| Real prices | Not set — set in admin panel |
| Real stock | Not set — set in admin panel |
| Real fabric photos | Not provided — upload in admin panel |
| Payment methods | ⚠️ NOT DECIDED — owner to confirm |
| Contact details | ⚠️ NOT PROVIDED — add to contact page |
| Database (production) | ⚠️ Using local JSON file — choose real DB for live site |
| File storage (production) | ⚠️ Using local disk — choose cloud storage for live site |
| Admin password security | ⚠️ Plain text in .env — use hashed passwords for production |
| Ivory shade | Proposal: #FFFFF0 — owner to confirm (change in globals.css) |
| Website fonts | Using Cormorant Garamond + Amiri as proposal — owner to choose |
| Size guide meterage | ⚠️ All zeros — owner must fill in lib/demoData.ts |
| Minimum cut length | ⚠️ Not confirmed |
| Fabric page structure | ⚠️ Browse + single-view on separate pages — owner to confirm |
| Payment service | ⚠️ Not chosen — online payment needs a provider |

---

## Project Structure

```
app/
  page.tsx              — Home page
  fabrics/
    page.tsx            — Fabric browse + filter
    [id]/page.tsx       — Single fabric view
  cart/page.tsx         — Cart
  payment/page.tsx      — Payment (demo)
  contact/page.tsx      — Contact
  admin/
    login/page.tsx      — Admin login (not in customer nav)
    page.tsx            — Admin dashboard
    AdminDashboardClient.tsx
    FabricForm.tsx
  api/
    fabrics/            — Public fabric API
    orders/             — Order API (demo)
    admin/
      auth/             — Admin login/logout API
      fabrics/          — Admin CRUD API
      upload/           — Photo upload API
      orders/           — Admin orders API
components/
  Providers.tsx         — Theme + Language + Cart context
  Header.tsx
  Footer.tsx
  FabricCard.tsx
  FilterSidebar.tsx
  SizeGuideModal.tsx
lib/
  i18n.ts              — All UI translations (AR + EN)
  demoData.ts          — Demo fabrics + size guide (OWNER: replace)
  db.ts                — File-based demo database
  auth.ts              — JWT auth helpers
middleware.ts           — Admin route protection (server-side)
data/
  fabrics.json         — Generated on first run from demoData.ts
  orders.json          — Generated on first order
public/
  logo-dark.jpg        — Dark theme logo
  logo-light.jpg       — Light theme logo
  uploads/             — Uploaded fabric photos (admin)
```

---

## Production Checklist (before going live)

- [ ] Choose a real database (PostgreSQL/Supabase/MongoDB) and migrate data from `data/fabrics.json`
- [ ] Choose cloud file storage (Cloudflare R2, AWS S3, Supabase Storage) for fabric photos
- [ ] Choose a payment provider and implement real payment flow
- [ ] Hash admin password (use bcrypt or Argon2 instead of plain text)
- [ ] Set a strong random `JWT_SECRET`
- [ ] Add real contact details to the contact page
- [ ] Replace all demo fabric data with real products
- [ ] Set real prices and stock for all fabrics
- [ ] Fill in size guide meterage in `lib/demoData.ts`
- [ ] Remove demo banners when moving to production
- [ ] Configure email for the contact form
- [ ] Set up SSL / HTTPS on the server
- [ ] Add `noindex` protection for admin routes (already set)
