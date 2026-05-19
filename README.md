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

## Plan

ფაზებად დაყოფილი ამოცანები: [`PROJECT_PLAN.md`](./PROJECT_PLAN.md)

PlanFlow cloud: [planflow.tools](https://planflow.tools)
