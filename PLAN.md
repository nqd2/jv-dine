# Sprint Backlog 3 Implementation Plan — JV-Dine

Thiết lập kế hoạch chi tiết cho việc phát triển toàn bộ các tính năng thuộc **Sprint Backlog 3** bao gồm:
1. **お気に入り / Yêu thích (P_ID 9)**
2. **評価・フィードバック分析 / Phân tích đánh giá & phản hồi (P_ID 10)**
3. **セール適用 / Áp dụng khuyến mãi (P_ID 11)**
4. **通知 / Thông báo (P_ID 12)**
5. **プロフィール管理 / Quản lý thông tin cá nhân (P_ID 13)**

---

## User Review Required

> [!IMPORTANT]
> **Thay đổi Database Schema (Prisma)**
> Chúng ta sẽ cần cập nhật file [schema.prisma](file:///home/nqd2/code/jv-dine/apps/api/prisma/schema.prisma) để hỗ trợ các chức năng mới:
> 1. Thêm bảng `UserFavorite` để lưu danh sách nhà hàng yêu thích của người dùng (quan hệ N-N giữa `User` và `Restaurant`).
> 2. Bổ sung các trường `phone`, `location`, `bio`, `avatar_url` vào bảng `User` để hỗ trợ chỉnh sửa thông tin cá nhân.
> 3. Thêm trường `views_count` (mặc định = 0) vào bảng `Restaurant` để đếm tổng lượt xem cho Owner Dashboard.
> 4. Mở rộng bảng `Coupon` để lưu thêm thông tin chi tiết: tên/mô tả đa ngôn ngữ, loại giảm giá (percent/amount), giới hạn lượt dùng, ngày bắt đầu/kết thúc và trạng thái hoạt động.

> [!WARNING]
> **Figma Design Integration**
> Bạn đã cung cấp đầy đủ link Figma cho cả 6 màn hình thuộc Sprint 3:
> 1. **お気に入り一覧画面 / Danh sách yêu thích** (Màn hình 7): [Figma Node 20-1575](https://www.figma.com/design/0NjP6xaJO100sHpzF7M1ZL/ITSS?node-id=20-1575&t=a5BnNKa0d26zKplH-0)
> 2. **管理者ダッシュボード画面 (Web) / Bảng điều khiển** (Màn hình 4): [Figma Node 202-460](https://www.figma.com/design/0NjP6xaJO100sHpzF7M1ZL/ITSS?node-id=202-460&t=a5BnNKa0d26zKplH-0)
> 3. **キャンペーン・クーポン作成画面 / Tạo khuyến mãi, mã giảm giá** (Màn hình 10): [Figma Node 68-2](https://www.figma.com/design/0NjP6xaJO100sHpzF7M1ZL/ITSS?node-id=68-2&t=a5BnNKa0d26zKplH-0)
> 4. **割引コード管理画面 (クーポン管理画面) / Quản lý mã giảm giá** (Màn hình 14): [Figma Node 95-337](https://www.figma.com/design/0NjP6xaJO100sHpzF7M1ZL/ITSS?node-id=95-337&t=a5BnNKa0d26zKplH-0)
> 5. **通知一覧画面 / Thông báo** (Màn hình 9): [Figma Node 20-2201](https://www.figma.com/design/0NjP6xaJO100sHpzF7M1ZL/ITSS?node-id=20-2201&t=a5BnNKa0d26zKplH-0)
> 6. **プロフィール画面 / Thông tin cá nhân** (Màn hình 11): [Figma Node 20-2090](https://www.figma.com/design/0NjP6xaJO100sHpzF7M1ZL/ITSS?node-id=20-2090&t=a5BnNKa0d26zKplH-0)
> 
> Tôi sẽ thiết kế giao diện premium chuẩn khớp 100% với các node Figma này.

---

## Open Questions

> [!NOTE]
> **Lưu trữ ảnh đại diện**: Khi cập nhật ảnh đại diện (avatar), bạn có muốn tích hợp upload trực tiếp lên Cloudflare R2 giống như ảnh món ăn/nhà hàng không? (Đề xuất: Có, tích hợp qua API uploads có sẵn).

---

## Proposed Changes

### 1. Database & Prisma Schema

#### [MODIFY] [schema.prisma](file:///home/nqd2/code/jv-dine/apps/api/prisma/schema.prisma)
- Thêm model `UserFavorite` và thiết lập các quan hệ:
  ```prisma
  model UserFavorite {
    user_id       Int
    restaurant_id Int
    created_at    DateTime @default(now()) @db.Timestamptz

    user       User       @relation(fields: [user_id], references: [id], onDelete: Cascade)
    restaurant Restaurant @relation(fields: [restaurant_id], references: [id], onDelete: Cascade)

    @@id([user_id, restaurant_id])
    @@map("user_favorites")
  }
  ```
- Cập nhật model `User`:
  - Thêm `phone String? @db.VarChar(64)`
  - Thêm `location String? @db.Text`
  - Thêm `bio String? @db.Text`
  - Thêm `avatar_url String? @db.VarChar(2048)`
  - Thêm relation: `favorites UserFavorite[]`
- Cập nhật model `Restaurant`:
  - Thêm `views_count Int @default(0)`
  - Thêm relation: `favorited_by UserFavorite[]`
- Cập nhật model `Coupon`:
  - Thêm `name_ja String? @db.VarChar(255)`
  - Thêm `name_vn String? @db.VarChar(255)`
  - Thêm `description_ja String? @db.Text`
  - Thêm `description_vn String? @db.Text`
  - Thêm `discount_type String @default("percentage")` // "percentage" | "amount"
  - Thêm `discount_value Int` // thay thế/bổ sung cho discount_rate
  - Thêm `start_date DateTime? @db.Date`
  - Thêm `usage_limit Int?`
  - Thêm `status String @default("active")` // "active" | "paused" | "expired"
  - Thêm `views_count Int @default(0)`
  - Thêm `usages_count Int @default(0)`

---

### 2. Backend Module Updates (`apps/api`)

#### [NEW] [favorites](file:///home/nqd2/code/jv-dine/apps/api/src/modules/favorites)
- Xây dựng module quản lý danh sách yêu thích:
  - `favorites.controller.ts`:
    - `POST /favorites` — Toggle yêu thích (Thêm nếu chưa có, xóa nếu đã có)
    - `GET /favorites/me` — Lấy danh sách quán yêu thích của user hiện tại
  - `favorites.service.ts` & `favorites.repository.ts` tương tác với bảng `UserFavorite`.

#### [MODIFY] [users.controller.ts](file:///home/nqd2/code/jv-dine/apps/api/src/modules/users/users.controller.ts)
- Cập nhật endpoint `PATCH /users/:id` để hỗ trợ cập nhật `phone`, `location`, `bio`, `avatar_url` một cách an toàn.

#### [MODIFY] [restaurants.controller.ts](file:///home/nqd2/code/jv-dine/apps/api/src/modules/restaurants/restaurants.controller.ts)
- Thêm API tăng lượt xem: `POST /restaurants/:id/view` — Tăng `views_count` lên 1.
- Thêm API phân tích thống kê cho Dashboard của chủ quán: `GET /restaurants/:id/analytics?period=week|month|year`
  - Trả về các KPI: `views_count`, `reviews_count`, `average_rating`, `favorites_count` (đếm từ `UserFavorite`).
  - Trả về dữ liệu biểu đồ: Danh sách điểm đánh giá (taste, cleanliness, service) và số lượng đánh giá theo mốc thời gian trong khoảng `period` đã chọn.

#### [MODIFY] [coupons.controller.ts](file:///home/nqd2/code/jv-dine/apps/api/src/modules/coupons/coupons.controller.ts)
- Cập nhật các DTO `CreateCouponDto` và `UpdateCouponDto` để bao gồm các trường mới mở rộng.
- Hỗ trợ cập nhật trạng thái `active` / `paused` của coupon.

#### [MODIFY] [menus.service.ts](file:///home/nqd2/code/jv-dine/apps/api/src/modules/menus/menus.service.ts) & [coupons.service.ts](file:///home/nqd2/code/jv-dine/apps/api/src/modules/coupons/coupons.service.ts)
- Tích hợp logic **Thông báo tự động (P_ID 12)**:
  - Khi Owner thêm món mới hoặc tạo coupon mới:
    - Truy vấn danh sách các `user_id` đã yêu thích nhà hàng từ bảng `UserFavorite`.
    - Tạo hàng loạt bản ghi `Notification` trong DB với nội dung dạng: `[Nhà hàng A] vừa ra mắt món mới: [Tên món]` hoặc `[Nhà hàng A] gửi tặng bạn mã giảm giá: [Code]`.

---

### 3. Frontend Web Views (`apps/web`)

#### [NEW] [favorites/page.tsx](file:///home/nqd2/code/jv-dine/apps/web/app/favorites/page.tsx) (Màn hình 7)
- Hiển thị danh sách các nhà hàng mà người dùng đã bấm yêu thích.
- Mỗi card nhà hàng gồm: ảnh bìa, tên nhà hàng, cuisine, khoảng giá, và nút "Bỏ thích" nhanh. Bấm card chuyển đến trang chi tiết.
- Hỗ trợ đầy đủ đa ngôn ngữ (JP / VN).

#### [NEW] [profile/page.tsx](file:///home/nqd2/code/jv-dine/apps/web/app/profile/page.tsx) (Màn hình 11)
- Hiển thị thông tin cá nhân: Ảnh đại diện dạng tròn, Tên, Bio, Ngày tham gia, Email (read-only), Số điện thoại, Nơi ở.
- Nút "Chỉnh sửa" mở form/modal cho phép cập nhật thông tin cá nhân, tích hợp upload ảnh avatar lên Cloudflare R2 qua API uploads.
- Hiển thị các khối thống kê: `Số đánh giá đã viết`, `Số nhà hàng yêu thích` (nhấp chuyển sang danh sách yêu thích).

#### [NEW] [notifications/page.tsx](file:///home/nqd2/code/jv-dine/apps/web/app/notifications/page.tsx) (Màn hình 9)
- Liệt kê danh sách thông báo in-app của user.
- Nút "Đánh dấu đã đọc tất cả".
- Với thông báo chứa coupon: hiển thị nút Copy code nhanh và nút "Xem chi tiết" dẫn sang trang nhà hàng.
- Hiển thị badge số thông báo chưa đọc trên Header/Navbar của toàn trang.

#### [NEW] [dashboard/restaurant/coupons/page.tsx](file:///home/nqd2/code/jv-dine/apps/web/app/dashboard/restaurant/coupons/page.tsx) (Màn hình 14)
- Bảng điều khiển quản lý coupon dành cho chủ quán.
- Hiển thị KPI: Tổng số coupon, Đang chạy (Active), Tạm dừng (Paused), Lượt xem, Lượt dùng.
- Hiển thị danh sách các coupon hiện tại dưới dạng grid card kèm thanh tiến độ sử dụng.
- Nút "Tạo mới" dẫn sang trang tạo. Hành động trên từng coupon: Tạm dừng / Tiếp tục, Xóa.

#### [NEW] [dashboard/restaurant/coupons/new/page.tsx](file:///home/nqd2/code/jv-dine/apps/web/app/dashboard/restaurant/coupons/new/page.tsx) (Màn hình 10)
- Form tạo coupon mới: Tên (JP/VN), Mô tả (JP/VN), Loại giảm giá (Percent / Amount), Giá trị giảm, Giới hạn sử dụng, Ngày bắt đầu & kết thúc.
- Validation ngày kết thúc phải sau ngày bắt đầu, giá trị phải hợp lệ.

#### [MODIFY] [dashboard/page.tsx](file:///home/nqd2/code/jv-dine/apps/web/app/dashboard/page.tsx) (Màn hình 4)
- Nâng cấp Dashboard Owner thành phiên bản premium đầy đủ tính năng:
  - Hiển thị 4 thẻ KPI động lấy từ API analytics.
  - Hiển thị danh sách 3 đánh giá mới nhất kèm sao và bình luận của khách.
  - Tích hợp biểu đồ trực quan (sử dụng SVG tùy biến động hoặc thư viện biểu đồ gọn nhẹ) hiển thị xu hướng điểm đánh giá.
  - Bộ lọc thời gian: Tuần (Week) / Tháng (Month) / Năm (Year) tự động reload biểu đồ.
  - Các nút hành động nhanh: Sửa quán, Quản lý coupon, Quản lý menu.

---

## Verification Plan

### Automated Tests
1. **Prisma Migrations**: Chạy lệnh migrate local để đảm bảo schema hoạt động hoàn hảo:
   ```bash
   pnpm --filter api prisma migrate dev --name add_sprint3_schema
   ```
2. **Backend Unit Tests**: Viết và chạy test suite cho favorites, coupons, và notifications để đảm bảo logic API chính xác 100%:
   ```bash
   pnpm --filter api run test
   ```
3. **Build & Linting**: Xác nhận cả dự án build thành công không lỗi:
   ```bash
   pnpm run build
   ```

### Manual Verification
1. **Flow Yêu thích**:
   - Truy cập trang nhà hàng -> Bấm icon "Yêu thích" -> Xác nhận icon đổi trạng thái -> Vào `/favorites` xác nhận hiển thị.
   - Bấm icon "Bỏ thích" -> Xác nhận nhà hàng biến mất khỏi danh sách ngay lập tức.
2. **Flow Thông báo**:
   - User A thích nhà hàng X.
   - Owner của nhà hàng X đăng món ăn mới hoặc coupon mới.
   - User A tải lại trang -> Xác nhận Header hiển thị badge đỏ thông báo chưa đọc -> Vào `/notifications` xem chi tiết.
3. **Flow Owner Dashboard**:
   - Truy cập `/dashboard` -> Xác nhận các thẻ KPI và biểu đồ hiển thị đẹp mắt, khớp dữ liệu thật.
   - Đổi bộ lọc Tuần/Tháng/Năm -> Xác nhận biểu đồ vẽ lại chính xác.
4. **Flow Profile**:
   - Truy cập `/profile` -> Bấm sửa -> Thay đổi avatar, bio, nơi ở -> Bấm lưu -> Tải lại trang và kiểm tra DB xem đã ghi đè thành công chưa.
