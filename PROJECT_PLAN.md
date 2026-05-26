# 🍽️ თბილისის კვების გიდი — PROJECT PLAN

## პროექტის ინფორმაცია

- **სახელი:** თბილისის კვების გიდი (Tbilisi Food Guide)
- **ტიპი:** Full-Stack Web App (ტურისტული, ლოკაციაზე დაფუძნებული)
- **სამიზნე აუდიტორია:** თბილისში პირველად ჩამოსული ტურისტები
- **შექმნის თარიღი:** 2026-05-19
- **ბოლო განახლება:** 2026-05-19
- **სტატუსი:** Planning
- **Plugin Version:** 1.1.1

---

## აღწერა

ვებ პლატფორმა, რომელიც ეხმარება თბილისში პირველად ჩამოსულ ტურისტებს იპოვონ კვების ობიექტები ინტერაქტიული რუკით. მომხმარებელი ფილტრავს უბნებისა და კატეგორიების მიხედვით (რესტორანი / კაფე / სწრაფი კვება), ხედავს Google Places-დან მოპოვებულ მონაცემებს, კითხულობს და ტოვებს კომენტარებს ★ რეიტინგით.

**უნიკალური ღირებულება:** უბნების ინტერაქტიული polygon ფილტრი — სტატიკურ რუკაზე უბანი არის კლიკადური polygon, რომელიც ფილტრავს Google Maps-ს.

---

## Tech Stack (ფინალური — clarifications-ის შემდეგ)

| ნაწილი | ტექნოლოგია | სტატუსი |
|---|---|---|
| Frontend | **Next.js 15 (App Router)** | შეცვლილია (იყო React) |
| Styling | **Tailwind CSS + shadcn/ui** | დამატებულია (სპეცში არ ეწერა) |
| Maps | Google Maps JavaScript API | სპეცის მიხედვით |
| Places Data | Google Places API | სპეცის მიხედვით |
| Auth | **Auth.js (NextAuth v5)** | შეცვლილია (იყო Firebase Auth) |
| Backend | **Node.js + Hono** | შეცვლილია (იყო Express) |
| ORM | **Drizzle ORM** | დამატებულია |
| Database | **PostgreSQL (Neon)** | hosting შეცვლილია (იყო Railway) |
| i18n | **next-intl** | დამატებულია |
| Frontend Hosting | Vercel | სპეცის მიხედვით |
| Backend Hosting | Railway | სპეცის მიხედვით |

---

## Google Places API — ბიუჯეტი

- **უფასო კრედიტი:** $200 თვეში
- **MVP-ზე საკმარისია:** ~900 უნიკალური ვიზიტორი დღეში
- **Budget Alert:** $150
- **Billing Cap:** $200 (hard limit)
- **მონიტორინგი:** Google Cloud Console → APIs → Quotas

---

## სამიზნე მომხმარებლები

- 🧳 **ტურისტი** — ანონიმური მომხმარებელი, ეძებს კვების ობიექტებს, ხედავს კომენტარებს. რეგისტრაცია არ სჭირდება.
- 👤 **დარეგისტრირებული მომხმარებელი** — ტოვებს კომენტარებს, აფასებს ★ რეიტინგით, ინახავს რჩეულებში.

---

## ფაზები და ეტაპები

### Phase 1 — Foundation & Infrastructure (1-2 კვირა)
პროექტის სკაფფოლდინგი, რეპოს სტრუქტურა, Google Cloud setup, deployment pipeline.

### Phase 2 — MVP (4-6 კვირა) — Launchable ვერსია
Google Maps + Places, კატეგორიების ფილტრი, ობიექტის დეტალური გვერდი, უბნების polygon ფილტრი. **ეს ფაზა ბოლომდე უნდა გავიდეს public-ში.**

### Phase 3 — Auth + კომენტარები (3-4 კვირა)
Auth.js, Drizzle schema, Hono API, კომენტარების სისტემა.

