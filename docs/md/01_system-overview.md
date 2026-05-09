# 01 — システム概要 / Tổng quan hệ thống

> Sheet `システム概要` — sheet 1/14. Phiên bản đầy đủ ở `docs/csv/01_システム概要.csv`.

## 1. 問題 / Vấn đề cần giải quyết

| Đối tượng | Vấn đề |
|---|---|
| 在ハノイ日本人 — Người Nhật làm việc tại Hà Nội | Không thể giới thiệu cho đồng nghiệp / khách Nhật sang công tác một quán Việt vừa ngon vừa hợp khẩu vị Nhật. |
| 日本語が話せるレストラン経営者 — Chủ nhà hàng Hà Nội biết tiếng Nhật | Khó thu hút khách Nhật đến quán. |

## 2. 想定ユーザー / Người dùng mục tiêu

1. **ハノイ在住の日本人ビジネスマン** — Người Nhật đang làm việc / sinh sống tại Hà Nội.
2. **ハノイのレストラン経営者（日本語対応可）** — Chủ nhà hàng tại Hà Nội (có thể giao tiếp tiếng Nhật).

## 3. 課題・解決策 / Bài toán & Giải pháp

| ID | Đối tượng | 課題 / Bài toán | 解決策 / Giải pháp |
|---:|---|---|---|
| 1 | Người Nhật tại Hà Nội | Tìm nhanh nhà hàng khớp nhu cầu (hỗ trợ tiếng Nhật, sạch sẽ, có điều hòa…). | Bộ lọc tìm kiếm chi tiết theo cơ sở vật chất + ngôn ngữ. |
| 2 | Người Nhật tại Hà Nội | Cần đánh giá thật, có ảnh, từ người dùng đáng tin trước khi đến quán. | Cho phép đăng ảnh kèm review + xác thực user (Verified User). |
| 3 | Người Nhật tại Hà Nội | Cần biết trước món có nguyên liệu khó ăn (mắm tôm, nội tạng…). | Thẻ cảnh báo nguyên liệu (NG食材) + huy hiệu "Hợp khẩu vị Nhật". |
| 4 | Người Nhật tại Hà Nội | Cần lọc theo ngân sách (200k–500k VND…). | Bộ lọc theo khoảng giá + hiển thị mức ngân sách trung bình. |
| 5 | Chủ nhà hàng | Cần dữ liệu khách quan về vị / vệ sinh / phục vụ để cải thiện. | Dashboard thu thập đánh giá theo 3 trục: Vị, Vệ sinh, Phục vụ. |
| 6 | Chủ nhà hàng | Cần quản lý nhiều thông tin & menu một cách thoải mái. | Web Admin Portal tối ưu cho màn hình PC. |
| 7 | Người Nhật tại Hà Nội | Muốn xem trực quan các quán quanh vị trí hiện tại. | Tìm kiếm & hiển thị nhà hàng quanh khu vực bằng bản đồ. |
| 8 | Người Nhật tại Hà Nội | Muốn nhận thông báo món mới / khuyến mãi từ quán yêu thích. | Push / email notification. |
| 9 | Chủ nhà hàng | Muốn đẩy chiến dịch khuyến mãi vào dịp lễ / sự kiện. | Tạo & quản lý mã giảm giá (coupon) theo thời gian + tỉ lệ. |

## 4. アプリ名称 / Tên ứng dụng

> **JVDine** — viết tắt **JV (Japan – Vietnam) + Dine (ăn)**.

## 5. ロール一覧 / Danh sách Role

| ID | Role | Mô tả |
|---:|---|---|
| 1 | **一般ユーザー（日本人客）** — Người dùng thường (khách Nhật) | Tìm quán Việt tại Hà Nội, xem & viết đánh giá. |
| 2 | **店舗管理者（レストランオーナー）** — Quản lý cửa hàng (chủ nhà hàng) | Đăng ký / cập nhật thông tin quán, phân tích đánh giá của khách Nhật. |
| 3 | **ゲスト** — Khách (chưa đăng nhập) | Tìm kiếm, xem thông tin & đánh giá quán. *Không* được đăng / bình luận. |

## 6. 機能一覧 / Danh sách chức năng

