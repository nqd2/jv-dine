# 05 — プロダクトバックログ / Product Backlog

> Sheet `プロダクトバックログ` — sheet 5/14. Bản gốc: `docs/csv/05_プロダクトバックログ.csv`. Có 13 PBI (Product Backlog Items).

## Trường dữ liệu

- **P_ID**: ID Product Backlog Item.
- **機能 / Chức năng**: Tên chức năng (JP / VN).
- **ユーザーストーリー / User Story**: "Là *<ai>*, tôi muốn *<gì>*, vì *<tại sao>*" (JP / VN).
- **優先度 / Ưu tiên**: 1 = cao nhất; mỗi mức ưu tiên duy nhất (xem checklist `06_pb-checklist.md`).
- **受入条件 / Điều kiện chấp nhận** (Acceptance Criteria): tham chiếu cụ thể tới từng màn hình theo ID.
- **ステータス / Trạng thái**: 未対応 = Chưa làm.
- **備考**: Ghi chú phụ.

## Tổng quan

| P_ID | Chức năng | Ưu tiên | Trạng thái |
|---:|---|:---:|---|
| 1 | DB設計 / Thiết kế cơ sở dữ liệu | 1 | 未対応 |
| 2 | 開発環境整備 / Thiết lập môi trường phát triển | 2 | 未対応 |
| 3 | 認証・ログイン / Đăng nhập & xác thực | 3 | 未対応 |
| 4 | 詳細・予算検索 / Tìm kiếm chi tiết & ngân sách | 4 | 未対応 |
| 5 | 店舗情報管理 (Web) / Quản lý thông tin quán – Web | 5 | 未対応 |
| 6 | 地図検索 / Tìm kiếm bằng bản đồ | 6 | 未対応 |
| 7 | NG食材・味付け警告 / Cảnh báo nguyên liệu & hương vị | 7 | 未対応 |
| 8 | 写真付きレビュー・認証 / Đánh giá kèm ảnh & xác thực | 8 | 未対応 |
| 9 | お気に入り / Yêu thích | 9 | 未対応 |
| 10 | 評価・フィードバック分析 / Phân tích đánh giá & phản hồi | 10 | 未対応 |
| 11 | セール適用 / Áp dụng khuyến mãi | 11 | 未対応 |
| 12 | 通知 / Thông báo | 12 | 未対応 |
| 13 | プロフィール管理 / Quản lý thông tin cá nhân | 13 | 未対応 |

## Chi tiết từng PBI

### P_ID 1 — DB設計 / Thiết kế cơ sở dữ liệu

- **User story**: なし / Không có (technical PBI).
- **AC**:
  - ER図 đã hoàn thành.
  - Migration chạy bình thường.
  - Test thao tác CRUD pass.

### P_ID 2 — 開発環境整備 / Thiết lập môi trường phát triển

- **User story**: なし / Không có.
- **AC**:
  - Application khởi chạy bình thường ở local.

### P_ID 3 — 認証・ログイン / Đăng nhập & xác thực

- **User story**: Là **user / chủ quán**, tôi muốn **đăng ký + đăng nhập** vì **muốn dùng các chức năng (review, ...) một cách an toàn**.
- **AC**:
  - Tạo tài khoản thành công từ màn `ID 13 – 登録画面`.
  - Đăng nhập đúng từ màn `ID 6 – ログイン画面` → chuyển đúng tới `ID 1 – ホーム・検索画面`.
  - Sai info → hiển thị error message.

### P_ID 4 — 詳細・予算検索 / Tìm kiếm chi tiết & ngân sách

- **User story**: Là **user thường / khách**, tôi muốn **tìm quán theo điều hòa, độ sạch, ngân sách, ngôn ngữ** vì **muốn nhanh chóng tìm quán đúng nhu cầu**.
- **AC**:
  - Có thể chọn các điều kiện lọc tại `ID 1 – ホーム・検索画面`.
  - Khi search, chỉ hiển thị quán **khớp hoàn toàn** điều kiện.
  - Không có quán phù hợp → hiển thị "見つかりませんでした / Không tìm thấy".

### P_ID 5 — 店舗情報管理 (Web) / Quản lý thông tin quán – Web

- **User story**: Là **chủ nhà hàng**, tôi muốn **đăng ký + chỉnh sửa thông tin quán từ máy tính** vì **muốn cung cấp info mới nhất + chính xác tới khách Nhật để hút khách**.
- **AC**:
  - Có thể nhập + lưu trường bắt buộc tại `ID 12 – 店舗情報登録画面`, `ID 5 – 店舗情報編集画面`, `ID 17 – 店舗情報編集画面（メニュー管理）`.
  - Sau khi lưu, info mới được cập nhật vào DB.
  - Nội dung cập nhật phản ánh **ngay lập tức** trên `ID 15 – 店舗詳細情報画面`.

