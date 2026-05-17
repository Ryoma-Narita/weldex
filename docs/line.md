# docs/line.md — LINE予約システム仕様

> マスターCLAUDE.mdを先に読むこと。

---

## 概要

クライアントのLINE公式アカウントにWebhookを設定して予約機能を追加する。
`reservation/data/reservation.db` を共有し、WEB予約と一元管理する。

---

## アーキテクチャ決定事項（ADR）

| 決定 | 内容 | 理由 |
|---|---|---|
| DB共有 | `reservation.db` を LINE/WEB で共有 | 空き枠が自動同期・二重予約防止 |
| サービス分離 | `line_bot/` は独立 FastAPI（port 8002） | LINE SDK 依存を reservation に持ち込まない |
| リマインド | `channel='line'` → LINE Push / `channel='web'` → メール | チャネル別に自動ディスパッチ |
| メニュー送信テキスト | クイックリプライはメニュー名で送信（ID不可） | ユーザー画面に「1」と表示されるバグを防ぐ |

---

## ディレクトリ構成

```
line_bot/
├── main.py                  # FastAPI + APScheduler（REMIND_HOUR 毎日リマインド）
├── config.py                # LINE credentials / APP_NAME / DB_PATH / スロット設定共有
├── requirements.txt
├── handlers/
│   ├── webhook.py           # 署名検証 → MessageEvent / FollowEvent 振り分け
│   ├── reservation.py       # 状態遷移ロジック（全ステップ）
│   ├── messages.py          # LINEメッセージ・クイックリプライ構築ヘルパー
│   └── reminder.py          # LINE Push リマインド（キャンセルQR付き）
└── db/
    └── database.py          # user_sessions CRUD + reservation DB 橋渡し
```

---

## 実装ステータス（Phase 4 完了）

```
[x] config.py（APP_NAME / LINE credentials / importlib で reservation/config.py 共有）
[x] requirements.txt（line-bot-sdk==3.11.0）
[x] db/database.py（user_sessions CRUD / reservation 読み書き / 予約件数チェック）
[x] handlers/messages.py（全ステップのメッセージ構築 / ウェルカム / キャンセル完了）
[x] handlers/webhook.py（署名検証 / MessageEvent / FollowEvent ウェルカム送信）
[x] handlers/reservation.py（状態遷移フル実装 / 予約上限チェック / キャンセル後再予約促進）
[x] handlers/reminder.py（LINE Push + キャンセルクイックリプライ付き）
[x] main.py
[ ] LINE Developer Console 設定（Channel Secret / Access Token 取得・.env 設定）
[ ] リッチメニュー画像制作（Weldexで制作・案A/B選定後）
[ ] リッチメニュー設定（LINE Official Account Manager）
[ ] Railway / Render デプロイ（port 8002）
[ ] 動的リッチメニュー切り替え（v2・将来）※decisions.md #019
[ ] 管理者通知（予約作成・キャンセル時メール）※decisions.md #018
[ ] WEB予約時のLINE通知 ※decisions.md #020（仕様詰め中）
```

---

## 予約フロー（状態遷移）

```
[idle]
  ↓「予約する」タップ
  → 確定済み予約が1件以上 → 「すでに予約があります」+ 予約一覧を返してidleへ ④
  ↓ 予約なし
[select_date]  クイックリプライ：今日の翌日から最大7営業日（休業日除外）
  ↓ 日付選択（YYYY-MM-DD）
[select_time]  クイックリプライ：空きスロット一覧（満席・予約済み除外、最大12件）
  ↓ 時間選択（HH:MM）
[select_menu]  クイックリプライ：メニュー名で送信（ラベル：名前+所要時間）
  ↓ メニュー名テキスト受信 → menu_id に変換してセッション保存
[input_name]   「お名前を入力してください（例：LINE表示名）」
  ↓ テキスト入力（1〜50文字）
[confirm]      確認メッセージ（日時・メニュー・名前）+ [確定する] [最初から]
  ↓「確定する」
  → 最終空き再確認（レースコンディション対策）
  → create_line_reservation() → [idle] 完了メッセージ

[idle]
  ↓「予約確認」
  → 確定済み予約一覧（日時・メニュー）テキスト返信

[idle]
  ↓「キャンセル」
  → 0件：「予約なし」で終了
  → 1件：直接キャンセル確認画面
  → 複数：一覧 → 選択 → 確認画面
[cancel_select]
  ↓「キャンセルする」タップ（do_cancel_<id>）
  → cancel_reservation() → [idle]
  → 「キャンセルしました。新しいご予約をされますか？」②
     [予約する] [いいえ]

任意のステップ
  ↓「最初から」「メニューに戻る」「戻る」「やり直す」
  → idle にリセット

友だち追加（FollowEvent）③
  → ウェルカムメッセージ送信（APP_NAME を使用）
```

