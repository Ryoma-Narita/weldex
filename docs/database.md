# docs/database.md — DB統合スキーマ設計

> マスターCLAUDE.mdを先に読むこと。

## 設計方針

```
- 営業自動化（outreach）と予約システム（reservation）はDBを分離する
- LINE予約はreservationのDBを共有する（チャネルをline/webで区別）
- 各システムが独立してデプロイ・運用できる構成にする
- 後からPostgreSQLに移行できるようにSQLite固有の機能は使わない
```

---

## outreach/data/outreach.db（営業自動化）

```sql
-- ターゲット企業テーブル
CREATE TABLE IF NOT EXISTS targets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    place_id     TEXT UNIQUE NOT NULL,      -- Google Places ID（重複防止キー）
    name         TEXT NOT NULL,
    address      TEXT DEFAULT '',
    phone        TEXT DEFAULT '',
    website_url  TEXT DEFAULT '',
    email        TEXT DEFAULT '',
    industry     TEXT DEFAULT '',           -- 歯科医院・税理士 等
    area         TEXT DEFAULT '',           -- 東京都渋谷区 等
    site_status  TEXT DEFAULT 'unchecked',  -- none/old/no_mobile/phone_only/ok/error/unchecked
    issues       TEXT DEFAULT '',           -- カンマ区切りの問題リスト
    mail_pattern TEXT DEFAULT '',           -- A/B/C（診断結果から自動決定）
    created_at   TEXT DEFAULT (datetime('now', 'localtime'))
);

-- インデックス（検索高速化）
CREATE INDEX IF NOT EXISTS idx_targets_status   ON targets(site_status);
CREATE INDEX IF NOT EXISTS idx_targets_industry ON targets(industry);
CREATE INDEX IF NOT EXISTS idx_targets_email    ON targets(email);

-- 送信履歴テーブル
CREATE TABLE IF NOT EXISTS outreach_log (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id    INTEGER NOT NULL,
    channel      TEXT DEFAULT 'email',      -- email/dm
    mail_pattern TEXT DEFAULT '',           -- A/B/C
    subject      TEXT DEFAULT '',
    body         TEXT DEFAULT '',
    status       TEXT DEFAULT 'sent',       -- sent/replied/converted/unsubscribed
    sent_at      TEXT DEFAULT (datetime('now', 'localtime')),
    replied_at   TEXT DEFAULT '',
    notes        TEXT DEFAULT '',
    FOREIGN KEY (target_id) REFERENCES targets(id)
);

-- 送信キュー
CREATE TABLE IF NOT EXISTS send_queue (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id    INTEGER NOT NULL UNIQUE,
    mail_pattern TEXT DEFAULT '',
    priority     INTEGER DEFAULT 0,         -- 高いほど先に送信
    queued_at    TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (target_id) REFERENCES targets(id)
);

-- 配信停止リスト
CREATE TABLE IF NOT EXISTS unsubscribes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 設定テーブル（UIから変更可能）
CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 設定の初期値
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('active_industries', '["歯科医院","クリニック","皮膚科","司法書士","税理士","工務店","建設会社","整体院"]'),
    ('active_areas',      '["東京都渋谷区","東京都新宿区","東京都港区","東京都中央区","東京都豊島区"]'),
    ('daily_send_limit',  '50'),
    ('collect_delay_sec', '0.5'),
    ('max_workers',       '10'),
    ('copyright_old_years', '5');

-- 実行ログ
CREATE TABLE IF NOT EXISTS run_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    level      TEXT NOT NULL,               -- INFO/WARN/ERROR
    category   TEXT NOT NULL,               -- collect/diagnose/send/reply/system
    message    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_logs_level    ON run_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_category ON run_logs(category);
CREATE INDEX IF NOT EXISTS idx_logs_created  ON run_logs(created_at);
```

---

## reservation/data/reservation.db（予約・顧客管理）

