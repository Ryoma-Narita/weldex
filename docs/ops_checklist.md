# Weldex 運用チェックリスト

---

## APIキー・外部サービス発行状況

| サービス | 用途 | 発行 | .env設定 | 備考 |
|---|---|---|---|---|
| Google Places API | 営業先収集 | [ ] | [ ] | GCP課金設定必須 |
| SendGrid APIキー | メール送信 | [ ] | [ ] | ドメイン認証も必要 |
| SendGrid ドメイン認証 | weldex.jpで送信 | [ ] | [ ] | CloudflareでCNAME追加 |
| Gmail API OAuth | 返信検知 | [ ] | [ ] | refresh_token取得要 |
| LINE クライアント用チャネル | 予約bot | [ ] | [ ] | クライアントごとに作成 |
| LINE 開発用テストチャネル | ローカル開発 | [ ] | [ ] | 本番と完全分離 |
| LINE Weldex運用チャネル | アラート用 | [ ] | [ ] | 全クライアント共通 |
| Formspree | お問い合わせ | [x] | [x] | mqendgdb |
| GA4 | アクセス解析 | [x] | [x] | G-643YQLHM8F |
| Vercel | Next.jsデプロイ | [ ] | [ ] | A-7保留中 |
| Railway（アプリ） | バックエンド | [ ] | [ ] | |
| Railway（PostgreSQL） | DB | [ ] | [ ] | DATABASE_URL取得 |
| Sentry | エラー監視 | [ ] | [ ] | DSN取得・main.pyに追加 |
| UptimeRobot | 死活監視 | [ ] | [ ] | 監視URL登録 |
| GBP | ローカルSEO | [ ] | [ ] | Ryoma手動作成 |

---

## デプロイ前チェック（クライアント導入時）

| 確認項目 | 状態 |
|---|---|
| .envの全キーが設定済み | [ ] |
| SENDGRID_SANDBOX_MODE=false（本番のみ） | [ ] |
| LINEのWebhook URLが本番URLに向いている | [ ] |
| Railway PostgreSQLのDATABASE_URL設定済み | [ ] |
| Sentryに本番のDSN設定済み | [ ] |
| UptimeRobotに本番URLを登録済み | [ ] |
| テスト予約が通る（WEB・LINE両方） | [ ] |
| 管理者メールに通知が届く | [ ] |
| リマインドのドライラン実行済み | [ ] |
| Lighthouseスコア計測・docs/seo.mdに記録 | [ ] |

---

## セキュリティルール

- APIキー・シークレット・トークンは **AIチャット（claude.ai・Claude Code）に絶対に貼らない**
- .envから必ずos.environ.get()で読み込む
- .envはGitignoreに含まれていることを確認してから作業開始
- 本番環境のキーはRailway/Vercelの環境変数画面で設定
- client_id・client_secret・refresh_tokenはRyomaが自分で.envに直接記載

---

## 環境変数チェックリスト（本番）

```bash
# DB
DATABASE_URL=                          # Railway PostgreSQL

# SendGrid
SENDGRID_API_KEY=
FROM_EMAIL=info@weldex.jp
FROM_NAME=Weldex
SENDGRID_SANDBOX_MODE=false

# Gmail API
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=

# Google Places
GOOGLE_PLACES_API_KEY=

# LINE（クライアント用）
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# LINE（Weldex運用用・全クライアント共通）
WELDEX_LINE_CHANNEL_ACCESS_TOKEN=
ADMIN_LINE_USER_ID=

# 予約システム
APP_NAME=
APP_URL=
ADMIN_PASSWORD=
SECRET_KEY=
ADMIN_EMAIL=

# セキュリティ
DATA_RETENTION_COMPLETED_DAYS=365
DATA_RETENTION_CANCELLED_DAYS=90
LINE_MONTHLY_ALERT_THRESHOLD=160

# 監視
SENTRY_DSN=

# サイト
NEXT_PUBLIC_FORMSPREE_ENDPOINT=
NEXT_PUBLIC_GA_ID=
SHOW_MENU_PRICE=false
```
