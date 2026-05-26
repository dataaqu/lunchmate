# 🍽️ Tbilisi Food Guide

ვებ პლატფორმა თბილისში პირველად ჩამოსული ტურისტებისთვის. Google Maps + Places API ინტერაქტიული რუკით, უბნების polygon ფილტრით და კომენტარების სისტემით.

## Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Hono
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Auth:** Auth.js (NextAuth v5)
- **Maps:** Google Maps JavaScript API + Places API
- **i18n:** next-intl
- **Hosting:** Vercel (web) + Railway (api)

## Monorepo Structure

```
.
├── apps/
│   ├── web/    # Next.js 15 frontend
│   └── api/    # Hono backend
└── packages/
    └── db/     # Drizzle schema + migrations
```

## Development

```bash
pnpm install
pnpm dev          # runs all apps in parallel
```

## Environment variables & secrets

თითო app/package-ს აქვს `.env.example` — დააკოპირე `.env.local`-ად და შეავსე.
`.env.local` **არასდროს** commit-დება (gitignore-შია); committ-დება მხოლოდ `.env.example`.

```bash
cp apps/web/.env.example  apps/web/.env.local
cp apps/api/.env.example  apps/api/.env.local
cp packages/db/.env.example packages/db/.env.local
```

**Two-key strategy** (Google API):

| ცვლადი | სად | scope | რატომ |
|--------|-----|-------|-------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `apps/web` | client (browser) | Maps JS bundle-ში ჩაიდება — `NEXT_PUBLIC_`. დაცვა: GCP-ში HTTP referrer restriction. |
| `GOOGLE_PLACES_API_KEY` | `apps/api` | **server only** | Places (New) call-ები Hono-ში რჩება; key არასდროს გადის ბრაუზერში. **არასდროს დაუწერო `NEXT_PUBLIC_` prefix.** |
| `DATABASE_URL` | `apps/api`, `packages/db` | server | Neon Postgres connection string. |
| `NEXTAUTH_SECRET` | `apps/web` | server | `openssl rand -base64 32`-ით დააგენერირე. |

**Production secrets** — `.env` ფაილებში **არ** ინახება. რეალური key-ები იწერება hosting პლატფორმის env settings-ში:

- **Web → Vercel:** Project → Settings → Environment Variables (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXTAUTH_*`, `NEXT_PUBLIC_API_URL`).
- **API → Railway:** Service → Variables (`GOOGLE_PLACES_API_KEY`, `DATABASE_URL`, `CORS_ORIGIN`, `PORT`).

## Plan

ფაზებად დაყოფილი ამოცანები: [`PROJECT_PLAN.md`](./PROJECT_PLAN.md)

PlanFlow cloud: [planflow.tools](https://planflow.tools)