### Phase 4 — პოლიშინგი (2-3 კვირა)
ძებნა, რჩეულები, i18n (ინგლისური), mobile optimization.

---

## ამოცანები

### Phase 1: Foundation & Infrastructure

#### T1.1: მონორეპოს სტრუქტურის სკაფფოლდინგი
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: None
- **Description**:
  - pnpm workspace-ის ინიციალიზაცია
  - `apps/web` (Next.js 15) და `apps/api` (Hono) დირექტორიების შექმნა
  - `packages/db` (Drizzle schema + migrations) დირექტორიის შექმნა
  - `.gitignore`, `README.md`, root `package.json` კონფიგურაცია

#### T1.2: Next.js 15 პროექტის სკაფფოლდინგი
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T1.1
- **Description**:
  - `create-next-app@latest` App Router-ით, TypeScript-ით
  - Tailwind CSS კონფიგურაცია
  - shadcn/ui CLI-ის გაშვება, საბაზო კომპონენტების ინსტალაცია (Button, Card, Dialog, Input)
  - `app/layout.tsx`-ში საბაზო shell

#### T1.3: Hono backend-ის სკაფფოლდინგი
- [x] **Status**: DONE
- **Complexity**: Low
- **Dependencies**: T1.1
- **Description**:
  - Hono + `@hono/node-server` ინსტალაცია
  - საბაზო `GET /health` endpoint
  - CORS middleware Next.js-ისთვის
  - `tsx watch` dev server-ი

#### T1.4: Google Cloud Console — Project + API Keys
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: None
- **Description**:
  - Google Cloud-ში ახალი პროექტი
  - Maps JavaScript API და Places API (New) ჩართვა
  - API Key შექმნა + HTTP referrer restriction
  - Billing account-ის მიბმა

#### T1.5: Budget Alert + Billing Cap კონფიგურაცია
- [x] **Status**: DONE (code + runbook; GCP resources provisioned via `infra/billing-cap/README.md`)
- **Complexity**: Low
- **Dependencies**: T1.4
- **Description**:
  - Budget alert $150-ზე (email notification)
  - Billing cap $200-ზე (Cloud Function disables billing)
  - Quota monitoring dashboard-ის bookmark

#### T1.6: Neon Postgres + Drizzle setup
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.1
- **Description**:
  - Neon-ში ახალი project + database
  - `packages/db` package-ში Drizzle config (`drizzle.config.ts`)
  - საწყისი schema file (ცარიელი, მზად ცხრილებისთვის)
  - `drizzle-kit generate` და `drizzle-kit migrate` script-ები

#### T1.7: Deployment pipeline (Vercel + Railway)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.2, T1.3
- **Description**:
  - Vercel-ზე Next.js app-ის deploy (preview + production)
  - Railway-ზე Hono API service
  - Environment variables (API keys, DB connection, NEXTAUTH_SECRET)
  - GitHub Actions-ი ან Vercel/Railway-ის built-in CI

#### T1.8: ENV variable strategy + secrets
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T1.7
- **Description**:
  - `.env.example` ფაილები ორივე app-ისთვის
  - Server-side keys (Places API) მხოლოდ Hono-ში
  - Client-side keys (Maps API) `NEXT_PUBLIC_` prefix-ით

---

### Phase 2: MVP — Maps, Filters, Detail Page, District Polygon

#### T2.1: Google Maps კომპონენტი
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.2, T1.4
- **Description**:
  - `@vis.gl/react-google-maps` ან `@react-google-maps/api` ინტეგრაცია
  - საბაზო `<GoogleMap>` კომპონენტი, თბილისზე centered (41.7151, 44.8271)
  - Custom map style (clean, ტურისტული)

#### T2.2: Places API proxy endpoint Hono-ში
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3, T1.4
- **Description**:
  - `GET /api/places?category=&district=` endpoint
  - Google Places API (New) Nearby Search proxy
  - Cache-ის ფენა (in-memory ან Redis მომავალში) ფასების შესამცირებლად
  - Category mapping: restaurant / cafe / fast_food → Places types

