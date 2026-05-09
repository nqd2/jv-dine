# 03 — 画面設計書 / Thiết kế màn hình

> Sheet `画面設計書` — sheet 3/14, 19 màn hình. Bản gốc đầy đủ ở `docs/csv/03_画面設計書.csv` (≈1810 dòng).
> Mỗi màn hình được mô tả bằng bảng `項目名称 / 分類 / 選択肢・入力値 / 処理内容 / 備考`. Để tránh lặp, các phần tử header chung (logo, link login, nút đăng ký, nút chuyển ngôn ngữ JP/VN…) được trích ra thành một section dùng chung; mỗi màn hình chỉ liệt kê những phần tử riêng và những hành vi đặc biệt.

## Quy ước cột

| Cột | Ý nghĩa |
|---|---|
| **No** | Số thứ tự phần tử trong màn hình |
| **項目 / Item** | Tên phần tử (JP / VN) |
| **分類 / Loại** | Loại UI (画像 / リンク / ボタン / テキストボックス / チェックボックス / ドロップダウン / マップ / カード …) |
| **入力値 / Input** | Loại dữ liệu chấp nhận hoặc danh sách lựa chọn |
| **処理 / Hành vi** | Trigger + xử lý |
| **備考 / Ghi chú** | Ràng buộc, validation, mặc định, v.v. |

## Common Header (áp dụng hầu hết các màn hình)

| Item | Hành vi |
|---|---|
| **ヘッダーロゴ / Logo Header** (画像) | Khi load màn hình hiển thị logo "JVDine" góc trên trái. Click → về trang chủ. Nếu lỗi ảnh → hiển thị ảnh default. |
| **ログインリンク / Đăng nhập** (button/link) | Hiện khi chưa login → click chuyển sang `ログイン画面`. Sau khi login → đổi thành "Hồ sơ cá nhân" / Profile. |
| **登録ボタン / Đăng ký** (button) | Hiện khi chưa login → click chuyển sang `サインアップ画面`. Sau khi login → đổi thành "Đăng xuất". |
| **言語切り替えトグル / Toggle ngôn ngữ** | Toggle JP / VN, trạng thái lưu ở Local Storage / Session. Mặc định "JP". |
| **ヘッダーナビゲーション (Web admin only)** | Cho Owner: link `ダッシュボード / 店舗編集 / キャンペーン`. Trang đang ở in đậm (active). |
| **ログアウト** | (Owner / User đã login) Hủy session, chuyển về Login hoặc Home. Có thể có popup xác nhận. |

---

## Màn hình 1 — ホーム・検索画面 / Trang chủ & Tìm kiếm

- **Role**: 1 (User), 3 (Guest)

| No | Item (JP / VN) | Loại | Input | Hành vi & Ghi chú |
|---:|---|---|---|---|
| 4 | メインタイトル / Tiêu đề chính | label | – | Static text trên banner đỏ. |
| 5 | 検索バー (キーワード) / Thanh tìm kiếm | textbox | Tên nhà hàng, tên món | Auto-complete (suggest) theo nội dung. Placeholder: "レストラン, món ăn..." |
| 6 | 地図で検索ボタン / Tìm trên bản đồ | button | – | Chuyển sang `地図検索画面` hoặc popup map. |
| 7 | 検索条件: エリア / Khu vực | dropdown | Quận Hà Nội (Hoàn Kiếm, Ba Đình…) | Click → mở danh sách quận. |
| 8 | 下限価格 / Giá dưới | textbox | số (ví dụ 200000) | Validate chỉ cho nhập số. Dùng làm mức giá min. |
| 9 | 上限価格 / Giá trên | textbox | số (ví dụ 500000) | Tương tự, mức giá max. |
| 10 | 検索条件: 料理 / Loại món | dropdown | Tên/loại món (Phở, Bún chả…) | Click → mở danh sách. |
| 11 | セクションタイトル / Tiêu đề | label | – | "おすすめのレストラン / Nhà hàng được đề xuất". |
| 12 | フィルターボタン / Lọc | button | – | Mở modal filter nâng cao. |
| 13 | レストランカード / Thẻ nhà hàng | card | – | Click → `店舗詳細画面`. Khi không có kết quả: hiển thị "Không tìm thấy nhà hàng phù hợp". |
| 14 | お気に入りボタン / Yêu thích | button | – | Toggle add/remove favorite. Yêu cầu đăng nhập (chưa login → chuyển Login). |

