# 1Fi Marketplace

A production-grade, full-stack **EMI marketplace** built for the 1Fi SDE Intern assignment. It adds a **“1Fi Marketplace”** tab to the 1Fi Shop page where shoppers browse products and pay via **mutual-fund-backed EMI plans** — dynamic product pages, selectable EMI plans, real backend API, real database.

The UI matches the 1Fi app design language (brand purple `#712CDC`, rounded cards, mobile app shell). Product, variant, pricing, image and EMI data are **served from a PostgreSQL database via a typed REST API** — nothing is hardcoded.

> **Reference target:** an EMI product page like Snapmint — product details, a list of selectable EMI plans (monthly amount, tenure, interest, cashback), and a proceed action.

---

## ✨ Highlights

- **Correct EMI engine** — EMI plans are stored as *templates* (tenure + rate + cashback). The monthly instalment is **computed from the selected variant’s real price**, both on the server and (instantly) on the client when you switch variants.
- **Type-safe end to end** — TypeScript everywhere, Zod validation at every boundary (env, requests, and API responses on the client).
- **Layered backend** — `route → controller → service → repository → Prisma`, centralised errors, structured logging, security middleware, Swagger docs, integration tests.
- **Server-rendered product pages** — unique URLs (`/products/apple-iphone-16-pro`), SSR + per-product SEO metadata.
- **Self-hosted images** — product images are stored in Postgres and served through the API, so the demo has **no broken CDN links**.
- **Polished, animated UI** — Framer Motion transitions, skeleton loading, empty/error states, a bottom-sheet checkout, full keyboard/a11y support.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · TanStack Query · Zod |
| Backend | Node.js · Express · TypeScript · Zod · Pino |
| Database | PostgreSQL · Prisma ORM (schema, migrations, seed) |
| Tooling | ESLint · Prettier · Vitest + Supertest · Docker Compose · GitHub Actions CI |
| Deploy | Vercel (frontend) · Render (backend + managed Postgres) |

---

## 📂 Monorepo layout

```
1FI_Marketplace/
├─ backend/                 # Express + Prisma API
│  ├─ prisma/               # schema.prisma · migrations · seed.ts
│  └─ src/
│     ├─ config/            # Zod-validated env (fail-fast)
│     ├─ db/                # Prisma client singleton
│     ├─ lib/               # logger · AppError · asyncHandler · http envelope
│     ├─ middleware/        # error · notFound · rate-limit
│     ├─ modules/
│     │  ├─ products/       # routes · controller · service · repository · schema
│     │  ├─ emi/            # EMI computation engine
│     │  └─ images/         # image streaming from Postgres
│     ├─ docs/              # OpenAPI spec (Swagger UI)
│     ├─ app.ts             # express assembly
│     └─ server.ts          # bootstrap + graceful shutdown
├─ frontend/                # Next.js app
│  └─ src/
│     ├─ app/               # /shop · /products/[slug] · layout · providers
│     ├─ components/        # ui · layout · shop · marketplace · product
│     ├─ hooks/             # useProducts · useDebounce
│     ├─ lib/               # api client · emi mirror · format · cn
│     └─ schemas/           # Zod schemas + inferred types
├─ docker-compose.yml       # local PostgreSQL
└─ .github/workflows/ci.yml # lint · typecheck · test · build
```

---

## 🗄️ Database schema

Defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) and applied via Prisma Migrate.

| Table | Key columns |
|---|---|
| `products` | `id, name, slug (unique), brand, category, description, mrp, is_active, image_id → images` |
| `product_variants` | `id, product_id → products, label, storage, color, hex_color, finish, price, stock, image_id → images` |
| `emi_plans` | `id, product_id → products, tenure_months, interest_rate, cashback_amount, cashback_label, is_recommended` · unique `(product_id, tenure_months)` |
| `images` | `id, source_key (unique), mime_type, data (bytea), byte_size` — raw image bytes served by the API |

```prisma
model EmiPlan {
  id             String  @id @default(uuid())
  productId      String  @map("product_id")
  tenureMonths   Int     @map("tenure_months")
  interestRate   Decimal @default(0) @map("interest_rate") @db.Decimal(5, 2) // 0 = no-cost
  cashbackAmount Decimal @default(0) @map("cashback_amount") @db.Decimal(12, 2)
  cashbackLabel  String? @map("cashback_label")
  isRecommended  Boolean @default(false) @map("is_recommended")
  product        Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([productId, tenureMonths])
}
```

**Seed data** (3 products, 10 variants, 15 EMI plans):

| Product | Variants | EMI plans |
|---|---|---|
| Apple iPhone 16 Pro | 4 (Black / White / Desert / Natural Titanium) | 3, 6★, 9, 12 @ 0% · 24 @ 10.5% |
| Samsung Galaxy S24 Ultra | 4 (Black / Gray / Violet / Yellow) | 3, 6★, 9, 12 @ 0% · 24 @ 10.5% |
| Sony WH-1000XM5 | 2 (Black / Platinum Silver) | 3, 6★, 9, 12 @ 0% · 18 @ 10.5% |

★ = recommended plan (carries cashback). Every product has both **no-cost (0%)** and **interest-bearing (10.5% reducing balance)** plans.

---

## 🔌 API reference

Base URL: `http://localhost:4000`. All endpoints return a consistent envelope: `{ "success": true, "data": ..., "meta"?: ... }` or `{ "success": false, "error": ... }`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness + uptime |
| GET | `/api/v1/products` | List products — `?search= &category= &page= &limit= &sort=newest\|price_asc\|price_desc` |
| GET | `/api/v1/products/:slug` | Full product detail (variants + computed EMI plans) |
| GET | `/api/v1/products/:slug/emi?variantId=` | EMI plans recomputed for a specific variant |
| GET | `/api/v1/images/:id` | Stream a stored image (1-yr cache + ETag) |
| GET | `/api/docs` | Interactive Swagger UI |