#### T2.3: კატეგორიების ფილტრი (UI)
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T2.1, T2.2
- **Description**:
  - Toggle ღილაკები: 🍽️ რესტორანი, ☕ კაფე, 🍔 სწრაფი კვება
  - URL state (`?category=cafe`) shareable link-ისთვის
  - Active state shadcn/ui-ით

#### T2.4: პინები რუკაზე კატეგორიის ემოჯიებით
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.1, T2.2
- **Description**:
  - Custom marker icons კატეგორიის მიხედვით
  - Marker cluster (>50 ობიექტი ერთ ზონაში)
  - Click → place detail გვერდი

#### T2.5: ობიექტის დეტალური გვერდი (`/place/[id]`)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.2
- **Description**:
  - Server Component `/place/[placeId]/page.tsx`
  - Places API Details endpoint Hono-ში
  - UI: ფოტოები (carousel), მისამართი, საათები, ტელეფონი, რეიტინგი
  - "უკან რუკაზე" ნავიგაცია

#### T2.6: უბნების სურათის მომზადება
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: None
- **Description**:
  - თბილისის უბნების სქემატური სურათი (PNG, 800px width)
  - ფიქსირებული სიგანე — coords-ის სტაბილურობისთვის
  - `apps/web/public/tbilisi-map.png`