## Màn hình 2 — 店舗詳細・メニュー画面 / Chi tiết quán & Thực đơn

- **Role**: 1 (User), 3 (Guest)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | カバー画像 / Ảnh bìa | 画像 | Ảnh lớn đại diện quán. |
| 5 | お気に入りボタン / Yêu thích | button | Toggle favorite (yêu cầu login). |
| 6 | レストラン名と説明 / Tên & Mô tả | label | – |
| 7 | 評価バッジ / Huy hiệu đánh giá | label | Hiển thị "4.5 (128件)". Click → cuộn / chuyển tab "Đánh giá". |
| 8 | 店舗基本情報 / Thông tin cơ bản | label | Địa chỉ, SĐT, giờ mở cửa, khoảng giá. Có icon kèm. |
| 9 | レビュー記入ボタン / Viết đánh giá | button | Mở modal "レビュー投稿" — chưa login thì chuyển Login. |
| 10 | タブナビゲーション / Tab | tab | `メニュー / レビュー / 詳細情報`. Tab active gạch chân đỏ. |
| 11 | メニューアイテム / Thẻ món ăn | card | Tên, mô tả, giá. Có cảnh báo nguyên liệu hiển thị nổi bật trong card. Món cay → biểu tượng ớt. |

## Màn hình 3 — レビュー投稿画面 / Viết đánh giá

- **Role**: 1 (User)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | モーダルタイトル / Tiêu đề modal | label | "レビューを書く / Viết đánh giá". |
| 5 | サブタイトル / Phụ đề | label | "あなたの体験を他のお客様と共有しましょう". |
| 6 | 評価入力 (星) / Sao đánh giá | rating | 1–5 sao | Click/hover đổi màu sao + ghi nhận giá trị. Mặc định chưa chọn (0.0). Footer guide: "Vui lòng chọn đánh giá". |
| 7 | レビュー本文入力 / Nội dung | textarea | text ≤ 500 chars | (chi tiết tiếp ở phần sau sheet) |
| (…) | ảnh upload, nút gửi | | Form chuẩn upload + submit |

## Màn hình 4 — 管理者ダッシュボード画面 (Web) / Dashboard Admin (Web)

- **Role**: 2 (Owner)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 2 | ヘッダーナビゲーション | link | `ダッシュボード / 店舗編集 / キャンペーン`. Trang hiện tại in đậm. |
| 3 | ログアウトボタン | button | Hủy session, về Home/Login. Có thể có popup xác nhận. |
| 4 | ページタイトル | label | "Dashboard". |
| 5 | KPIカード (4種) / 4 thẻ KPI | card | Tổng lượt xem / Số đánh giá / Điểm TB / Số yêu thích. Lấy DB lúc load + tính tăng/giảm so với tháng trước. Tăng = xanh, giảm = đỏ. |
| 6 | セクションヘッダー | label | "Đánh giá gần đây". |
| 7 | "すべて見る" リンク | link | Sang màn hình Quản lý đánh giá. |
| 8 | レビューリスト | list | Lấy max 3 review mới nhất từ DB. |
| 9 | セクションタイトル | label | "Thao tác nhanh". |
| 10 | アクションボタン群 (4 nút) | button | (1) Sửa thông tin quán / (2) Tạo khuyến mãi / (3) Tải báo cáo / (4) Cập nhật thực đơn. Mỗi nút màu nền khác. |
| 11 | セクションタイトル | label | "Hiệu suất". |
| 12 | 期間選択ボタン / Chọn thời gian | button | `週 / 月 / 年`. Click → reload thống kê + biểu đồ. Default = 週 (tuần). Nút active highlight. |
| 13 | グラフエリア / Biểu đồ | container | Biểu đồ trực quan KPI. Có chú thích, nhãn trục, mốc giá trị. Khi chưa có data → empty state / placeholder. *Hiện tại analytics chưa hoàn chỉnh, hiển thị tĩnh; sau này nối API.* |

