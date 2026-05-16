# Frontend (`apps/web`)

Next.js frontend application for JV Dine.

## Prerequisites

- Node.js 20+
- pnpm 10.11.0

## Local setup

From repo root:

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

Default URL is `http://localhost:3000`. Visiting `/` opens the guest home/search screen, while `/login` and `/signup` remain dedicated auth routes.

If port **3000** is already taken, Next picks another (e.g. **3001**). The API defaults to port **5000** (`NEXT_PUBLIC_API_BASE_URL`).

## Language toggle

The home and auth screens use a client-side JP/VN language toggle stored in `localStorage`. There are no locale-prefixed routes yet.

## Environment variables

Use `apps/web/.env.local` (from `apps/web/.env.example`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
```

`/map` requires both Google Maps variables. If either is missing, the page renders a configuration error instead of mounting the map.

## Commands

From repo root:

```bash
pnpm dev:web
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```

From `apps/web`:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Test status

There is no frontend `test` script yet in `apps/web/package.json`.



```mermaid
erDiagram
    Role ||--o{ User : "has"
    User ||--o{ Restaurant : "owns"
    User ||--o{ Review : "writes"
    User ||--o{ Notification : "receives"
    Restaurant ||--o{ Menu : "has"
    Restaurant ||--o{ Coupon : "offers"
    Restaurant ||--o{ Review : "receives"

    Role {
        Int id PK
        String role_name
        String description
    }

    User {
        Int id PK
        String username
        String email UK
        String password
        Int role_id FK
        String allergy_info
        Boolean is_verified
        DateTime created_at
    }

    Restaurant {
        Int id PK
        Int owner_id FK
        String name
        String name_vn
        String description_ja
        String description_vn
        String address
        String area
        String phone
        String cuisine
        String working_hours
        Decimal min_budget
        Decimal max_budget
        Boolean has_air_conditioner
        Boolean is_japanese_friendly
        Boolean has_wifi
        Boolean has_parking
        Boolean has_english_support
        Boolean accepts_cards
        Boolean has_delivery
        Boolean accepts_reservations
        Int cleanliness_level
        String languages
        Float lat
        Float long
        String image_url
    }

    Menu {
        Int id PK
        Int restaurant_id FK
        String item_name
        Decimal price
        String warning_tags
        String image_url
    }

    Coupon {
        Int id PK
        Int restaurant_id FK
        String code UK
        Int discount_rate
        DateTime expiry_date
    }

    Review {
        Int id PK
        Int user_id FK
        Int restaurant_id FK
        Int rating_taste
        Int rating_cleanliness
        Int rating_service
        String comment
        String image_url
        DateTime created_at
    }

    Notification {
        Int id PK
        Int user_id FK
        String content
        Boolean is_read
        DateTime created_at
    }
```
