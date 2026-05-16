# 07 — スプリントバックログ / Sprint Backlog (Sprint 1–4)

> Sheets `スプリントバックログ (1)` → `(4)` — sheets 7–10/14. Bản gốc:
> - `docs/csv/07_スプリントバックログ_(1).csv`
> - `docs/csv/08_スプリントバックログ_(2).csv`
> - `docs/csv/09_スプリントバックログ_(3).csv`
> - `docs/csv/10_スプリントバックログ_(4).csv`
>
> Mỗi sheet sprint dùng cùng template, gồm 2 phần lớn:
> - **◆ スプリントプランニング** — Giai đoạn lên kế hoạch (kỳ sprint, sprint goal, sprint backlog, PIC, ước lượng)
> - **◆ スプリントレビュー** — Phần ghi sau review (sprint review prep, FB từ POT, độ đạt sprint goal, …) — *chỉ điền sau khi sprint hoàn tất*.

## Định nghĩa cột Sprint Backlog

| Cột | Ý nghĩa |
|---|---|
| **対応P_ID** | Liên kết tới Product Backlog Item (xem `05_product-backlog.md`) |
| **ID** | ID task trong sprint |
| **タスク** | Mô tả task (ngầm có prefix `[DB]/[BE]/[FE]/[QA]/[Doc]/[Dev]`) |
| **PIC** | Người phụ trách |
| **見積もり (h)** | Ước lượng (giờ) |
| **スプリントゴールとの関係** | Liên quan tới sprint goal (`あり / なし`) |
| **進捗** | Tiến độ (%): 100 = hoàn thành + test, 80 = dev xong chưa test, 60/40/20/0 = các mức làm dở dang |
| **実績 (h)** | Số giờ thực tế |
| **問題点 / 原因 / 対策 / 問題点への対応状況** | Vấn đề / nguyên nhân / giải pháp / trạng thái xử lý |

---

## Sprint 1 (Đã có kế hoạch chi tiết)

- **Kỳ**: `5/5 ~ 2026/05/10 (CN)`
- **Sprint Goal**:
  > Hoàn thiện thiết kế cơ sở dữ liệu + thiết lập môi trường phát triển; user có thể đăng ký, đăng nhập + xác thực tài khoản; khách & user thường có thể tìm quán theo chi tiết quán + ngân sách.
  >
  > *データベースの設計と開発環境の構築を完了し、ユーザーが登録・ログインおよびアカウント認証ができるようにする。さらに、ゲストおよび一般ユーザーが、店舗の詳細情報や予算に基づいて飲食店を検索できるようにする。*
- **POT đã approve sprint goal + sprint backlog**: ✅

### Sprint Backlog – Sprint 1 (18 tasks)