## Màn hình 5 — 店舗情報編集画面 (Web) / Chỉnh sửa thông tin quán

- **Role**: 2 (Owner)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | ページタイトル | label | "Sửa thông tin quán". |
| 5 | タブ切り替え | tab | `基本情報 / メニュー`. |
| 6 | 店舗名 (日・越) | textbox | Khi load, lấy giá trị cũ từ DB. **Bắt buộc**. |
| 7 | 説明 (日・越) | textarea | Multi-line, có thể edit. |
| 8 | 住所 | textbox | Có thể tích hợp Map API. |
| 9 | 連絡先・営業時間 | textbox | Validate format SĐT, giờ. |
| 10 | 価格帯・料理 | dropdown | Khoảng giá + loại món. |
| 11 | 写真アップロード | file upload | Click hoặc drag & drop, hiển thị preview. PNG/JPG, ≤ 10MB. |
| 12 | 設備・アメニティ | checkbox (multi) | エアコン, Wi-Fi, 駐車場, 英語対応, 日本語対応, カード可, 配達, 予約可. |
| 13 | キャンセルボタン | button | Discard thay đổi, về Dashboard. Nếu có thay đổi → popup xác nhận. |
| 14 | 保存ボタン | button | Validate → UPDATE DB → success message. Loading khi đang xử lý. |

## Màn hình 6 — ログイン画面 / Đăng nhập

- **Role**: 1, 2, 3

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | ページタイトル | label | "Đăng nhập". |
| 5 | メールアドレス入力 | textbox | Email format. Frontend validate (có "@"). Placeholder `your@email.com`. |
| 6 | パスワード入力 | password | Mask thành "●●●". Placeholder "........". |
| 7 | ログイン状態を保持 / Remember me | checkbox | Bật → set TTL token (Cookie) dài hơn. |
| 8 | パスワード忘れリンク | link | → `パスワード再設定画面`. |
| 9 | ログインボタン | button | Gọi API auth. **Thành công**: theo role chuyển Home (User) hoặc Dashboard (Owner). **Thất bại**: error message. Validate trống. |
| 10 | 新規登録リンク | link | → `会員登録画面`. |

## Màn hình 7 — お気に入り一覧画面 / Danh sách yêu thích

- **Role**: 1 (User)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 2 | プロフィール | button | → Profile, giữ login. |
| 3 | ログアウト | button | Logout, xóa session. |
| 4 | タイトル | text | Tiêu đề màn hình. Dài → xuống dòng / rút gọn. |
| 5 | キャッチコピー / Slogan | text | Slogan. Không có thì ẩn. |
| 6 | 料理タグ / Danh sách món | table | Lấy API/DB. 0 records → message. Nhiều records → phân trang. |
| 7 | 料理のサムネイル画像 | 画像 | Resize, lỗi → ảnh default, giữ tỉ lệ. |
| 8 | 料理名 | label | Dài → "...". Không có → "未設定 / chưa thiết lập". |
| 9 | 店舗情報 | label | Trống → "未設定". |
| 10 | 価格 | label | Hiển thị format tiền tệ. Thiếu → "要確認 / cần kiểm tra". |

## Màn hình 8 — 地図検索画面 / Tìm kiếm bằng bản đồ

- **Role**: 1, 3

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | タイトル | text | Tiêu đề. |
| 5 | 検索バー / Thanh tìm kiếm | textbox | Auto-suggest. |
| 6 | 店舗名 / Tên nhà hàng | text | Lấy từ API, dài → "..." (giới hạn ~20 ký tự). |
| 7 | フィルター / Bộ lọc | control | Mở popup `マップ用フィルターポップアップ画面` (màn 19). Lọc theo Danh mục (Nhật/Âu/Trung), Giá (~100k / 100k–300k / 300k+), Đánh giá (1–5 sao). Apply → lọc lại danh sách. Reset → xóa điều kiện. Click ngoài popup → đóng. |
| 8 | 検索結果カード | card | List quán khớp điều kiện. 0 → "Không có kết quả". |
| 9 | 店舗情報 | label | Hiển thị thông tin quán; trống thì "未設定". |
| 10 | 地図エリア | map | **Google Maps API**. Center theo điều kiện tìm. Hỗ trợ kéo, zoom. **Sticky** (vẫn thấy khi scroll). |
| 11 | レストランピン | icon | Marker hiển thị vị trí + tên. Hover → highlight thẻ tương ứng (background `#BEE3BA`). |