### Example — `GET /api/v1/products`

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2…",
      "name": "Sony WH-1000XM5",
      "slug": "sony-wh-1000xm5",
      "brand": "Sony",
      "category": "audio",
      "imageUrl": "/api/v1/images/2f1c…",
      "mrp": 29990,
      "minPrice": 26990,
      "maxPrice": 26990,
      "discountPercent": 10,
      "variantCount": 2,
      "lowestMonthly": 1627,
      "variants": [ { "id": "…", "label": "Black", "hexColor": "#1A1A1A", "price": 26990, "inStock": true, "imageUrl": "/api/v1/images/…" } ],
      "emiPlans": [ { "tenureMonths": 6, "monthlyAmount": 4499, "isNoCost": true, "isRecommended": true, "cashbackLabel": "₹250 cashback" } ]
    }
  ],
  "meta": { "total": 3, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### Example — `GET /api/v1/products/apple-iphone-16-pro`

```json
{
  "success": true,
  "data": {
    "name": "Apple iPhone 16 Pro",
    "slug": "apple-iphone-16-pro",
    "brand": "Apple",
    "category": "smartphones",
    "imageUrl": "/api/v1/images/e7c855d4-…",
    "mrp": 134900,
    "minPrice": 134900,
    "maxPrice": 154900,
    "discountPercent": 0,
    "variantCount": 4,
    "variants": [
      {
        "id": "409d6913-…",
        "label": "256 GB · Black Titanium",
        "storage": "256 GB",
        "color": "Black Titanium",
        "hexColor": "#3A3A3C",
        "price": 134900,
        "stock": 48,
        "inStock": true,
        "imageUrl": "/api/v1/images/e7c855d4-…"
      }
    ],
    "emiPlans": [
      { "tenureMonths": 3, "interestRate": 0, "isNoCost": true, "monthlyAmount": 44967, "totalPayable": 134901, "cashbackAmount": 0,   "isRecommended": false },
      { "tenureMonths": 6, "interestRate": 0, "isNoCost": true, "monthlyAmount": 22484, "totalPayable": 134904, "cashbackAmount": 500, "cashbackLabel": "₹500 cashback", "isRecommended": true }
    ]
  }
}
```

### EMI computation

```
principal = selected variant price
no-cost (rate = 0):   monthly = ceil(principal / tenure)
interest-bearing:     r = rate / 1200
                      monthly = round( principal · r · (1+r)^n / ((1+r)^n − 1) )
totalPayable  = monthly × tenure
interestPaid  = max(0, totalPayable − principal)
effectiveCost = totalPayable − cashback
```

The frontend mirrors this formula (`src/lib/emi.ts`) so instalments update instantly when you change variants — no extra request.

---

## 🚀 Setup & run (local)

### Prerequisites
- Node.js ≥ 18 (developed on v24)
- PostgreSQL 14+ — or use the bundled Docker Compose

### 0. (Optional) Start Postgres with Docker
```bash
docker compose up -d        # postgres on localhost:5432, db "1fi_marketplace"
```

### 1. Backend → http://localhost:4000
```bash
cd backend
cp .env.example .env          # set DATABASE_URL, PORT, CORS_ORIGINS
npm install
npm run db:setup              # reset schema → migrate → seed (loads images from prisma/assets)
npm run dev
```

### 2. Frontend → http://localhost:3000
```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

Open **http://localhost:3000/shop** → the **1Fi Marketplace** tab.

### Useful scripts

| Backend | |
|---|---|
| `npm run dev` | Dev server (tsx watch) |
| `npm run db:setup` | Reset + migrate + seed |
| `npm run db:seed` | Reseed only |
| `npm run typecheck` / `lint` / `build` | Quality gates |
| `npm test` | Vitest + Supertest integration tests |

| Frontend | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` / `lint` | Quality gates |

---

## ✅ Testing

```bash
cd backend && npm test
```

Integration tests (Vitest + Supertest) cover the health check, product list/detail, the EMI computation (`ceil(price / tenure)` for no-cost), variant recompute, and 404 handling.

---

## ☁️ Deployment

**Frontend → Vercel**
1. Import the repo, set **Root Directory = `frontend`**.
2. Env: `NEXT_PUBLIC_API_URL=https://<your-api>.onrender.com`.

**Backend + DB → Render** (blueprint in [`render.yaml`](render.yaml))
1. New → Blueprint → select the repo. It provisions a web service (root `backend`) + a managed Postgres.
2. Build runs `prisma migrate deploy` + seed; start runs the compiled server.
3. Set `CORS_ORIGINS` to your Vercel URL.

---

## 📋 Assignment checklist

- [x] Dynamic product page: name, variant (storage/colour), MRP, price, image
- [x] Selectable EMI plans — monthly amount, tenure, interest rate, cashback
- [x] Proceed action for the selected plan
- [x] Data from a backend API + database (no hardcoded data)
- [x] Unique URL per product (`/products/:slug`)
- [x] 3 products, each with 2+ variants
- [x] APIs for product + EMI data · defined schema · seed data
- [x] React + Tailwind · Node/Express · PostgreSQL
- [x] README with setup, API examples, schema, tech stack
- [x] Consistent with the 1Fi app design; added as the “1Fi Marketplace” Shop tab