### タイムアウト
- `user_sessions.updated_at` が **30分以上前** かつ step が idle 以外 → idle に自動リセット
- 各 Webhook ハンドラの先頭で確認

---

## 実装済み機能詳細

### ① 予約変更フロー
- **非対応（v1）**：「キャンセルして再予約」で対応
- 変更フローは顧客ニーズ確認後に v2 として追加予定

### ② キャンセル後の再予約促進
```
キャンセル完了時：
「予約をキャンセルしました。
 新しいご予約をされますか？」
 [予約する] [いいえ]
```

### ③ 友だち追加ウェルカムメッセージ
```
「【{APP_NAME}】のLINE予約へようこそ！

以下のメニューからご利用いただけます。
画面下のリッチメニューをタップするか、
メッセージでも操作できます。

📅 予約する
📋 予約確認
❌ キャンセル」
```
- APP_NAME は `.env` の `APP_NAME=` で設定

### ④ 予約上限（1件制限）
```
「予約する」受信時：
  確定済み・今日以降の予約が1件以上 → 新規予約を弾く
  「すでにご予約が入っています。
   変更の場合は現在の予約をキャンセルしてから再度ご予約ください。」
  + 現在の予約一覧表示
```

### ⑤ リマインドにキャンセルQR
```
前日リマインド Push Message（キャンセルQR付き）：
「明日のご予約をお知らせします。

 日時：5/10(日) 10:30
 メニュー：初診

 ご都合が悪くなった場合は「キャンセル」をタップしてください。」
 [キャンセル] ← タップで即キャンセルフローへ
```

---

## メッセージ一覧（handlers/messages.py）

| 関数名 | 用途 | QR |
|---|---|---|
| `date_select_msg(dates)` | 日付選択 | 最大12日＋最初から |
| `time_select_msg(times, truncated)` | 時間選択 | 最大12件＋最初から |
| `menu_select_msg(menus)` | メニュー選択 | 名前で送信（ID不可）|
| `name_input_msg(display_name)` | 名前入力促進 | なし（テキスト入力） |
| `confirm_msg(date, time, menu, name)` | 予約内容確認 | 確定する・最初から |
| `complete_msg(date, time, menu)` | 予約完了 | なし |
| `reservation_list_msg(reservations)` | 予約一覧 | なし |
| `cancel_select_msg(reservations)` | キャンセル選択 | cancel_<id>・最初から |
| `cancel_confirm_msg(reservation)` | キャンセル確認 | do_cancel_<id>・最初から |
| `cancel_complete_msg()` | キャンセル完了→再予約促進 | 予約する・いいえ |
| `welcome_msg(app_name)` | 友だち追加ウェルカム | なし |
| `reminder_msg(date, time, menu)` | 前日リマインド | キャンセル |
| `idle_guide_msg()` | 使い方ガイド | なし |
| `text_msg(text)` | 汎用テキスト | なし |

---

## DBテーブル設計

```sql
-- user_sessions（line_bot/db/database.py の init_db で作成）
CREATE TABLE IF NOT EXISTS user_sessions (
    line_user_id TEXT PRIMARY KEY,
    step         TEXT DEFAULT 'idle',
    temp_date    TEXT DEFAULT '',
    temp_time    TEXT DEFAULT '',
    temp_menu_id TEXT DEFAULT '',   -- メニューID（名前ではなくID保存）
    temp_name    TEXT DEFAULT '',
    updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
);

-- reservations（reservation/db/database.py で管理）
-- line_user_id カラム追加済み（_migrate_add_column で後付け対応）
-- channel = 'line' で WEB予約と区別
```