## Màn hình 9 — 通知一覧画面 / Thông báo

- **Role**: 1 (User)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | タイトル | button/label | "キャンペーン通知 / Thông báo khuyến mãi". |
| 5 | 全て既読ボタン / Đánh dấu tất cả đã đọc | button | Update tất cả thông báo → đã đọc. |
| 6 | キャンペーンカード | container | Lấy data từ API + render list. |
| 7 | キャンペーン画像 | 画像 | Lỗi → ảnh default. |
| 8 | 新着ラベル / Nhãn mới | label | Hiện "新着 / Mới" nếu là data mới. |
| 9 | キャンペーン説明 | text | Multi-line. |
| 10 | クーポンコード | label | Không có thì ẩn. |
| 11 | コピー (icon) | icon | Click → copy code vào clipboard. |
| 12 | 有効期限 | label | Format ngày. |
| 13 | 詳細を見る | button | → `店舗詳細・メニュー画面` (ID 2). |

## Màn hình 10 — キャンペーン・クーポン作成画面 / Tạo khuyến mãi / mã giảm giá

- **Role**: 2 (Owner)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 6 | キャンペーン作成 | text | Tiêu đề màn. |
| 7 | キャンペーンタイプ / Loại | button group | `割引 / クーポン`. Chọn → đổi field bên dưới. |
| 8–9 | キャンペーン名 (日・越) | textbox | **Bắt buộc** cả 2 ngôn ngữ. |
| 10–11 | 説明 (日・越) | textarea | Multi-line, có giới hạn ký tự. |
| 12 | 割引タイプ / Loại giảm | dropdown | `パーセント / 金額`. Mặc định "パーセント". |
| 13 | 割引値 / Giá trị | textbox | Số. **Bắt buộc**. |
| 14 | 開始日 | datepicker | Format `yyyy/M/d`. **Phải trước** ngày kết thúc. |
| 15 | 終了日 | datepicker | **Bắt buộc**. |
| 16 | 利用回数制限 | textbox | Số nguyên. Trống = không giới hạn. |
| 17 | キャンセル | button | Quay màn trước. Có popup xác nhận khi chưa lưu. |
| 18 | 作成 | button | Validate → POST API → redirect. **Disable double submit**, hiển thị loading. |

## Màn hình 11 — プロフィール画面 / Thông tin cá nhân

- **Role**: 1, 2

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 3 | プロフィール画像 | 画像 | Tròn. Lỗi → ảnh default. |
| 4 | ユーザー名 | text | Lấy tên user. |
| 5 | 自己紹介 | text | Trống → ẩn. |
| 6 | 参加日 | text | Format ngày tham gia. |
| 7 | 編集ボタン / Sửa | button | Sang màn chỉnh sửa profile. Yêu cầu login. |
| 8 | メール | text | **Không cho sửa**. |
| 9 | 電話番号 | text | Format. |
| 10 | 所在地 | text | Trống → ẩn. |
| 11 | レビュー数 | text | Số review user đã viết. |
| 12 | お気に入り数 | text | Số quán yêu thích. Realtime update. |
| 13 | いいね数 | text | ≥ 0. |
| 14 | お気に入りメニュー | button | → `お気に入り一覧画面`. |
| 15 | キャンペーン通知 | button | → `通知一覧画面`. Có badge unread. |
| 16 | プライバシー設定 | button | → màn cài đặt privacy. |
| 17 | パスワード変更 | button | → màn đổi mật khẩu (cần xác thực lại). |

