# 02 — 画面遷移図 / Sơ đồ chuyển màn hình

> Sheet `画面遷移図` — sheet 2/14. Bản gốc trong Excel chỉ chứa header role; bản vẽ thật là 3 diagram nằm trong `xl/drawings/drawing2.xml`. Dưới đây là phiên bản tương đương dùng Mermaid, mỗi diagram cho một role.

## Quy ước

- Tên màn hình giữ nguyên format `JP / VN`.
- Cạnh có mũi tên = chuyển hướng một chiều (trigger thường là click nút / link / submit).
- Cạnh hai chiều = mở popup hoặc back được.
- Mỗi diagram bám sát đúng các shape và connector trong `drawing2.xml`.

## Role 1 — 一般ユーザー / Người dùng thường (khách Nhật)

```mermaid
flowchart TD
    Review["レビュー投稿画面<br/>Viết đánh giá"]
    Home["ホーム・検索画面<br/>Trang chủ & Tìm kiếm"]
    Favorites["お気に入り一覧画面<br/>Danh sách yêu thích"]
    Map["地図検索画面<br/>Tìm kiếm bằng bản đồ"]
    Profile["プロフィール画面<br/>Thông tin cá nhân"]
    StoreDetail["店舗詳細・メニュー画面<br/>Chi tiết quán & Thực đơn"]
    Notify["通知一覧画面<br/>Thông báo"]
    MapFilter["マップ用フィルターポップアップ画面<br/>Popup bộ lọc bản đồ"]
    StoreInfo["店舗詳細情報画面<br/>Chi tiết thông tin nhà hàng"]
    ReviewView["レビュー閲覧画面<br/>Xem đánh giá"]
    ReviewPost["レビュー投稿画面<br/>Viết đánh giá"]
    Home <--> Review
    Home <--> Favorites
    Home --> Map
    Home --> Profile
    Home --> StoreDetail
    Map --> Profile
    Map --> Notify
    Map --> MapFilter
    Profile --> Notify
    Profile --> Favorites
    StoreDetail --> StoreInfo
    StoreInfo --> ReviewView
    ReviewView --> ReviewPost
```

**Điểm chính (Role 1):**

- `ホーム・検索画面` là trung tâm — mở được Detail / Map / Profile / Favorites.
- `店舗詳細・メニュー画面` là gateway tới `店舗詳細情報` (text info) và `レビュー閲覧` (review list).
- Từ list đánh giá có thể chuyển sang form viết đánh giá (`レビュー投稿画面`).
- `お気に入り一覧画面` mở được từ cả Home và Profile (đường tắt).

## Role 2 — 店舗管理者 / Chủ nhà hàng (Web Admin)

```mermaid
flowchart TD
    Dash["管理者ダッシュボード画面<br/>Dashboard Admin (Web)"]
    Coupon["クーポン管理画面<br/>Quản lý mã giảm giá"]
    Campaign["キャンペーン・クーポン作成画面<br/>Tạo khuyến mãi / mã giảm giá"]
    EditStore["店舗情報編集画面<br/>Chỉnh sửa thông tin quán"]
    Register["店舗情報登録画面<br/>Đăng ký thông tin nhà hàng"]
    Menu["店舗情報編集画面（メニュー管理）<br/>Chỉnh sửa thông tin quán – Thực đơn"]

    Dash --> Coupon
    Dash --> EditStore
    Dash --> Register

    Coupon --> Campaign
    EditStore --> Menu
```

**Điểm chính (Role 2):**

- `管理者ダッシュボード画面` là trang điều hướng trung tâm (sau khi Owner login thành công).
- Từ Dashboard có 3 nhánh chính: quản lý coupon, sửa thông tin quán, đăng ký quán mới.
- `クーポン管理画面` là nơi liệt kê mã, click "Tạo mới" mở `キャンペーン・クーポン作成画面`.
- `店舗情報編集画面` mở thêm `店舗情報編集画面（メニュー管理）` để CRUD món ăn.

**Web (`apps/web`) — route tương ứng (Sprint 2):**

- `管理者ダッシュボード画面` → `/dashboard`
- `店舗情報編集画面` → `/dashboard/restaurants/{id}/edit` (tab 基本情報 + form PATCH `restaurants`)
- `店舗情報編集画面（メニュー管理）` → `/dashboard/restaurants/{id}/menu` (placeholder; CRUD món sẽ theo backlog メニュー)

## Role 3 — ゲスト / Guest (chưa login) — bao gồm flow Auth chung

```mermaid
flowchart TD
    Home["ホーム・検索画面<br/>Trang chủ & Tìm kiếm"]
    StoreDetail["店舗詳細・メニュー画面<br/>Chi tiết quán & Thực đơn"]
    Map["地図検索画面<br/>Tìm kiếm bản đồ"]
    MapFilter["マップ用フィルターポップアップ画面<br/>Popup bộ lọc bản đồ"]
    Login["ログイン画面<br/>Đăng nhập"]
    Signup["サインアップ画面<br/>Đăng ký"]
    Terms["利用規約の画面<br/>Điều khoản"]
    HomeRole1["＜ホーム・検索画面＞ ロール1<br/>Trang chủ & Tìm kiếm<br/>Tham chiếu sơ đồ di chuyển màn hình của role 1"]
    AdminDashboard["管理者ダッシュボード画面 ロール2<br/>Màn hình Dashboard Admin (Web)<br/>Tham chiếu sơ đồ di chuyển màn hình của role 2"]

    Home --> StoreDetail
    StoreDetail --> Map
    Map --> MapFilter
    Map --> Home
    StoreDetail --> Home

    Home --> Login
    Login --> Signup
    Signup --> Terms
    Signup --> Home

    Login -->|"ロール1ログイン成功<br/>Login role 1 Thành công"| HomeRole1
    Login -->|"ロール2ログイン成功<br/>Login role 2 Thành công"| AdminDashboard
```

**Điểm chính (Role 3 — Guest & Auth):**

- Guest có thể duyệt `ホーム・検索画面`, `店舗詳細・メニュー画面`, `地図検索画面` mà không cần login.
- Khi cần thao tác cần xác thực (đăng review, save favorites, owner work…), Guest bị chuyển sang `ログイン画面`.
- `ログイン画面` nhánh sang `サインアップ画面` (chưa có tài khoản) và bắt buộc đồng ý `利用規約の画面` trước khi tạo tài khoản.
- Sau login thành công:
  - Role 1 → quay về `ホーム・検索画面` (vào sơ đồ Role 1).
  - Role 2 → tới `管理者ダッシュボード画面` (vào sơ đồ Role 2).
- `マップ用フィルターポップアップ画面` mở dạng popup từ `地図検索画面`.

## Tổng hợp

| Tuyến chính | Cụm role |
|---|---|
| Discovery (Home → Map / Detail / Reviews) | Role 1 + Role 3 |
| User-only (Profile, Notifications, Favorites, Write review) | Role 1 |
| Authentication (Login / Signup / Terms) | Role 3 → Role 1 hoặc Role 2 |
| Owner workflow (Dashboard → Edit / Register / Menu / Coupon / Campaign) | Role 2 |
