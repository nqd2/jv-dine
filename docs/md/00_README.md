# JVDine — Tài liệu hệ thống / システム仕様書

> Phiên bản markdown của file gốc `三六_システム仕様書 (に).xlsx` đã được tách thành CSV trong `docs/csv/`. Mỗi file dưới đây tương ứng một (hoặc một nhóm) sheet trong workbook gốc; nội dung được đọc – diễn giải lại để dễ tra cứu, không chạy script tự sinh.

## Cấu trúc thư mục `docs/`

```
docs/
├── 三六_システム仕様書 (に).xlsx       # File Excel gốc
├── csv/                                 # 14 sheet đã tách thành CSV
│   ├── INDEX.csv
│   ├── 01_システム概要.csv
│   ├── 02_画面遷移図.csv
│   ├── 03_画面設計書.csv
│   ├── 04_仕様書チェックリスト.csv
│   ├── 05_プロダクトバックログ.csv
│   ├── 06_プロダクトバックログチェックリスト.csv
│   ├── 07_スプリントバックログ_(1).csv
│   ├── 08_スプリントバックログ_(2).csv
│   ├── 09_スプリントバックログ_(3).csv
│   ├── 10_スプリントバックログ_(4).csv
│   ├── 11_スプリントバックログ作成チェックリスト.csv
│   ├── 12_スプリントプランニングチェックリスト.csv
│   ├── 13_スプリントレビュー準備チェックリスト（開発T用）.csv
│   └── 14_スプリントレビューチェックリスト.csv
└── md/                                  # Markdown (bản dịch / tóm tắt)
    ├── 00_README.md                     # ← bạn đang đọc
    ├── 01_system-overview.md
    ├── 02_screen-transition.md
    ├── 03_screen-spec.md
    ├── 04_spec-checklist.md
    ├── 05_product-backlog.md
    ├── 06_pb-checklist.md
    ├── 07_sprint-backlog.md
    └── 08_sprint-process-checklists.md
```

## Mapping sheet → file markdown

| # | Tên sheet (JP) | Ý nghĩa (VN) | File CSV | File MD |
|---|---|---|---|---|
| 1 | システム概要 | Tổng quan hệ thống | `csv/01_システム概要.csv` | [`01_system-overview.md`](./01_system-overview.md) |
| 2 | 画面遷移図 | Sơ đồ chuyển màn hình | `csv/02_画面遷移図.csv` (+ `xl/drawings/drawing2.xml`) | [`02_screen-transition.md`](./02_screen-transition.md) |
| 3 | 画面設計書 | Thiết kế màn hình | `csv/03_画面設計書.csv` | [`03_screen-spec.md`](./03_screen-spec.md) |
| 4 | 仕様書チェックリスト | Checklist tài liệu spec | `csv/04_仕様書チェックリスト.csv` | [`04_spec-checklist.md`](./04_spec-checklist.md) |
| 5 | プロダクトバックログ | Product Backlog | `csv/05_プロダクトバックログ.csv` | [`05_product-backlog.md`](./05_product-backlog.md) |
| 6 | プロダクトバックログチェックリスト | Checklist Product Backlog | `csv/06_プロダクトバックログチェックリスト.csv` | [`06_pb-checklist.md`](./06_pb-checklist.md) |
| 7–10 | スプリントバックログ (1)–(4) | Sprint Backlog #1–#4 | `csv/07–10_*` | [`07_sprint-backlog.md`](./07_sprint-backlog.md) |
| 11 | スプリントバックログ作成チェックリスト | Checklist tạo Sprint Backlog | `csv/11_*` | [`08_sprint-process-checklists.md`](./08_sprint-process-checklists.md) |
| 12 | スプリントプランニングチェックリスト | Checklist Sprint Planning | `csv/12_*` | [`08_sprint-process-checklists.md`](./08_sprint-process-checklists.md) |
| 13 | スプリントレビュー準備チェックリスト（開発T用） | Checklist chuẩn bị Sprint Review (DevT) | `csv/13_*` | [`08_sprint-process-checklists.md`](./08_sprint-process-checklists.md) |
| 14 | スプリントレビューチェックリスト | Checklist Sprint Review | `csv/14_*` | [`08_sprint-process-checklists.md`](./08_sprint-process-checklists.md) |

## Các lưu ý khi đọc

- **Excel auto-format `1, 3` → `2026-01-03`**: Trong file gốc, các ô chứa danh sách ID kiểu `1, 3` / `1, 4` / `2, 3` đã bị Excel diễn giải nhầm thành ngày. Script tách CSV (`scripts/xlsx_to_csv.py`) đã khôi phục lại dạng `M, D` ban đầu để đọc được nghĩa thật là "ID 1 và ID 3".
- **Sơ đồ chuyển màn hình** (sheet 2) chỉ chứa header role; bản vẽ thật nằm trong `xl/drawings/drawing2.xml` (3 sơ đồ – mỗi role 1 cái). File `02_screen-transition.md` đã trích xuất và biểu diễn lại bằng diagram Mermaid.
- Cả file Excel đều **song ngữ Nhật–Việt**; markdown giữ nguyên cả hai ngôn ngữ ở những trường mô tả quan trọng (theo đúng yêu cầu trong checklist mục "Ngôn ngữ").

## Cách tái tạo CSV

```bash
python3 scripts/xlsx_to_csv.py
```