## Màn hình 12 — 店舗情報登録画面 / Đăng ký thông tin nhà hàng

- **Role**: 2 (Owner)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | 店舗登録 | text | Tiêu đề (cố định). |
| 5 | 画面説明文 | text | Câu hướng dẫn. |
| 6 | 店舗名 日本語 | textbox | **Bắt buộc**, có max length. |
| 7 | 店舗名 ベトナム語 | textbox | **Bắt buộc**, có max length. |
| 8–9 | 説明 日本語 / ベトナム語 | textarea | Multi-line, có placeholder + max length. |
| 10 | 住所 | textbox | **Bắt buộc**. Có thể tích hợp tìm địa chỉ. |
| 11 | 区 / Quận | textbox | Quản lý tách riêng nếu có. |
| 12 | 電話番号 | textbox | Validate format. Cân nhắc mã quốc gia. |
| 13 | メール | email | **Bắt buộc**. Check trùng nếu cần. |
| 14 | 営業時間 | textbox/time | Lưu hiển thị, validate nếu cần. |
| 15 | 価格帯 | text/number | Thống nhất quy tắc đơn vị tiền. |
| 16 | 料理カテゴリ | textbox | Sau lưu dùng cho search/label. |
| 17 | 画像アップロード | file | PNG/JPG/JPEG, có giới hạn dung lượng. Báo lỗi nếu sai format. |
| 18 | 画像プレビュー領域 | 画像 | Hiển thị preview sau khi chọn. Khi chưa chọn → placeholder. |
| 19 | 注意書き | text | Hướng dẫn upload + đăng ký. |
| 20 | キャンセル | button | Quay màn trước. Popup xác nhận khi có data chưa lưu. |
| 21 | 登録 | button | Validate required + format → POST API. Thành công: success message + redirect. Thất bại: error + giữ data. |

## Màn hình 13 — 登録画面 / Đăng ký tài khoản

- **Role**: 1, 2, 3

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | 登録 | text | Tiêu đề màn. |
| 5 | 説明文 | text | Hướng dẫn tạo tài khoản. |
| 6 | ユーザータイプ | button group | `お客様 / 店舗オーナー`. Chọn → set type, highlight nút active. |
| 7 | 名前 | textbox | **Bắt buộc**. |
| 8 | メール | email | **Bắt buộc**, check format + trùng. |
| 9 | 電話番号 | textbox | Bắt buộc tùy yêu cầu. |
| 10 | パスワード | password | Mask. Có min length. |
| 11 | パスワード確認 | password | Phải trùng với pw. **Bắt buộc**. |
| 12 | 利用規約同意 | checkbox | Phải tick mới cho đăng ký. |
| 13 | 登録ボタン | button | Validate → POST API → redirect. |
| 14 | ログインリンク | link | → màn Login (cho ai đã có tài khoản). |

## Màn hình 14 — クーポン管理画面 / Quản lý mã giảm giá