| ID | P_ID | Task | PIC | Est. (h) | Gắn goal? | Done? |
|---:|:---:|---|---|:---:|:---:|:---:|
| 1 | 1 | [DB] ER図作成とスキーマ定義 — Tạo sơ đồ ER & định nghĩa Schema | Tiến Đạt | 5 | あり | ✅ |
| 2 | 1 | [DB] マイグレーション実行・初期化 — Thực thi migration & khởi tạo dữ liệu | Tiến Đạt | 2 | あり | ✅ |
| 3 | 2 | [Dev] 共通開発環境の構築 — Thiết lập môi trường phát triển chung | Huy | 3 | あり | ✅ |
| 4 | 2 | [Doc] 開発環境設定のマニュアル作成 — Soạn tài liệu hướng dẫn thiết lập env | Tuấn | 2 | あり | ✅ |
| 5 | 1 | [BE] Entity/Model実装 — Triển khai Entity / Model | Huy | 2 | あり | ✅ |
| 6 | 1 | [BE] CRUD開発 — Code các chức năng CRUD | Tuấn | 2 | あり | ✅ |
| 7 | 1 | [QA] DB・CRUD操作の検証 — Test thao tác DB & CRUD | Tuấn | 2 | あり | ✅ |
| 8 | 2 | [QA] 開発環境の導入検証 — Test việc thiết lập môi trường phát triển | Quý | 2 | あり | ✅ |
| 9 | 3 | [FE] ログイン画面のレイアウト実装 — Code layout màn hình đăng nhập | Hải | 2 | あり | ✅ |
| 10 | 3 | [FE] サインアップ画面のレイアウト実装 — Code layout màn hình đăng ký | Hải | 2 | あり | ✅ |
| 11 | 3 | [BE] ログイン・サインアップAPIの実装 — API đăng nhập & đăng ký | Thế Đạt | 3 | あり | ✅ |
| 12 | 3 | [FE/BE] ログイン・サインアップUIとAPIの連携 — Kết nối UI ↔ API đăng nhập / đăng ký | Thế Đạt | 2 | あり | ✅ |
| 13 | 3 | [QA] ログイン・サインアップ機能の受け入れテスト — UAT đăng nhập / đăng ký | Quý | 2 | あり | ✅ |
| 14 | 4 | [FE] ゲスト用ホーム画面のレイアウト実装 — Code layout home dành cho khách | Hải | 2 | あり | ✅ |
| 15 | 4 | [FE] 一般ユーザー用ホーム画面のレイアウト実装 — Code layout home cho user thường | Đức | 2 | あり | ✅ |
| 16 | 4 | [BE] ホーム画面のレストラン検索APIの実装 — API search nhà hàng ở home | Đức | 3 | あり | ✅ |
| 17 | 4 | [FE/BE] ホーム画面の検索UIとレストラン検索APIの連携 — Kết nối UI ↔ API search | Đức | 2 | あり | ✅ |
| 18 | 4 | [QA] 詳細検索・予算検索機能の受け入れテスト — UAT search chi tiết & ngân sách | Quý | 2 | あり | ✅ |

### Phân bổ thời gian Sprint 1

| Vai trò | Tổng giờ ước lượng |
|---|:---:|
| Tiến Đạt (DB) | 7 |
| Huy (Dev/BE) | 5 |
| Tuấn (Doc/BE/QA) | 6 |
| Quý (QA) | 6 |
| Hải (FE) | 6 |
| Thế Đạt (BE/Integ) | 5 |
| Đức (FE/BE) | 7 |
| **Tổng cộng** | **42 h** |

### Trạng thái Sprint 1 (cập nhật theo repo hiện tại)

- Task 1 — ✅ Đã có `apps/api/prisma/schema.prisma` với schema đầy đủ cho các bảng chính.
- Task 2 — ✅ Đã chạy migration local thành công (`prisma migrate dev`) và DB health endpoint trả `connected`.
- Task 3 — ✅ Đã có môi trường dev chung (monorepo scripts, `docker-compose.local.yml`, `.env.example`).
- Task 4 — ✅ Đã có tài liệu setup (`README.md` ở root và `apps/api/README.md`).
- Task 9–10 — ✅ Đã có layout login / signup hoàn chỉnh ở `apps/web/app/login`, `apps/web/app/signup` và component dùng chung `auth-page.tsx`.
- Task 11 — ✅ Đã có API auth cho `signup`, `login`, `refresh` trong `apps/api/src/modules/auth`.
- Task 12–13 — ⚠️ UI đã nối API auth, nhưng UAT end-to-end hiện còn bị chặn bởi `apps/api/.env` đang trỏ Supabase và phát sinh lỗi kết nối DB khi thử signup local.
- Task 14–15 — ✅ Đã có home cho guest (`/`) và user (`/home`) dùng chung UI search.
- Task 16 — ✅ Đã có endpoint `GET /restaurants/search` với filter keyword, area, budget, language, air-conditioner, Japanese-friendly, cleanliness.
- Task 17 — ✅ Đã nối UI home/search với API và verify được flow filter bằng browser (`Ba Đình` + `日本人向け` trả đúng 2 quán).
- Task 18 — ✅ Đã verify thủ công search acceptance cho case có kết quả và filter khớp điều kiện; empty-state cũng đã có trên UI.

