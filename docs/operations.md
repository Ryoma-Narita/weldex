# Weldex 予約システム 運用マニュアル

最終更新：2026-05-10

---

## 目次

1. [パスワード・設定のリセット手順](#1-パスワード設定のリセット手順)
2. [DB直接操作（緊急時）](#2-db直接操作緊急時)
3. [デプロイ手順](#3-デプロイ手順)
4. [障害時の対応フロー](#4-障害時の対応フロー)
5. [クライアント引き渡しチェックリスト](#5-クライアント引き渡しチェックリスト)
6. [よくある問い合わせ対応](#6-よくある問い合わせ対応)

---

## 1. パスワード・設定のリセット手順

### 設計の概要

```
初回起動時：.env の ADMIN_PASSWORD → DBのsettingsテーブルへ書き込み（INSERT OR IGNORE）
以降の変更：管理画面から変更 → DBに保存 → .envは無視される
```

**クライアントがパスワードを忘れた場合 → Weldexへ連絡してもらう。**

### パスワードリセット手順（Weldex作業）

```bash
# 方法A：.envを書き換えてDBを上書き（推奨）
# 1. デプロイサーバーの .env を編集
ADMIN_PASSWORD=新しいパスワード

# 2. DBのsettingsテーブルを直接更新
sqlite3 reservation/data/reservation.db \
  "UPDATE settings SET value='新しいパスワード' WHERE key='admin_password';"

# 3. サーバーを再起動（自動反映のため不要な場合もある）
```

```bash
# 方法B：DBを削除して再作成（最終手段・予約データが消える）
# ※ 必ずバックアップを取ってから実行
cp reservation/data/reservation.db reservation/data/reservation.db.bak
rm reservation/data/reservation.db
# サーバー再起動で init_db() が走り、.envの値で初期化される
```

### 通知メールのリセット

```bash
sqlite3 reservation/data/reservation.db \
  "UPDATE settings SET value='new@example.com' WHERE key='admin_email';"
```

---

## 2. DB直接操作（緊急時）

### DBファイルの場所

```
reservation/data/reservation.db
```

### よく使うコマンド

```bash
# 予約一覧確認
sqlite3 reservation/data/reservation.db \
  "SELECT id, name, date, time, status FROM reservations ORDER BY date DESC LIMIT 20;"

# 予約ステータスを手動変更
sqlite3 reservation/data/reservation.db \
  "UPDATE reservations SET status='cancelled' WHERE id=<ID>;"

# 設定値の確認
sqlite3 reservation/data/reservation.db \
  "SELECT * FROM settings;"

# DBバックアップ
cp reservation/data/reservation.db reservation/data/reservation.$(date +%Y%m%d).bak
```

### 注意事項

- **本番DBを直接操作する前に必ずバックアップを取る**
- `DELETE` は使わず `status='cancelled'` や `active=0` で論理削除する
- 個人情報（電話・メール）はログに出力しない

---

## 3. デプロイ手順

### 予約システム（port 8001）

```bash
# Railway / Render の場合
# 1. リポジトリにpush
git push origin main

# 2. 環境変数を設定（初回のみ）
APP_NAME=クリニック名
APP_URL=https://example.com
ADMIN_PASSWORD=初期パスワード
ADMIN_EMAIL=admin@example.com
SECRET_KEY=ランダムな32文字以上の文字列
SENDGRID_API_KEY=（メール送信用）
FROM_EMAIL=info@weldex.jp

# 3. 起動コマンド
cd reservation && uvicorn main:app --host 0.0.0.0 --port 8001
```

### LINE予約bot（port 8002）

```bash
# 環境変数（追加で必要なもの）
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# 起動コマンド
cd line_bot && uvicorn main:app --host 0.0.0.0 --port 8002
```

### Webhook URL設定（LINE Developersコンソール）

```
https://<デプロイURL>/webhook
```

---

## 4. 障害時の対応フロー

### 予約が入らない

```
1. /health エンドポイントで生死確認
2. サーバーログで500エラーを確認
3. DBファイルの権限・ディスク容量を確認
4. SendGridのAPI制限を確認（メール送信失敗の場合）
```

### LINE予約が動かない

```
1. LINE DevelopersコンソールでWebhookの疎通確認
2. 管理画面「設定」→「LINE疎通テスト」を実行
3. サーバーログで署名検証エラーを確認
4. LINE_CHANNEL_SECRETが正しいか確認
```

### メールが届かない

```
1. SendGridダッシュボードでActivity Feedを確認
2. 迷惑メールフォルダを確認
3. FROM_EMAILドメインのDMARC/SPF設定を確認
4. ADMIN_EMAILが正しいか確認（管理画面「設定」で確認可能）
```

---

## 5. クライアント引き渡しチェックリスト

```
□ .env に APP_NAME を設定（クライアント名）
□ .env に ADMIN_PASSWORD を設定（初期パスワードをクライアントに伝える）
□ .env に ADMIN_EMAIL を設定（通知先メール）
□ .env に SENDGRID_API_KEY を設定
□ LINE Developers設定（Webhook URL・応答メッセージOFF）
□ 管理画面でログイン確認
□ テスト予約を1件入れて確認メールが届くことを確認
□ リマインドの時間設定を確認（デフォルト：前日18時）
□ メニューを実際の内容に変更（管理画面「メニュー管理」から）
□ 休業日を登録（管理画面「設定」から）
□ 初期パスワードの変更をクライアントに依頼（管理画面「設定」から）
```

---

## 6. よくある問い合わせ対応

| 問い合わせ | 対応 |
|-----------|------|
| パスワードを忘れた | Weldexへ連絡 → DBを直接更新（手順1参照） |
| メニューを追加・変更したい | 管理画面「メニュー管理」から操作可能 |
| 休業日を設定したい | 管理画面「設定」→「休業日管理」から操作可能 |
| 予約をキャンセルしたい | 管理画面「予約一覧」→ 該当予約の「キャンセル」ボタン |
| 過去の予約データを見たい | 管理画面「予約一覧」（ステータスフィルターで「キャンセル」も選択可） |
| CSV書き出しがしたい | 管理画面「インポート/エクスポート」から操作可能 |
| LINEの返信が来ない | 管理画面「設定」→「LINE疎通テスト」を実行してWeldexに報告 |

---

## 7. カスタマイズ提案メニュー（営業トーク用）

### 標準機能（基本プランに含む）

| 機能 | 内容 |
|------|------|
| ダッシュボード | 本日・今週・今月の予約数、キャンセル率、累計顧客数 |
| クイックフィルター | 今日・明日・今週の予約をワンクリックで切り替え |
| メニュー管理 | 施術メニューの追加・編集・非表示を管理画面から操作 |
| リマインド送信 | 前日自動送信 + 手動送信ボタン（メール） |
| 休業日管理 | 管理画面から休業日を登録・削除 |
| LINE予約 | LINE上で予約・キャンセル・リマインドを完結 |
| CSV出力 | 予約・顧客データをExcel対応形式でエクスポート |

### 追加カスタマイズ（オプション）

> 「ご要望に応じて以下の機能を追加できます。まずは基本プランでご利用いただき、
> 業務が安定してきたタイミングで追加するクリニックが多いです。」

| オプション | 内容 | 目安工数 |
|-----------|------|---------|
| チャネル比率グラフ | LINE/WEB/手動の予約比率をダッシュボードに表示 | 0.5日 |
| 日別予約推移グラフ | 直近7〜30日の予約数バーチャート | 1日 |
| リマインド手段選択 | メール／LINEをボタンで選んで送信 | 0.5日 |
| リマインド送信履歴 | 誰にいつ送ったか一覧で確認 | 0.5日 |
| 重複患者検知 | 同名・同電話番号の既存患者をアラート表示 | 1日 |
| WEB→LINE紐づけ | WEB予約後にLINE友だち追加→予約番号で紐づけ | 2日 |
| 管理者通知メール | 予約・キャンセル時に管理者へ自動通知 | 0.5日 |
| 複数スタッフ管理 | 担当者別の予約スケジュール管理 | 3日〜 |
| 予約枠カスタマイズ | 曜日・時間帯ごとに受付時間を個別設定 | 2日 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-05-10 | 初版作成（パスワードリセット・DB操作・デプロイ・障害対応） |
| 2026-05-10 | カスタマイズ提案メニュー（営業トーク用）追加 |
