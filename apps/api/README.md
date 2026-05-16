# Backend (`apps/api`)

NestJS backend API for JV Dine.

## Prerequisites

- Node.js 20+
- pnpm 10.11.0
- PostgreSQL (e.g. **Supabase** — URLs only in `apps/api/.env`, no repo-root `.env`)

## Local setup

From repo root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm dev:api
```

Default URL: `http://localhost:5000`.

## Environment variables

`apps/api/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
WEB_ORIGIN=http://localhost:3000

# Optional: log full HTTP bodies (verbose). Omit for compact logs (see HttpLoggingInterceptor).
# VERBOSE_HTTP_LOGS=1

# JWT (bắt buộc cho auth guards)
JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
# Hoặc dùng JWT_SECRET cho cả hai khi dev

# Upload ảnh (API + script seed) — Cloudflare R2 (xem apps/api/.env.example)
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
# Hoặc R2_ACCOUNT_ID (script/API ghép endpoint S3)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev
```

Mẫu đầy đủ hơn: [`apps/api/.env.example`](/apps/api/.env.example).

## Auth guards (Sprint 2)

Global guards: `JwtAuthGuard` + `RolesGuard` (xem `src/common/auth/`).

| Route | Auth |
|---|---|
| `GET /restaurants/search`, `GET /restaurants/:id` | Public |
| `GET /menus`, `GET /menus/restaurant/:id`, `GET /menus/:id` | Public |
| `GET /reviews`, `GET /reviews/restaurant/:id`, `GET /reviews/:id` | Public |
| `POST/PATCH/DELETE /restaurants*` | Owner JWT; mutate chỉ khi `owner_id === user.id` |
| `POST/PATCH/DELETE /menus*` | Owner JWT; menu thuộc quán của owner |
| `POST /reviews` | User hoặc Owner JWT (`userId` lấy từ token) |
| `POST /uploads/images` | User hoặc Owner JWT; multipart field `file` |

Header: `Authorization: Bearer <accessToken>` (token từ `POST /auth/login`).

## Cloudflare R2 — upload API & ảnh nhà hàng

`POST /uploads/images` — multipart field **`file`**, MIME `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, tối đa **10MB**. Trả `{ "imageUrl": "https://...", "key": "uploads/..." }`. Thiếu `R2_*` → **503**.

Script seed ảnh mẫu (cùng biến môi trường):

Migration thêm `restaurants.image_url` được đặt **sau** migration init trong `prisma/migrations` (theo timestamp thư mục), không được chạy trước lúc tạo bảng — nếu không sẽ lỗi shadow DB (“table does not exist”).

Migration **`20260514120000_restaurant_edit_fields`** (màn chỉnh sửa thông tin quán / Figma 117:104) thêm trên bảng `restaurants`: `name_vn`, `description_ja`, `description_vn`, `phone`, `cuisine`, và các cột boolean tiện ích (`has_wifi`, `has_parking`, …). Trên **Supabase Postgres**, sau khi `DATABASE_URL` / `DIRECT_URL` trỏ đúng project:

```bash
cd apps/api
pnpm exec prisma migrate deploy --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
```

Nếu DB đã drift so với history (P3009 / reset), xử lý baseline/ghi nhận migration như mục **Database notes** bên dưới rồi chạy lại `migrate deploy`.

```bash
pnpm prisma:migrate:dev
pnpm --filter api upload:r2-restaurant-images
```

Script đọc `docs/media/`: sakura (**1**), bun-cha-huong-lien (**2**), nagisha (**3**), pizza4p (**4**), pho-thin (**5**); key object `restaurants/{id}.jpeg`; cập nhật Postgres qua Prisma.

Nếu thiếu `R2_ACCOUNT_ID`: thêm các biến `R2_*` thật trong `apps/api/.env` hoặc export trong shell — script chỉ load file có tồn tại (repo `.env` / `.env.local`, rồi `apps/api/.env` / `.env.local`).

**`NoSuchBucket`:** Bucket chưa tạo trong R2 Dashboard, **tên `R2_BUCKET_NAME` không khớp**, hoặc **S3 access key thuộc Cloudflare account khác** bucket. Bucket jurisdictional EU: dùng `R2_ENDPOINT` với `.eu.` trong hostname (`…eu.r2.cloudflarestorage.com`).

## Upstash Redis (cache tìm kiếm)

Tùy chọn: đặt `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN` trong `apps/api/.env`. Khi có, phản hồi của `GET /restaurants/search` được cache trong Redis (**~60s**) theo đầy đủ query; header **`Cache-Control: public, max-age=30`** giúp trình duyệt tái sử dụng JSON cùng URL.

**Không** commit token vào Git; đổi token trên dashboard nếu lộ.

## Database notes

- **DB đã có sẵn (Supabase, v.v.) + lỗi P3005 khi `migrate deploy`:** bảng đã tồn tại nhưng chưa có dòng trong `_prisma_migrations`. Đánh dấu init đã áp dụng (baseline), rồi deploy phần còn lại:
  ```bash
  cd apps/api
  pnpm exec prisma migrate resolve --applied 20260509163341_init_local --schema prisma/schema.prisma
  pnpm exec prisma migrate deploy --schema prisma/schema.prisma
  ```
  Chỉ làm một lần cho môi trường đó — sau đó `migrate deploy` chạy bình thường.
- Prisma schema: `apps/api/prisma/schema.prisma`
- Datasource provider: PostgreSQL
- `DatabaseService` uses `DIRECT_URL` first, then `DATABASE_URL`
- SSL DB connection is enabled only when `NODE_ENV=production`
- DB helper commands at root:
  - `pnpm db:up`
  - `pnpm db:down`
  - `pnpm db:logs`

## Commands

From repo root:

```bash
pnpm dev:api
pnpm --filter api start
pnpm --filter api start:dev
pnpm --filter api start:debug
pnpm --filter api start:prod
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:watch
pnpm --filter api test:cov
pnpm --filter api test:e2e
```

Prisma commands from root:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

Prisma commands inside `apps/api`:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:studio
```