| ID | Tên chức năng | 解決策ID | Role | Mô tả |
|---:|---|:---:|:---:|---|
| 1 | 詳細・予算検索機能 — Tìm kiếm chi tiết & ngân sách | 1, 4 | 1, 3 | Lọc quán theo điều hòa, độ sạch sẽ, ngôn ngữ, ngân sách 200k–500k VND… |
| 2 | 写真付きレビュー・認証機能 — Đánh giá kèm ảnh & Xác thực | 2 | 1 | User đã xác thực có thể đăng / xem đánh giá kèm ảnh đáng tin cậy. |
| 3 | NG食材・味付け警告機能 — Cảnh báo nguyên liệu / hương vị | 3 | 1, 3 | Hiển thị thẻ cảnh báo (mắm tôm, nội tạng…) hoặc huy hiệu "Hợp khẩu vị Nhật". |
| 4 | 店舗情報管理機能 (Web版) — Quản lý thông tin quán (Web) | 6 | 2 | Đăng ký / chỉnh sửa thông tin cơ bản, thực đơn, cơ sở vật chất bằng PC. |
| 5 | 評価・フィードバック分析機能 — Phân tích đánh giá / phản hồi | 5 | 2 | Vẽ biểu đồ trên Dashboard theo 3 trục: Vị, Sạch, Phục vụ. |
| 6 | お気に入り機能 — Yêu thích | – | 1 | Cho phép user lưu & quản lý nhà hàng yêu thích. |
| 7 | 地図検索機能 — Tìm kiếm bằng bản đồ | 7 | 1, 3 | Hiển thị & tìm nhà hàng quanh vị trí hiện tại trên bản đồ. |
| 8 | 認証・ログイン機能 — Đăng nhập & xác thực | – | 1, 2, 3 | Đăng ký, đăng nhập, phân quyền. |
| 9 | 通知機能 — Thông báo | 8 | 1 | Notify trên app / email khi quán thêm món mới hoặc giảm giá. |
| 10 | セール適用機能 — Áp dụng khuyến mãi | 9 | 2 | Áp dụng % giảm giá vào những ngày đặc biệt. |
| 11 | プロフィール管理機能 — Quản lý thông tin cá nhân | 2, 3 | 1, 2 | User & owner có thể xem / cập nhật info, dị ứng, info xuất hoá đơn đỏ (VAT). |

## 7. 画面一覧 / Danh sách màn hình

| ID | Tên màn hình | 機能ID | Role | Mô tả |
|---:|---|:---:|:---:|---|
| 1 | ホーム・検索画面 — Trang chủ & Tìm kiếm | 1 | 1, 3 | Hiển thị quán gợi ý + bộ lọc tìm kiếm chi tiết. |
| 2 | 店舗詳細・メニュー画面 — Chi tiết quán & Thực đơn | 2, 3 | 1, 3 | Thông tin cơ bản, thẻ NG食材 và đánh giá của user khác. |
| 3 | レビュー投稿画面 — Viết đánh giá | 2 | 1 | Form upload ảnh + chấm sao (Vị, Sạch, Phục vụ). |
| 4 | 管理者ダッシュボード画面 (Web) — Dashboard Admin – Web | 5 | 2 | Owner đăng nhập rồi xem biểu đồ thống kê đánh giá từ khách Nhật. |
| 5 | 店舗情報編集画面 (Web) — Chỉnh sửa thông tin quán – Web | 4 | 2 | Thêm món, đổi giá, cập nhật cơ sở vật chất trên PC. |
| 6 | ログイン画面 — Đăng nhập | 8 | 1, 2, 3 | User / owner đã có tài khoản đăng nhập. |
| 7 | お気に入り一覧画面 — Danh sách yêu thích | 6 | 1 | Hiển thị danh sách nhà hàng đã lưu. |
| 8 | 地図検索画面 — Tìm kiếm bằng bản đồ | 7 | 1, 3 | Tìm & hiển thị nhà hàng quanh khu vực trên bản đồ. |
| 9 | 通知一覧画面 — Thông báo | 9 | 1 | Hiển thị các chương trình giảm giá & notify từ quán theo dõi. |
| 10 | キャンペーン・クーポン作成画面 — Tạo khuyến mãi / mã giảm giá | 10 | 2 | Tạo coupon, set rule giảm + push notify cho tệp khách mục tiêu. |
| 11 | プロフィール画面 — Thông tin cá nhân | 11 | 1, 2 | Quản lý info cơ bản, info dị ứng. |
| 12 | 店舗情報登録画面 — Đăng ký thông tin nhà hàng | 4 | 2 | Form đăng ký quán mới: ảnh, tiện nghi, thực đơn. |
| 13 | 登録画面 — Đăng ký tài khoản | 8 | 1, 2, 3 | Tạo tài khoản bằng email + mật khẩu. |
| 14 | クーポン管理画面 — Quản lý mã giảm giá | 10 | 2 | Tạo / xóa mã. Mỗi mã có mức giảm, hạn dùng, điều kiện áp dụng. |
| 15 | 店舗詳細情報画面 — Chi tiết thông tin nhà hàng | 1 | 1, 3 | Hiển thị địa chỉ, giờ mở cửa, loại ẩm thực, mức giá, tiện ích. |
| 16 | レビュー閲覧画面 — Xem đánh giá | 2 | 1, 3 | Hiển thị điểm + comment + info người đánh giá. |
| 17 | 店舗情報編集画面（メニュー管理） — Chỉnh sửa quán – Thực đơn | 4 | 2 | Owner thêm / sửa / xóa món, xem danh sách thực đơn. |
| 18 | 利用規約の画面 — Điều khoản sử dụng | 8 | 1, 2 | Hiển thị điều khoản, bắt buộc đồng ý trước khi sử dụng / đăng ký. |
| 19 | マップ用フィルターポップアップ画面 — Popup bộ lọc bản đồ | 7 | 1, 3 | Popup lọc theo danh mục, giá, đánh giá, trạng thái hoạt động. |

## Mapping nhanh: Role × Screen

| Role | Các màn hình truy cập được |
|---|---|
| **Role 1 — User Nhật** | 1, 2, 3, 6, 7, 8, 9, 11, 13, 15, 16, 18 |
| **Role 2 — Owner** | 4, 5, 6, 10, 11, 12, 13, 14, 17, 18 |
| **Role 3 — Guest** | 1, 2, 6, 8, 13, 15, 16, 19 |