---

## Sprint 2 (Đã có kế hoạch chi tiết)

- **Kỳ**: `2026/05/12 (火) ~ 2026/05/17 (日)`
- **Sprint Goal**:
  > 店舗管理者は、店舗情報の登録および編集が可能です。一般ユーザーおよびゲストは、地図上で周辺の店舗を検索・閲覧できるほか、メニュー上の警告タグや「日本人の口に合う」バッジを確認できます。また、一般ユーザーは、写真や星評価付きのレビューを投稿・閲覧することが可能です。
  >
  > *Quản lý cửa hàng có thể đăng ký và sửa thông tin quán. Người dùng thông thường và khách có thể tìm kiếm và xem các quán xung quanh trên bản đồ, có thể xem các thẻ cảnh báo và huy hiệu "Hợp khẩu vị Nhật" trên thực đơn. Người dùng thông thường có thể đăng và xem các đánh giá có kèm hình ảnh và số sao.*
- **POT đã approve sprint goal + sprint backlog**: ❌ *(điền ✅ khi POT xác nhận)*
- **Sprint Review**: chưa thực hiện.

### Sprint Backlog – Sprint 2 (18 tasks)

| ID | P_ID | Task | PIC | Est. (h) | Gắn goal? | Done? |
|---:|:---:|---|---|:---:|:---:|:---:|
| 1 | 5 | [FE] 店舗情報編集画面のレイアウトコーディング — Code layout màn hình chỉnh sửa thông tin quán (Web) | Tiến Đạt | 2 | あり | ✅ |
| 2 | 5 | [BE] 店舗情報編集用API — API chỉnh sửa thông tin quán | Tiến Đạt | 2 | あり | ✅ |
| 3 | 5 | [BE] 店舗情報編集画面のUIとAPIの連携 — Kết nối UI chỉnh sửa thông tin quán với API | Tiến Đạt | 2 | あり | ✅ |
| 4 | 6 | [FE] 地図検索画面のレイアウトコーディング — Code layout màn hình tìm kiếm bằng bản đồ | Huy | 2 | あり | ✅ |
| 5 | 6 | [BE] 地図検索用API — API tìm kiếm bằng bản đồ | Huy | 2 | あり | ✅ |
| 6 | 6 | [BE] 地図検索画面のUIとAPIの連携 — Kết nối UI tìm kiếm bản đồ với API | Huy | 2 | あり | ✅ |
| 7 | 7 | [FE] 店舗詳細・メニュー画面のレイアウトコーディング — Code layout màn hình chi tiết quán và thực đơn | Tuấn | 2 | あり | ✅ |
| 8 | 7 | [BE] 店舗詳細・メニュー用API — API chi tiết quán và thực đơn | Tuấn | 2 | あり | ✅ |
| 9 | 7 | [BE] 店舗詳細・メニュー画面のUIとAPIの連携 — Kết nối UI chi tiết quán và thực đơn với API | Tuấn | 2 | あり | ✅ |
| 10 | 8 | [FE] レビュー閲覧画面のレイアウトコーディング — Code layout màn hình xem đánh giá | Thế Đạt | 2 | あり | ✅ |
| 11 | 8 | [BE] レビュー用APIおよびレビュー閲覧画面のUIとAPIの連携 — API đánh giá + kết nối UI xem đánh giá với API | Thế Đạt | 4 | あり | ✅ |
| 12 | 5 | [FE] 店舗詳細情報画面のレイアウトコーディング — Code layout màn hình chi tiết thông tin nhà hàng | Đức | 2 | あり | ✅ |
| 13 | 5 | [BE] レストラン詳細情報用API — API chi tiết thông tin nhà hàng | Đức | 2 | あり | ✅ |
| 14 | 5 | [FE] レストラン詳細情報画面のUIとAPIの連携 — Kết nối UI chi tiết thông tin nhà hàng với API | Đức | 2 | あり | ✅ |
| 15 | 5 | [QA] 店舗登録・情報編集のテスト — Kiểm thử đăng ký và sửa thông tin quán | Hải | 2 | あり | ✅ |
| 16 | 6 | [QA] 地図検索のテスト — Kiểm thử tìm kiếm bằng bản đồ | Hải | 2 | あり | ✅ |
| 17 | 7 | [QA] 店舗詳細・メニューのテスト — Kiểm thử chi tiết quán và thực đơn | Quý | 2 | あり | ✅ |
| 18 | 8 | [QA] レストラン詳細情報のテスト — Kiểm thử chi tiết thông tin nhà hàng | Quý | 2 | あり | ✅ |