- **Role**: 2 (Owner)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 6 | キャンペーン管理 | text | Tiêu đề trang, fixed top. |
| 7 | サブタイトル | text | "Quản lý và phân tích các khuyến mãi đã tạo". |
| 8 | 新規作成 / Tạo mới | button | → màn `キャンペーン・クーポン作成画面`. Vị trí góc trên phải, màu xanh. |
| 9 | 総数 / Tổng số | label | Card. |
| 10 | 実施中 / Đang chạy | label | Đếm coupon active, màu xanh. |
| 11 | 一時停止 / Tạm dừng | label | Màu vàng. |
| 12 | 総閲覧数 | label | Tổng lượt xem (icon). |
| 13 | 総利用数 | label | Tổng lượt dùng (icon). |
| 14 | クーポンカード | card | Thẻ chứa code/giảm/thời gian/lượt dùng. |
| 15 | キャンペーン名 | text | Tiêu đề chính của coupon. |
| 16 | サブタイトル / Tên phụ | text | Tên VN dưới tên JP (multi-language UI). |
| 17 | 説明文 | text | Mô tả ngắn mục đích. |
| 18 | ステータスバッジ | label | `実施中 / 一時停止 / 終了` — badge màu trên góc phải. |
| 19 | Loại khuyến mãi | label | "クーポン / Mã giảm giá". |
| 20 | 割引値 | label | "% / Số tiền". |
| 21 | コード / Mã | label | Hiển thị code, click icon copy → clipboard. **Chỉ** hiện khi loại = coupon và status ≠ kết thúc. |
| 22 | 期間 / Thời gian | label | "Bắt đầu – Kết thúc". Hiển thị cho mọi coupon. |
| 23 | 利用数 / Lượt dùng | label | **Chỉ** hiện với coupon, ẩn với loại giảm thường. |
| 24 | 利用進捗バー / Thanh tiến độ | progress | Chỉ hiện khi có data sử dụng. |
| 25 | 閲覧数 / Lượt xem | label | Mọi coupon. |
| 26 | 編集ボタン | button | → màn chỉnh sửa. Mọi trạng thái. |
| 27 | 再開/一時停止ボタン | button | Nếu đang chạy → nút "Tạm dừng". Nếu tạm dừng → nút "Tiếp tục". Nếu hết hạn → ẩn. |
| 28 | 削除ボタン | button | Xóa khuyến mãi (mọi trạng thái). |

## Màn hình 15 — 店舗詳細情報画面 / Chi tiết thông tin nhà hàng

- **Role**: 1, 3

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 4 | カバー画像 | 画像 | – |
| 5 | お気に入りボタン | button | Toggle yêu thích, yêu cầu login. |
| 6 | レストラン名と説明 | label | – |
| 7 | 評価バッジ | label | "4.5 (128件)". Click → cuộn / chuyển tab Đánh giá. |
| 8 | 店舗基本情報 | label | Địa chỉ, SĐT, giờ mở cửa, khoảng giá. Có icon. |
| 9 | レビュー記入ボタン | button | Mở modal viết review (cần login). |
| 10 | タブナビゲーション | tab | `メニュー / レビュー / 詳細情報`. |
| 11 | 店舗情報エリア | container | Khi load: lấy tất cả info quán từ DB → render. |

## Màn hình 16 — レビュー閲覧画面 / Xem đánh giá

- **Role**: 1, 3

Tương tự màn hình 15 (header / cover / favorites / rating badge / basic info / write-review button / tab nav), điểm khác biệt:

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 11 | レビューリスト / Danh sách đánh giá | list | User name, rating, date, content, photos. Sắp xếp **mới nhất trước**. |

## Màn hình 17 — 店舗情報編集画面 (メニュー管理) / Chỉnh sửa quán – Thực đơn

- **Role**: 2 (Owner)

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 5 | タブ切り替え | tab | `基本情報 / メニュー`. |
| 6 | セクションタイトル | label | "+ Thêm món ăn mới". |
| 7 | 料理名 (日・越) | textbox | **Bắt buộc**. |
| 8 | 説明 (日・越) | textarea | Mô tả thành phần / đặc điểm. |
| 9 | 価格 (VND) | textbox | Chỉ nhập số. **Bắt buộc**. |
| 10 | カテゴリー | textbox | Có thể chuyển dropdown. |
| 11 | 特別食材・アレルギーオプション / Tùy chọn dị ứng | checkbox (multi) | `辛い / マム (ペースト) / ピーナッツ / シーフード`. Lưu khi đăng ký món, hiển thị tag ở list/detail. |
| 12 | 追加ボタン | button | Validate → thêm món vào list. |
| 13 | リストタイトル | label | "Menu hiện tại (〇 món)" — số động. |
| 14 | メニューアイテム | label | Lấy từ DB, hiển thị list. |
| 15 | 在庫ステータス | label | "Còn hàng" v.v. |
| 16 | 編集アイコン | button | Đưa item lên form trên để sửa. |
| 17 | 削除アイコン | button | Popup xác nhận → DELETE DB. |

## Màn hình 18 — 利用規約の画面 / Điều khoản