#### T2.7: Polygon coords გენერაცია image-map.net-ით
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T2.6
- **Description**:
  - [image-map.net](https://www.image-map.net) → Poly tool
  - თითოეული უბნისთვის polygon coords
  - `apps/web/src/data/districts.ts` ფაილში TypeScript array
  - სავარაუდო უბნები: ვაკე, საბურთალო, ვერა, ძველი თბილისი, ისანი, ნაძალადევი, გლდანი

#### T2.8: `<DistrictMap>` React კომპონენტი
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.7
- **Description**:
  - სურათი + SVG overlay polygon-ებით
  - `hover` state — opacity 0.4
  - `active` state — opacity 0.6
  - HTML `<map>` + `<area>` accessibility-ისთვის
  - `onSelect(districtName)` callback

#### T2.9: უბნის ფილტრის ლოგიკის Google Maps-თან დაკავშირება
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.4, T2.8
- **Description**:
  - უბნის არჩევისას → Maps bounds რესტრიქცია უბნის geographic boundary-ით
  - Places API query-ს `locationRestriction` parameter
  - URL state (`?district=vake`) კატეგორიის ფილტრთან ერთად
  - "ფილტრის გასუფთავება" ღილაკი

#### T2.10: Loading + error states
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T2.4, T2.5
- **Description**:
  - Skeleton loaders shadcn/ui-ით
  - Empty state ("ამ უბანში ობიექტი ვერ მოიძებნა")
  - Error boundary Places API შეცდომებისთვის

---

### Phase 3: Auth + Comments

#### T3.1: Auth.js (NextAuth v5) კონფიგურაცია
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.2
- **Description**:
  - `next-auth@beta` ინსტალაცია
  - Google OAuth provider + Email magic link
  - `auth.config.ts`, `auth.ts`, `middleware.ts`
  - Session strategy: JWT (Hono-სთან cross-app validation)

#### T3.2: Drizzle schema — users, reviews
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.6, T3.1
- **Description**:
  - `users` ცხრილი (id UUID, email, name, image, created_at)
  - Auth.js adapter ცხრილები (accounts, sessions, verification_tokens)
  - `reviews` ცხრილი (id, place_id text, user_id FK, rating 1-5, comment text, created_at)
  - Indexes: `reviews(place_id)`, `reviews(user_id)`
  - Drizzle migration-ის გენერაცია და გაშვება

#### T3.3: Login / Register UI
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T3.1
- **Description**:
  - `/login` გვერდი — Google ღილაკი + Email input
  - Dialog ვერსია (modal) — კომენტარის ღილაკზე ანონიმური მომხმარებლისთვის
  - shadcn/ui Form + react-hook-form
  - Toast notifications (sonner)

#### T3.4: Reviews API endpoints (Hono)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.3, T3.2
- **Description**:
  - `GET /api/places/:placeId/reviews` — public, paginated
  - `POST /api/places/:placeId/reviews` — JWT validation, rating 1-5
  - `DELETE /api/reviews/:id` — only author
  - Zod validation, error handling

#### T3.5: Auth.js ↔ Hono JWT bridge
- [ ] **Status**: TODO
- **Complexity**: High
- **Dependencies**: T3.1, T3.4
- **Description**:
  - Next.js-დან Hono-ში მოთხოვნებზე JWT-ის გადაცემა (Authorization header)
  - Hono middleware რომელიც verify-ს აკეთებს `jose` ან `next-auth/jwt`-ით
  - Shared secret `NEXTAUTH_SECRET` ორივე deployment-ში
  - 401 handling

#### T3.6: კომენტარის დატოვების ფორმა
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T3.3, T3.4, T2.5
- **Description**:
  - Place detail გვერდზე ★ Rating Input (1-5)
  - Textarea კომენტარისთვის (max 500 char)
  - ანონიმური მომხმარებლისთვის — "გაიარეთ ავტორიზაცია" prompt
  - Optimistic update React Query-ით ან Server Action-ით

#### T3.7: კომენტარების სია
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T3.4, T2.5
- **Description**:
  - Place detail გვერდზე ბოლო 20 კომენტარი
  - საშუალო რეიტინგი (aggregate)
  - "მეტის ჩვენება" pagination
  - "წაშლა" ღილაკი მხოლოდ ავტორისთვის

---

### Phase 4: პოლიშინგი

#### T4.1: ძებნა სახელით
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.2
- **Description**:
  - Header-ში Search input (Command-K palette)
  - Google Places Autocomplete API
  - დებაუნსი 300ms
  - კლიკზე → place detail

#### T4.2: რჩეულები (Favorites)
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T3.2, T3.6
- **Description**:
  - Drizzle: `favorites` ცხრილი (user_id, place_id, created_at)
  - Hono: `POST /api/favorites`, `DELETE /api/favorites/:placeId`, `GET /api/me/favorites`
  - UI: ♥ ღილაკი place detail-ზე და card-ზე
  - `/favorites` გვერდი მომხმარებლისთვის

#### T4.3: next-intl — ინგლისური ენის დამატება
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.2
- **Description**:
  - `next-intl` ინსტალაცია + middleware კონფიგი
  - `messages/ka.json`, `messages/en.json`
  - Routes: `/ka/...` და `/en/...`
  - Language switcher header-ში
  - ყველა ტექსტის გადატანა translation file-ებში

#### T4.4: Mobile-first responsive დიზაინი
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T2.4, T2.8
- **Description**:
  - მობილურზე bottom sheet ფილტრებისთვის (vaul ან shadcn/ui Drawer)
  - DistrictMap responsive სქეილინგი (challenge — coords ფიქსირებულია)
  - Touch event support polygon-ებზე
  - Lighthouse mobile audit ≥ 90

#### T4.5: SEO + Open Graph
- [ ] **Status**: TODO
- **Complexity**: Low
- **Dependencies**: T2.5
- **Description**:
  - `generateMetadata` ყოველი place detail გვერდისთვის
  - OG images (Next.js OG generator)
  - sitemap.xml + robots.txt
  - JSON-LD `Restaurant` schema

#### T4.6: Performance + monitoring
- [ ] **Status**: TODO
- **Complexity**: Medium
- **Dependencies**: T1.7
- **Description**:
  - Vercel Analytics + Speed Insights
  - Sentry error tracking ორივე app-ში
  - Google Cloud quota monitoring alert
  - Core Web Vitals ≥ "Good"

---

## მონაცემთა ბაზის სქემა (Drizzle)

```typescript
// packages/db/schema.ts
import { pgTable, uuid, varchar, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  placeId: varchar('place_id', { length: 255 }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const favorites = pgTable('favorites', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  placeId: varchar('place_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.placeId] }),
}))

// Auth.js adapter tables: accounts, sessions, verificationTokens
// (Drizzle adapter-ის სტანდარტული სქემა — Auth.js docs-დან)
```

---

## პროექტის სტრუქტურა (განახლებული)

```
tbilisi-food-guide/
├── apps/
│   ├── web/                       # Next.js 15 App Router
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── page.tsx           # მთავარი (Maps + Filters)
│   │   │   │   │   ├── place/[id]/page.tsx
│   │   │   │   │   ├── favorites/page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── api/auth/[...nextauth]/route.ts
│   │   │   ├── components/
│   │   │   │   ├── ui/                    # shadcn/ui
│   │   │   │   ├── map/
│   │   │   │   │   ├── google-map.tsx
│   │   │   │   │   └── district-map.tsx
│   │   │   │   ├── filters/
│   │   │   │   │   ├── category-filter.tsx
│   │   │   │   │   └── district-filter.tsx
│   │   │   │   ├── place/
│   │   │   │   │   ├── place-card.tsx
│   │   │   │   │   ├── place-detail.tsx
│   │   │   │   │   └── review-list.tsx
│   │   │   │   └── auth/
│   │   │   ├── data/districts.ts
│   │   │   ├── lib/auth.ts
│   │   │   └── messages/
│   │   │       ├── ka.json
│   │   │       └── en.json
│   │   ├── public/tbilisi-map.png
│   │   └── package.json
│   └── api/                       # Hono backend
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── places.ts
│       │   │   ├── reviews.ts
│       │   │   └── favorites.ts
│       │   └── middleware/auth.ts
│       └── package.json
├── packages/
│   └── db/                        # Drizzle schema + migrations
│       ├── schema.ts
│       ├── drizzle.config.ts
│       └── migrations/
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## სასარგებლო ლინკები

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Hono Docs](https://hono.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [Neon Console](https://console.neon.tech)
- [Auth.js (NextAuth v5)](https://authjs.dev)
- [next-intl](https://next-intl-docs.vercel.app)
- [shadcn/ui](https://ui.shadcn.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Google Maps JS API](https://developers.google.com/maps/documentation/javascript)
- [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service/op-overview)
- [image-map.net](https://www.image-map.net) — Polygon coords

---

## სპეციფიკაციის ანალიზი

**წყარო:** `tbilisi-food-guide-plan.md`

### სპეცში მითითებული მოთხოვნები
- Google Maps + Places API ინტეგრაცია
- 3 კატეგორია (რესტორანი / კაფე / სწრაფი კვება)
- უბნების ინტერაქტიული polygon ფილტრი (HTML map + SVG overlay)
- კომენტარები + ★ რეიტინგი (auth-required)
- ქართული → ინგლისური (i18n)
- Google Cloud budget controls
- DB სქემა: users + reviews

### Clarifications-ის შემდეგ შეცვლილი/დამატებული
- **Frontend:** React → **Next.js 15 (App Router)** — SEO ტურისტული საიტისთვის
- **Backend:** Express → **Hono** — TypeScript-first, უფრო სწრაფი
- **Auth:** Firebase → **Auth.js (NextAuth v5)** — Next.js-თან ნატივი
- **DB hosting:** Railway → **Neon** — serverless, branching, Vercel-თან ინტეგრაცია
- **ORM:** არ ეწერა → **Drizzle ORM** — TypeScript-first
- **Styling:** არ ეწერა → **Tailwind CSS + shadcn/ui**
- **i18n:** არ ეწერა → **next-intl**
- **MVP scope (Phase 2):** Maps + Places + Category filter + Place detail + **District polygon filter** (გადმოვიდა Phase 2-დან MVP-ში)

### სავარაუდო ჯამური ვადა
**10-15 კვირა** (4 ფაზა × 2-6 კვირა თითო)
