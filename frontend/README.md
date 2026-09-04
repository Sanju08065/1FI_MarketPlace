# 1Fi Marketplace — Web

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · TanStack Query · Zod. Implements the 1Fi Shop page with the **1Fi Marketplace** tab and server-rendered product detail pages. See the [root README](../README.md) for the full overview.

## Quick start

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                  # http://localhost:3000  → /shop
```

The backend API must be running (default `http://localhost:4000`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run typecheck` / `lint` | Quality gates |

## Layout

```
src/
├─ app/
│  ├─ shop/                 # 3-tab shop shell (Marketplace is the live tab)
│  └─ products/[slug]/      # SSR product detail (+ loading, error)
├─ components/
│  ├─ ui/                   # Button · Badge · Swatch · Skeleton · Sheet
│  ├─ layout/               # AppShell · BottomNav
│  ├─ shop/                 # TabBar · ComingSoon
│  ├─ marketplace/          # SearchBar · ProductCard · MarketplaceTab
│  └─ product/              # Gallery · VariantSelector · EmiPlanSelector · ProceedBar · ProceedSheet
├─ hooks/                   # useProducts · useDebounce
├─ lib/                     # api client · emi mirror · format · cn
└─ schemas/                 # Zod schemas + inferred types
```
