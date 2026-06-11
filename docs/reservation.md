# docs/reservation.md — 予約・顧客管理システム仕様

> マスターCLAUDE.mdを先に読むこと。

## 概要

クライアント（医院・士業・建設等）に納品する予約・顧客管理システム。
WEB予約フォーム・管理画面・CSV移行・リマインドを一式提供する。
LINEはオプションで後から追加可能。

---

## ディレクトリ構成

```
reservation/
├── main.py
├── config.py
├── requirements.txt
├── routers/
│   ├── booking.py        # 予約受付API（患者向け）
│   ├── admin.py          # 管理画面API（認証必須）
│   ├── customers.py      # 顧客管理API
│   └── import_export.py  # CSV入出力
├── models/
│   └── schemas.py        # Pydanticスキーマ
├── services/
│   ├── mail.py           # 確認・リマインドメール
│   ├── reminder.py       # APSchedulerで毎日実行
│   └── csv_handler.py    # CSV/Excel処理
├── db/
│   └── database.py
├── static/
│   ├── booking/
│   │   └── index.html    # 患者向け予約フォーム
│   └── admin/
│       └── index.html    # 管理画面
└── data/
    └── reservation.db
```

---

## 実装ステータス

```
[ ] config.py
[ ] db/database.py（customers・reservations・closed_dates・admin_sessionsテーブル）
[ ] routers/booking.py
[ ] routers/admin.py（セッション認証）
[ ] routers/customers.py
[ ] routers/import_export.py
[ ] services/mail.py（確認・リマインド・管理者通知）
[ ] services/reminder.py（APScheduler）
[ ] services/csv_handler.py（日本語ヘッダー対応・Shift-JIS対応）
[ ] static/booking/index.html（booking_demo.htmlのWEB予約タブを流用）
[ ] static/admin/index.html（booking_demo.htmlの管理画面タブを流用）
```

---

## DBテーブル設計

```sql
CREATE TABLE IF NOT EXISTS customers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    name_kana    TEXT DEFAULT '',
    phone        TEXT DEFAULT '',
    email        TEXT DEFAULT '',
    birthdate    TEXT DEFAULT '',
    gender       TEXT DEFAULT '',
    address      TEXT DEFAULT '',
    notes        TEXT DEFAULT '',
    source       TEXT DEFAULT 'web',   -- web/line/csv/manual
    created_at   TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS reservations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id   INTEGER,
    name          TEXT NOT NULL,
    phone         TEXT DEFAULT '',
    email         TEXT DEFAULT '',
    date          TEXT NOT NULL,        -- YYYY-MM-DD
    time          TEXT NOT NULL,        -- HH:MM
    menu_id       TEXT DEFAULT '',
    menu_name     TEXT DEFAULT '',
    duration_min  INTEGER DEFAULT 30,
    status        TEXT DEFAULT 'confirmed',  -- confirmed/cancelled/done/no_show
    channel       TEXT DEFAULT 'web',   -- web/line/manual
    notes         TEXT DEFAULT '',
    remind_sent   INTEGER DEFAULT 0,
    cancelled_at  TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS closed_dates (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    date   TEXT UNIQUE NOT NULL,
    reason TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    token      TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    expires_at TEXT
);
```

---

## CSVインポートの仕様

```python
# 対応するCSVヘッダー（日本語・英語どちらでも可）
COLUMN_MAP = {
    "氏名": "name", "名前": "name", "患者名": "name",
    "氏名（カナ）": "name_kana", "フリガナ": "name_kana",
    "電話番号": "phone", "電話": "phone", "TEL": "phone",
    "メールアドレス": "email", "メール": "email",
    "生年月日": "birthdate",
    "住所": "address",
    "備考": "notes", "メモ": "notes",
}

# 文字コード自動判定順
ENCODINGS = ["utf-8", "utf-8-sig", "shift-jis", "cp932", "euc-jp"]

# 重複チェック：電話番号（ハイフン除去後）で照合
```

---

## 予約フローAPI

```
GET  /api/booking/available-dates         # 予約可能日一覧
GET  /api/booking/available-times/{date}  # 時間スロット
POST /api/booking/create                  # 予約作成
DELETE /api/booking/cancel/{id}           # キャンセル（電話番号で本人確認）

GET  /admin/reservations                  # 予約一覧（要認証）
GET  /admin/customers                     # 顧客一覧（要認証）
POST /admin/customers/manual              # 手動登録
POST /admin/import-export/customers/import  # CSVインポート
GET  /admin/import-export/customers/export  # CSVエクスポート
```

---

## 管理画面の機能

```
ダッシュボード：今日の予約・今月・キャンセル率・LINE経由率
予約管理：カレンダービュー・一覧・手動追加・ステータス変更
顧客管理：
  - 一覧（名前・電話・メールで検索）
  - 顧客名クリック → 詳細モーダル（予約履歴・編集・予約追加）
  - CSVインポート（Excel・Shift-JIS対応）
  - CSVエクスポート（BOM付きUTF-8）
  - 顧客追加（手動）・削除（確認ダイアログ）
  - 電話番号重複チェック
設定：休業日設定・メニュー確認・パスワード変更
リマインド：前日予約一覧・手動送信・送信ログ
```

---

## デプロイ（Railway推奨）

```bash
# 環境変数設定後
uvicorn main:app --host 0.0.0.0 --port 8000

# Railway設定
# Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 納品物チェックリスト

```
□ デプロイ済みURL
□ 管理画面URL・初期パスワード
□ 予約フォームURL（クライアントサイトに埋め込み用）
□ 既存データのCSVインポート完了
□ 確認メール・リマインドの動作確認
□ 管理画面操作マニュアル（PDF）
```

---

## パーソナライズドデモURL（営業用・2026-06-12追加）

```
仕組み：/booking/?demo=さくら歯科 のようにクエリパラメータを付けると、
        予約画面のタイトルが「さくら歯科 ご予約」に差し替わる。
        タイトル下に「デモ環境 — 実際の導入画面と同じ仕様です」と表示。

安全設計：
- サーバーの DEMO_MODE=true のときだけ有効（GET /api/booking/config で判定）
  → 本番クライアント環境では ?demo= を付けても何も起きない
- 差し替えは textContent のみ使用（XSS不可）
- 店舗名は30文字に切り詰め

用途：営業メールに「貴院専用のデモ」としてリンクを記載する。
例：https://earnest-gentleness-production-f682.up.railway.app/booking/?demo=〇〇歯科

実装箇所：
- reservation/routers/booking.py … GET /api/booking/config
- reservation/static/booking/index.html … applyDemoName()