---

## 環境変数

```bash
LINE_CHANNEL_SECRET=       # LINE Developer Console から取得
LINE_CHANNEL_ACCESS_TOKEN= # LINE Developer Console から取得
APP_NAME=さくら歯科クリニック   # ウェルカムメッセージ等に使用
```

---

## リッチメニュー設計

### v1：固定メニュー（採用・実装対象）

デザイン素材はWeldexで制作し、LINE Official Account Manager にアップロードして設定する。

**レイアウト案A（2段・推奨）**
```
┌───────────────┬─────────────────┐
│               │                 │
│  📅 予約する  │  📋 予約確認    │
│               │ タップで予約状態 │
│               │  を確認できます  │
├───────────────┴─────────────────┤
│                                 │
│          ❌ キャンセル          │
│                                 │
└─────────────────────────────────┘
```

**レイアウト案B（3分割横並び）**
```
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
│ 📅 予約する │ 📋 予約確認 │❌ キャンセル│
│             │             │             │
└─────────────┴─────────────┴─────────────┘
```

```
仕様：
  サイズ：2500 × 1686px（LINE推奨・大メニュー）
  各ボタン：テキスト送信アクション
    予約する   → 「予約する」送信
    予約確認   → 「予約確認」送信 → bot が現在の予約詳細を返信（実装済み）
    キャンセル → 「キャンセル」送信
  設定場所：LINE Official Account Manager → リッチメニュー

デザイン制作メモ：
  - 背景色はクライアントのブランドカラーに合わせる
  - アイコンはSVGからPNG書き出し（絵文字不使用・印刷品質を確保）
  - フォント：クライアント指定 or ゴシック系（視認性重視）
  - ボタン境界線は控えめに（白抜き罫線）
  - 制作物：PNG 1枚（案Aまたは案Bを選定してから制作）
```

### v2：状態連動メニュー（将来検討・decisions.md #019）

```
予約なし状態：              予約あり状態：
┌────────┬────────┐         ┌──────────────────┐
│予約する│使い方  │         │  ご予約中        │
├────────┴────────┤         ├──────────────────┤
│   お問い合わせ  │         │❌ キャンセル     │
└─────────────────┘         └──────────────────┘
```

v1 納品後、顧客ニーズを確認してから着手。
`linkRichMenuIdToUser` API で予約作成・キャンセル時にユーザーごと切り替え。

---

## LINE Developer Console 設定手順

```
1. https://developers.line.biz にログイン
2. Messaging API チャンネルを作成
3. Webhook URL: https://your-domain.com/webhook
4. 応答設定:
   - 応答メッセージ: OFF
   - Webhook: ON
5. Channel Secret と Channel Access Token を取得（.env に設定）
6. リッチメニューは LINE Official Account Manager で設定
```

---

## 起動コマンド

```bash
# line_bot/ ディレクトリで
uvicorn main:app --host 0.0.0.0 --port 8002

# ローカルテスト（cloudflared 推奨・アカウント不要）
cloudflared tunnel --url http://localhost:8002
# 発行された URL/webhook を LINE Developer Console に設定
```

---

## 注意事項

```
- line-bot-sdk-python v3 使用（v2 と非互換）
- Webhook は HTTPS 必須（HTTP 不可）
- クイックリプライは最大13件（実質12件 + 「最初から」で運用）
- Push Message は月1000通まで無料（LINE公式アカウント無料プラン）
- macOS Python.org版はSSL証明書問題あり → config.py で certifi を強制使用
- メニューのクイックリプライ送信テキストは名前で送る（IDにすると「1」と表示される）
```

---

## 未解決・検討中

```
[ ] 動的リッチメニュー切り替え（v2）：decisions.md #019 参照
[ ] 管理者通知（予約作成・キャンセル時メール）：decisions.md #018 参照
[ ] 管理画面との連携強化（LINE セッション状態の可視化）
[ ] Railway / Render デプロイ（port 8002 / 独立サービス）
[ ] 予約変更フロー（v2）：顧客ニーズ確認後に着手
```
