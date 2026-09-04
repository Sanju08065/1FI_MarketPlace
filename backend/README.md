# 1Fi Marketplace — API

TypeScript · Express · Prisma · PostgreSQL. Layered architecture with an EMI computation engine, image serving from Postgres, Swagger docs and integration tests. See the [root README](../README.md) for the full project overview, schema and API examples.

## Quick start

```bash
cp .env.example .env         # DATABASE_URL, PORT, CORS_ORIGINS
npm install
npm run db:setup             # reset schema → migrate → seed (loads images from prisma/assets)
npm run dev                  # http://localhost:4000  (docs at /api/docs)
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Watch-mode dev server (tsx) |
| `npm run build` / `start` | Compile to `dist/` / run compiled server |
| `npm run db:setup` | `db:reset` → `db:migrate` → `db:seed` |
| `npm run db:migrate` | Create + apply Prisma migration |
| `npm run db:seed` | Seed products, variants, EMI plans, images |
| `npm run typecheck` / `lint` | Quality gates |
| `npm test` | Vitest + Supertest integration tests |

## Layout

```
src/
├─ config/env.ts          # Zod-validated env (fail-fast)
├─ db/prisma.ts           # Prisma client singleton
├─ lib/                   # logger · AppError · asyncHandler · http envelope
├─ middleware/            # error · notFound · rate-limit
├─ modules/
│  ├─ products/           # routes · controller · service · repository · schema
│  ├─ emi/                # EMI computation engine
│  └─ images/             # image streaming from Postgres
├─ docs/openapi.ts        # Swagger spec
├─ app.ts                 # express assembly
└─ server.ts              # bootstrap
```
