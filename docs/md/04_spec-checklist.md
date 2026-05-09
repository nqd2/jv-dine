# 04 — 仕様書チェックリスト / Checklist tài liệu Spec

> Sheet `仕様書チェックリスト` — sheet 4/14. Bản gốc: `docs/csv/04_仕様書チェックリスト.csv`.
>
> Ý nghĩa các cột check trong file gốc:
> - **POT セルフレビュー / POT – Tự đánh giá**: PO Team tự kiểm
> - **開発Tレビュー / Nhóm phát triển đánh giá**: Dev Team kiểm
> - **教師FB / Phản hồi của giáo viên**: Phản hồi từ giáo viên
>
> Ký hiệu trong bảng dưới: ✅ = đã check (`True`) trong file Excel, ❌ = chưa check (`False`).

## Tổng quan

| Phạm vi | Mục check (số thứ tự) |
|---|---|
| **システム概要** (Overview) | 1 → 8 |
| **画面遷移図** (Screen transition) | 9 → 13 |
| **画面設計書** (Screen spec) | 14 → 22 |
| **全般** (Phần chung) | 23 |

## 1. システム概要 / Tổng quan hệ thống

| No | Mục | Nội dung kiểm tra | POT | DevT | 教師 |
|---:|---|---|:---:|:---:|:---:|
| 1 | 課題 / Thách thức | "Việc cần thực hiện để hướng tới giải pháp / trạng thái lý tưởng" | ✅ | ✅ | ❌ |
| 2 | 解決策 / Giải pháp | "Phương thức cụ thể để thực thi / hiện thực hóa thách thức" | ✅ | ✅ | ✅ |
| 3 | アプリ名称 / Tên app | Người dùng có hình dung được giải pháp từ tên app không | ✅ | ✅ | ✅ |
| 4 | ロール一覧 / Danh sách role | Vai trò mỗi role được giải thích rõ + tên role gợi đúng vai trò | ✅ | ✅ | ✅ |
| 5 | 機能一覧 / Danh sách chức năng | Có bao quát tất cả giải pháp + role không | ✅ | ✅ | ✅ |
| 6 | 画面一覧 / Danh sách màn hình | Có bao quát tất cả chức năng + role không | ✅ | ✅ | ✅ |
| 7 | 全般: 言語 / Ngôn ngữ | Có ghi cả JP + VN ở mọi mục | ✅ | ✅ | ✅ |
| 8 | 全般: 体裁 / Layout | Không có ô trống / đường kẻ vỡ; thông tin dễ nhìn | ✅ | ✅ | ✅ |

## 2. 画面遷移図 / Sơ đồ chuyển màn hình

| No | Mục | Nội dung kiểm tra | POT | DevT | 教師 |
|---:|---|---|:---:|:---:|:---:|
| 9 | ロールの網羅性 / Đầy đủ role | Tất cả role ở Overview đều có sơ đồ; tên role trùng khớp | ✅ | ✅ | ✅ |
| 10 | 画面の網羅性 / Đầy đủ màn hình | Các màn hình trên sơ đồ khớp hoàn toàn với danh sách màn hình ở Overview | ✅ | ✅ | ✅ |
| 11 | 論理性 / Tính logic | Luồng chuyển màn hình không có mâu thuẫn | ✅ | ✅ | ✅ |
| 12 | 言語 | Có cả JP + VN | ✅ | ✅ | ✅ |
| 13 | 体裁 | Không có ô trống / kẻ bảng vỡ | ✅ | ✅ | ✅ |

## 3. 画面設計書 / Thiết kế màn hình

| No | Mục | Nội dung kiểm tra | POT | DevT | 教師 |
|---:|---|---|:---:|:---:|:---:|
| 14 | 画面の網羅性 | Khớp hoàn toàn với danh sách màn hình ở Overview | ✅ | ✅ | ✅ |
| 15 | 画面項目 / Các mục trên màn hình | Đã giải thích đủ bố cục + thiết kế của các mục | ✅ | ✅ | ✅ |
| 16 | 項目名称 / Tên mục | Tên mục giúp hình dung được nội dung | ✅ | ✅ | ✅ |
| 17 | 項目説明 / Mô tả mục | Mô tả rõ ràng | ✅ | ✅ | ✅ |
| 18 | 分類 / Phân loại | Phân loại UI phù hợp | ✅ | ✅ | ✅ |
| 19 | 選択肢・入力値 | Đầy đủ option + giá trị input cho DevT | ✅ | ✅ | ✅ |
| 20 | 処理内容 / Nội dung xử lý | Trigger + kết quả của xử lý đều rõ | ✅ | ✅ | ✅ |
| 21 | 言語 | Có cả JP + VN | ✅ | ✅ | ✅ |
| 22 | 体裁 | Không có ô trống / kẻ bảng vỡ | ✅ | ✅ | ✅ |

## 4. 全般 / Phần chung — toàn bộ tài liệu

| No | Mục | Nội dung kiểm tra | POT | DevT | 教師 |
|---:|---|---|:---:|:---:|:---:|
| 23 | 表記ゆれ / Thống nhất từ ngữ | Cùng nghĩa nhưng tránh ghi khác nhau giữa System Overview, Screen Transition, Screen Spec | ✅ | ✅ | ❌ |

## Trạng thái review

- POT tự đánh giá đã pass **toàn bộ 23 mục** ✅
- DevT review đã pass **toàn bộ 23 mục** ✅
- Phản hồi giáo viên: pass **21/23**; còn 2 mục chưa được giáo viên xác nhận:
  - **No.1** — định nghĩa "課題 / Thách thức"
  - **No.23** — "Thống nhất từ ngữ" giữa các sheet