### P_ID 6 — 地図検索 / Tìm kiếm bằng bản đồ

- **User story**: Là **user thường / khách**, tôi muốn **tìm quán quanh vị trí hiện tại trên bản đồ** vì **muốn xác định khoảng cách, vị trí trực quan để chọn quán dễ đi**.
- **AC**:
  - Bản đồ hiển thị bình thường tại `ID 8 – 地図検索画面`.
  - Pin được đặt đúng vị trí quán khớp điều kiện tìm.
  - Tap pin → hiển thị popup info tóm tắt quán.
- **備考**: API map → DevTeam tự chọn API.

### P_ID 7 — NG食材・味付け警告 / Cảnh báo nguyên liệu & hương vị

- **User story**: Là **user thường / khách**, tôi muốn **xem thẻ cảnh báo + huy hiệu "Hợp khẩu vị Nhật" trên menu** vì **muốn tránh nguyên liệu khó ăn + yên tâm gọi món**.
- **AC**:
  - Tại `ID 17`, owner có thể set tag "NG食材" / "Dành cho người Nhật" khi đăng ký món + lưu DB.
  - Tại `ID 2 – 店舗詳細・メニュー画面`, các tag hiển thị rõ ràng dạng badge trên UI từng món.

### P_ID 8 — 写真付きレビュー・認証 / Đánh giá kèm ảnh & xác thực

- **User story**: Là **user thường**, tôi muốn **đăng + xem review kèm ảnh + sao** vì **muốn chia sẻ nhận xét đáng tin cậy giúp người khác chọn quán**.
- **AC**:
  - User đã login có thể đăng từ `ID 3 – レビュー投稿画面`.
  - Data đăng (ảnh + sao) lưu DB.
  - Tại `ID 16 – レビュー閲覧画面`, hiển thị theo thứ tự **mới nhất trước**.

### P_ID 9 — お気に入り / Yêu thích

- **User story**: Là **user thường**, tôi muốn **lưu + quản lý nhà hàng yêu thích** vì **muốn dễ tìm lại + xem chi tiết / đặt bàn nhanh**.
- **AC**:
  - Bấm icon "Yêu thích" → lưu vào danh sách user.
  - Danh sách quán đã lưu hiển thị tại `ID 7 – お気に入り一覧画面`.
  - Bấm xóa → quán bị ẩn ngay khỏi list, DB cập nhật.

### P_ID 10 — 評価・フィードバック分析 / Phân tích đánh giá & phản hồi

- **User story**: Là **chủ nhà hàng**, tôi muốn **vẽ biểu đồ + phân tích đánh giá khách (vị, sạch, phục vụ)** vì **muốn nắm bắt khách quan strengths/weaknesses + cải thiện dịch vụ**.
- **AC**:
  - Dữ liệu tổng hợp hiển thị chính xác tại `ID 4 – 管理者ダッシュボード画面`.
  - Biểu đồ đường vẽ đúng theo **tuần / tháng / năm** đã chọn.

### P_ID 11 — セール適用 / Áp dụng khuyến mãi

- **User story**: Là **chủ nhà hàng**, tôi muốn **tạo + quản lý mã giảm giá có thiết lập % và điều kiện** vì **muốn chạy khuyến mãi vào dịp lễ / sự kiện đặc biệt + thu hút khách**.
- **AC**:
  - Tại `ID 10 – キャンペーン・クーポン作成画面` thiết lập được giảm giá + phát coupon.
  - Tại `ID 14 – クーポン管理画面` xem được list + xóa thành công.

### P_ID 12 — 通知 / Thông báo

- **User story**: Là **user thường**, tôi muốn **nhận thông báo khi có món mới hoặc khuyến mãi** vì **muốn không bỏ lỡ thông tin ưu đãi từ quán quen**.
- **AC**:
  - Khi quán yêu thích thêm món / khuyến mãi → user nhận in-app notify.
  - User có thể xem lại lịch sử thông báo.

### P_ID 13 — プロフィール管理 / Quản lý thông tin cá nhân

- **User story**: Là **user / chủ nhà hàng**, tôi muốn **xem + cập nhật info cơ bản** vì **muốn giữ info luôn mới để thuận tiện cho việc đặt bàn**.
- **AC**:
  - Info user hiện tại hiển thị chính xác tại `ID 11 – プロフィール画面`.
  - Edit + bấm Save → DB ghi đè + cập nhật.