```sql
-- 顧客テーブル
CREATE TABLE IF NOT EXISTS customers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    name_kana    TEXT DEFAULT '',
    phone        TEXT DEFAULT '',
    email        TEXT DEFAULT '',
    birthdate    TEXT DEFAULT '',            -- YYYY-MM-DD
    gender       TEXT DEFAULT '',            -- male/female/other/unknown
    address      TEXT DEFAULT '',
    notes        TEXT DEFAULT '',            -- スタッフメモ（非公開）
    source       TEXT DEFAULT 'web',         -- web/line/csv/manual
    created_at   TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name  ON customers(name);

-- 予約テーブル
CREATE TABLE IF NOT EXISTS reservations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id   INTEGER,                   -- NULLの場合は新規（予約後に紐付け）
    name          TEXT NOT NULL,             -- 予約時の名前
    phone         TEXT DEFAULT '',
    email         TEXT DEFAULT '',
    date          TEXT NOT NULL,             -- YYYY-MM-DD
    time          TEXT NOT NULL,             -- HH:MM
    menu_id       TEXT DEFAULT '',
    menu_name     TEXT DEFAULT '',
    duration_min  INTEGER DEFAULT 30,
    status        TEXT DEFAULT 'confirmed',  -- confirmed/cancelled/done/no_show/pending
    channel       TEXT DEFAULT 'web',        -- web/line/manual
    line_user_id  TEXT DEFAULT '',           -- LINE予約の場合のみ設定（リマインド・キャンセル追跡用）
    notes         TEXT DEFAULT '',
    remind_sent   INTEGER DEFAULT 0,         -- 0=未送信 1=送信済み
    cancelled_at  TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_date       ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer   ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_remind     ON reservations(remind_sent, date);

-- 休業日テーブル
CREATE TABLE IF NOT EXISTS closed_dates (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    date   TEXT UNIQUE NOT NULL,             -- YYYY-MM-DD
    reason TEXT DEFAULT ''
);

-- 管理者セッション
CREATE TABLE IF NOT EXISTS admin_sessions (
    token      TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    expires_at TEXT NOT NULL
);
```

---

## LINE予約（reservation.dbに統合済み）

`channel='line'` で区別。`line_user_id` カラムで送信者を追跡。
**独立DBは使わない**（ADR-001 参照）。

追加テーブル：

```sql
-- ユーザーセッション（予約フローの状態管理）
-- reservation/db/database.py の init_db() で自動生成される
CREATE TABLE IF NOT EXISTS user_sessions (
    line_user_id TEXT PRIMARY KEY,
    step         TEXT DEFAULT 'idle',        -- idle/select_date/select_time/select_menu/input_name/confirm/cancel_select
    temp_date    TEXT DEFAULT '',
    temp_time    TEXT DEFAULT '',
    temp_menu_id TEXT DEFAULT '',            -- ※temp_menu ではなく temp_menu_id（Phase4で修正）
    temp_name    TEXT DEFAULT '',
    updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
);
```

> **注意**: `user_sessions` テーブルは `reservation/db/database.py` の `init_db()` に追加が必要。
> 現状は line_bot が直接 SQL で INSERT/UPDATE しているが、init_db() 側に
> `CREATE TABLE IF NOT EXISTS user_sessions ...` を追記することで永続化される。

---

## データの整合性ルール

```
1. customers.phone は必ずハイフン除去後に重複チェックする
   → phone.replace('-', '').replace(' ', '')

2. reservations.date は必ず YYYY-MM-DD 形式で保存する

3. reservations.status の遷移
   confirmed → done（来院済み）
   confirmed → no_show（無断キャンセル）
   confirmed → cancelled（キャンセル）
   pending   → confirmed（仮予約→確定）

4. customers.source の種類
   web     → WEB予約フォームから
   line    → LINE予約から
   csv     → CSVインポートから
   manual  → 管理画面から手動登録

5. outreach_log.status の遷移
   sent → replied → converted（受注）
   sent → unsubscribed（配信停止）
```

---

## マイグレーション方針

```python
# init_db() は冪等性を保つ（何度実行しても同じ結果）
# CREATE TABLE IF NOT EXISTS を使う
# ALTER TABLE は使わない（カラム追加が必要な場合は新テーブル+移行スクリプト）

# バージョン管理
CREATE TABLE IF NOT EXISTS schema_version (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now', 'localtime'))
);
INSERT OR IGNORE INTO schema_version (version) VALUES (1);
```
