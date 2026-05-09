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
| 1 | 1 | [DB] ER図作成とスキーマ定義 — Tạo sơ đồ ER & định nghĩa Schema | Tiến Đạt | 5 | あり |
| 2 | 1 | [DB] マイグレーション実行・初期化 — Thực thi migration & khởi tạo dữ liệu | Tiến Đạt | 2 | あり |
| 3 | 2 | [Dev] 共通開発環境の構築 — Thiết lập môi trường phát triển chung | Huy | 3 | あり |
| 4 | 2 | [Doc] 開発環境設定のマニュアル作成 — Soạn tài liệu hướng dẫn thiết lập env | Tuấn | 2 | あり |
| 5 | 1 | [BE] Entity/Model実装 — Triển khai Entity / Model | Huy | 2 | あり |
| 6 | 1 | [BE] CRUD開発 — Code các chức năng CRUD | Tuấn | 2 | あり | ✅ |
| 7 | 1 | [QA] DB・CRUD操作の検証 — Test thao tác DB & CRUD | Tuấn | 2 | あり |
| 8 | 2 | [QA] 開発環境の導入検証 — Test việc thiết lập môi trường phát triển | Quý | 2 | あり |
| 9 | 3 | [FE] ログイン画面のレイアウト実装 — Code layout màn hình đăng nhập | Hải | 2 | あり |
| 10 | 3 | [FE] サインアップ画面のレイアウト実装 — Code layout màn hình đăng ký | Hải | 2 | あり |
| 11 | 3 | [BE] ログイン・サインアップAPIの実装 — API đăng nhập & đăng ký | Thế Đạt | 3 | あり |
| 12 | 3 | [FE/BE] ログイン・サインアップUIとAPIの連携 — Kết nối UI ↔ API đăng nhập / đăng ký | Thế Đạt | 2 | あり |
| 13 | 3 | [QA] ログイン・サインアップ機能の受け入れテスト — UAT đăng nhập / đăng ký | Quý | 2 | あり |
| 14 | 4 | [FE] ゲスト用ホーム画面のレイアウト実装 — Code layout home dành cho khách | Hải | 2 | あり |
| 15 | 4 | [FE] 一般ユーザー用ホーム画面のレイアウト実装 — Code layout home cho user thường | Đức | 2 | あり |
| 16 | 4 | [BE] ホーム画面のレストラン検索APIの実装 — API search nhà hàng ở home | Đức | 3 | あり |
| 17 | 4 | [FE/BE] ホーム画面の検索UIとレストラン検索APIの連携 — Kết nối UI ↔ API search | Đức | 2 | あり |
| 18 | 4 | [QA] 詳細検索・予算検索機能の受け入れテスト — UAT search chi tiết & ngân sách | Quý | 2 | あり |

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

### Trạng thái Sprint 1 (lúc tách CSV)

- Task 1 (ER図 / Schema) — *Tiến độ: bắt đầu (1.0/5.0h thực tế ~ 3h)*. Có ô được điền nhưng chưa hoàn thành.
- Các task còn lại — chưa cập nhật progress / actual.

---

## Sprint 2 (Template – chưa lên kế hoạch)

- **Kỳ (placeholder)**: `5/5 ~ 5/10`
- **Sprint Goal**: chưa điền (`このスプリントで`).
- **Sprint Backlog**: chưa lập task — chỉ giữ lại 18 hàng PIC theo cùng cấu trúc Sprint 1 (Tiến Đạt, Tiến Đạt, Huy, Tuấn, Huy, Tuấn, Tuấn, Quý, Hải, Hải, Thế Đạt, Thế Đạt, Quý, Hải, Đức, Đức, Đức, Quý).
- **POT đã approve**: ❌
- **Sprint Review**: chưa thực hiện.

## Sprint 3 (Template – chưa lên kế hoạch)

- **Kỳ (placeholder)**: `5/5 ~ 5/10`
- **Sprint Goal**: chưa điền.
- **Sprint Backlog**: chưa lập task; layout PIC giống Sprint 2.
- **POT đã approve**: ❌
- **Sprint Review**: chưa thực hiện.

## Sprint 4 (Template – chưa lên kế hoạch)

- **Kỳ (placeholder)**: `5/5 ~ 5/10`
- **Sprint Goal**: chưa điền.
- **Sprint Backlog**: chưa lập task; layout PIC giống Sprint 2.
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