### Phân bổ thời gian Sprint 2

| Vai trò | Tổng giờ ước lượng |
|---|:---:|
| Tiến Đạt (FE/BE) | 6 |
| Huy (FE/BE) | 6 |
| Tuấn (FE/BE) | 6 |
| Thế Đạt (FE/BE) | 6 |
| Đức (FE/BE) | 6 |
| Hải (FE/QA) | 4 |
| Quý (QA) | 4 |
| **Tổng cộng** | **38 h** |


### Trạng thái Sprint 2 (cập nhật theo repo hiện tại)

- Task 1–3 — ✅ Owner edit/register + PATCH/POST wire (`restaurant-edit-page.tsx`, `/dashboard/restaurants/new`)
- Task 4–6 — ✅ Map search `/map` + geo API + home links (`map-search-page.tsx`)
- Task 7–9 — ✅ Guest detail tab Menu (`/restaurants/[id]`, warning tags + JP badge)
- Task 10–11 — ✅ Reviews tab + write modal (`review-write-modal.tsx`, `POST /reviews`)
- Task 12–14 — ✅ Tab 詳細情報 + `GET /restaurants/:id/detail`
- Task 15–18 — ⚠️ UAT cần chạy thủ công với env Maps + R2
- **POT approve**: ❌ (chưa xác nhận)
- **Sprint Review**: chưa điền template

## Sprint 3 (Template – chưa lên kế hoạch)

- **Kỳ (placeholder)**: `5/5 ~ 5/10`
- **Sprint Goal**: chưa điền.
- **Sprint Backlog**: chưa lập task.
- **POT đã approve**: ❌
- **Sprint Review**: chưa thực hiện.

## Sprint 4 (Template – chưa lên kế hoạch)

- **Kỳ (placeholder)**: `5/5 ~ 5/10`
- **Sprint Goal**: chưa điền.
- **Sprint Backlog**: chưa lập task.
- **POT đã approve**: ❌
- **Sprint Review**: chưa thực hiện.

---

## Sprint Review template (áp dụng mọi sprint)

Mỗi sprint sheet có chung phần Sprint Review để điền sau khi kết thúc sprint:

| Mục | Ý nghĩa |
|---|---|
| **スプリントレビュー準備** | Người phụ trách giải thích, demo, ghi chép |
| **スプリントゴール達成度** | Mức đạt sprint goal (vd: 100% / 80% / …) |
| **スプリントゴール達成度の理由** | Lý do mức đạt |
| **スプリントレビュー** | Bảng FB từ POT (5 dòng): No, FB箇所, Checklist No, FB内容, FBへの対応方針, 対応する内容／対応しない理由, 対応方針承認 |
| **次のスプリントで改善すること** | Cải thiện cho sprint kế |
| **POT承認** | POT đã approve / chưa |

> Tham chiếu chi tiết quy trình lập / review sprint backlog: xem [`08_sprint-process-checklists.md`](./08_sprint-process-checklists.md).
