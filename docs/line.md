# docs/line.md — LINE予約システム仕様

> マスターCLAUDE.mdを先に読むこと。

## 概要

クライアントのLINE公式アカウントにWebhookを設定して予約機能を追加する。
reservation/と同じDBを共有して一元管理する（または独立DBでも可）。

---

## ディレクトリ構成

```
line_bot/
├── main.py              # FastAPI + Webhookサーバー
├── config.py
├── requirements.txt
├── handlers/
│   ├── webhook.py       # イベント振り分け
│   ├── reservation.py   # 予約フロー（状態遷移）
│   └── reminder.py      # リマインド送信
├── db/
│   └── database.py      # reservations・user_sessionsテーブル
├── scheduler/
│   └── remind_job.py
└── data/
    └── reservations.db
```

---

## 実装ステータス

```
[ ] config.py
[ ] db/database.py（reservations・user_sessionsテーブル）
[ ] handlers/webhook.py
[ ] handlers/reservation.py（状態遷移フル実装）
[ ] handlers/reminder.py
[ ] scheduler/remind_job.py（APScheduler）
[ ] main.py
```

---

## 予約フローの状態遷移

```
idle
  ↓ 「予約する」タップ（リッチメニュー）
select_date → クイックリプライで7日分表示
  ↓ 日付選択
select_time → 満員スロット除外して表示
  ↓ 時間選択
select_menu → メニュー選択
  ↓
input_name → 名前を入力
  ↓
confirm → 確認メッセージ表示
  ↓ 「確定する」タップ
idle（予約完了・確認メッセージ送信）
```

---

## DBテーブル設計

```sql
CREATE TABLE IF NOT EXISTS reservations (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    line_user_id TEXT NOT NULL,
    name         TEXT,
    date         TEXT,           -- YYYY-MM-DD
    time         TEXT,           -- HH:MM
    menu_id      TEXT,
    menu_name    TEXT,
    status       TEXT DEFAULT 'confirmed',  -- confirmed/cancelled/done
    remind_sent  INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now', 'localtime')),
    cancelled_at TEXT
);

CREATE TABLE IF NOT EXISTS user_sessions (
    line_user_id TEXT PRIMARY KEY,
    step         TEXT DEFAULT 'idle',
    temp_date    TEXT,
    temp_time    TEXT,
    temp_menu    TEXT,
    temp_name    TEXT,
    updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
);
```

---

## LINE Developer Console 設定手順

```
1. LINE Developers（https://developers.line.biz）にログイン
2. Messaging APIチャンネルを作成
3. Webhook URLに https://your-domain.com/webhook を設定
4. Channel SecretとChannel Access Tokenを取得
5. リッチメニューをLINE Official Account Managerで設定
```

## リッチメニュー設定

```
[予約する]  [予約確認]  [キャンセル]

アクション：
- 予約する   → テキスト送信「予約する」
- 予約確認   → テキスト送信「予約確認」
- キャンセル → テキスト送信「キャンセル」

※ リッチメニューのデザインはクライアントに合わせてカスタマイズ可能
```

---

## 起動コマンド

```bash
export LINE_CHANNEL_SECRET="xxx"
export LINE_CHANNEL_ACCESS_TOKEN="xxx"
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 注意事項

```
- line-bot-sdk-python v3を使用（v2と非互換）
- Webhookは必ずHTTPS（HTTP不可）
- ngrokでローカルテスト可能
- リッチメニューのデザインはクライアントに合わせる
```