- **Role**: 1, 2

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 5 | 利用規約 (title) | text | Sticky title trên đầu. |
| 6 | 最終更新日 | text | Format `YYYY/MM/DD`, lấy từ server. |
| 7 | はじめに | text | Đoạn intro. |
| 8 | 第1条: サービスの利用 | text | Section heading + body. |
| 9 | 禁止事項 | text | Danh sách bullet. |
| 10 | 第2条: レストランオーナー向け | text | Section riêng cho Owner. |
| 11 | キャンペーンプロモーション | text | Sub-section của Điều 2. |
| 12 | レビュー対応 | text | Sub-section. |
| 13 | (Privacy section) | text | Có icon. |
| 14 | 収集情報 | text | Bullet list info thu thập. |
| 15 | 第4条: 料金 | text | Chủ yếu text. |
| 16 | 第5条: 免責事項 | text | Highlight box (background nổi bật). |
| 17 | 第6条: 変更 | text | Chỉ phiên bản mới nhất, không có history. |
| 18 | 第7条: お問い合わせ | text | Email / SĐT / Địa chỉ. |
| 19 | 同意メッセージ | label | Nền xanh + check icon. |
| 20 | 同意して登録 / Đồng ý & đăng ký | button | Lưu trạng thái đồng ý → tạo tài khoản → Home/Dashboard. **Disable** nếu chưa tick checkbox. |
| 21 | ホームに戻る | button | Quay về trang chủ, không cần xác nhận. |

## Màn hình 19 — マップ用フィルターポップアップ画面 / Popup bộ lọc bản đồ

- **Role**: 1, 3

| No | Item | Loại | Hành vi & Ghi chú |
|---:|---|---|---|
| 1 | フィルター | label | Tiêu đề popup. |
| 2 | 閉じるボタン | button | Nút "×" đóng popup. |
| 3 | エリア (heading) | label | Section heading. |
| 4 | エリア選択 | checkbox (multi) | Hoàn Kiếm, Ba Đình, Hai Bà Trưng, Đống Đa, Thanh Xuân, Cầu Giấy. |
| 5 | 予算 (VND) (heading) | label | Section heading. |
| 6 | 最低予算入力欄 | textbox | Số. |
| 7 | 最高予算入力欄 | textbox | Số. |
| 8 | 料理 (heading) | label | Section heading. |
| 9 | 料理選択 | checkbox (multi) | Món Việt Nam, Hải sản, Món chay, Món Thái. |
| 10 | リセットボタン | button | Reset toàn bộ lựa chọn. |
| 11 | 適用ボタン | button | Apply → cập nhật bản đồ + danh sách quán. |

---

## Bảng tổng hợp 19 màn hình ↔ role

| ID | Màn hình | Role | Số UI item (≈) |
|---:|---|:---:|:---:|
| 1 | Trang chủ & Tìm kiếm | 1, 3 | 15 |
| 2 | Chi tiết quán & Thực đơn | 1, 3 | 12 |
| 3 | Viết đánh giá | 1 | ~12 |
| 4 | Dashboard Admin (Web) | 2 | 14 |
| 5 | Chỉnh sửa thông tin quán (Web) | 2 | 15 |
| 6 | Đăng nhập | 1, 2, 3 | 11 |
| 7 | Danh sách yêu thích | 1 | 11 |
| 8 | Tìm kiếm bằng bản đồ | 1, 3 | 12 |
| 9 | Thông báo | 1 | 14 |
| 10 | Tạo khuyến mãi / mã giảm giá | 2 | 19 |
| 11 | Thông tin cá nhân | 1, 2 | 18 |
| 12 | Đăng ký thông tin nhà hàng | 2 | 22 |
| 13 | Đăng ký tài khoản | 1, 2, 3 | 15 |
| 14 | Quản lý mã giảm giá | 2 | 29 |
| 15 | Chi tiết thông tin nhà hàng | 1, 3 | 12 |
| 16 | Xem đánh giá | 1, 3 | 12 |
| 17 | Chỉnh sửa quán – Thực đơn | 2 | 18 |
| 18 | Điều khoản | 1, 2 | 21 |
| 19 | Popup bộ lọc bản đồ | 1, 3 | 11 |
