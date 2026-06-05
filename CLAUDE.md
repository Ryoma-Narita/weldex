# Weldex — マスター CLAUDE.md

## 最初に必ず読むこと（読み飛ばし禁止）

1. このファイルを最初から最後まで読む
2. `docs/workflow.md` を読む（役割分担・マルチクライアント設計）
3. `docs/` 配下の該当する.mdを読む
4. 「現在のタスク」セクションだけを実行する
5. **1ステップ完了するたびに必ず動作確認してから次に進む**
6. 仕様が不明な点は実装を止めて質問する（勝手に決めない）
7. 懸念・設計判断は `docs/decisions.md` に追記する（CLAUDE.mdに書かない）

---

## プロジェクト概要

**事業名**: Weldex（ウェルデックス）
**事業形態**: 個人事業主
**サービス**: WEBサイト制作・LINE予約システム・システム開発・保守運用
**ターゲット**: 医療・歯科・士業・建設など社内エンジニアを持たない中小企業
**強み**: AIを活用した大手比1/3以下のコスト・業種特化・一社完結
**サイト**: https://weldex.jp
**メール**: info@weldex.jp

---

## 実装の鉄則（これを守らないと全部やり直しになる）

### やるべきこと
```
✅ 1ステップ = 1タスク。まとめて作らない
✅ 各ステップの最後に必ず動作確認コマンドを実行する
✅ エラーが出たら必ず解決してから次に進む
✅ 仕様が不明なら「仕様確認が必要：〇〇」と報告して止まる
✅ ファイルを作る前に既存ファイルを確認する（ls・cat）
✅ 実装完了後は必ずこのCLAUDE.mdのステータスを更新する
✅ 関数には必ずdocstringを書く
✅ 外部API呼び出しは必ずtry-exceptで囲む
✅ ログはwrite_log()を使う（print禁止）
```

### やってはいけないこと
```
✗ 複数ファイルを一度に作らない（1ファイル作って確認→次へ）
✗ APIキーをコードに直接書かない（必ず os.environ.get() を使う）
✗ テストなしで次のステップに進まない
✗ エラーを無視して進まない
✗ 仕様が不明な部分を勝手に決めない
✗ 既存ファイルを確認せず上書きしない
✗ requirements.txtのバージョンを勝手に変えない
✗ 本番DBを直接操作しない
✗ robots.txtを無視してスクレイピングしない
✗ 1日50件を超えてメールを送信しない（特定電子メール法）
✗ 個人情報（電話・メール等）をログに出力しない
✗ HTMLに絵文字を使わない（必ずSVGアイコン）
✗ スマホ対応なしでHTMLを作らない（overflow-x:hidden必須）
```

---

## 技術スタック

### バックエンド
```
言語：Python 3.11+
FW：FastAPI 0.110.0
DB：PostgreSQL（本番・Railway）/ SQLite禁止（Railway Volume + NFS で fsync 非互換）
ORM：なし（psycopg2直接）
スケジューラー：APScheduler 3.10.4
メール：SendGrid 6.11.0
```

### フロントエンド（デモ・管理画面）
```
単一HTMLファイル（CSS・JS内包）
フォント：Google Fonts（Cormorant Garamond + DM Sans）
アイコン：インラインSVGのみ（絵文字禁止）
アニメーション：CSS scroll reveal + Intersection Observer
```

### インフラ
```
サイト公開：Cloudflare Pages（weldex.jp）
バックエンド：Railway または Render
ドメイン：weldex.jp（取得済み）
メール受信：Cloudflare Email Routing → Gmail転送
メール送信：SendGrid
```

---

## 環境変数一覧

```bash
# Google Places API（営業自動化）
GOOGLE_PLACES_API_KEY=

# Claude AI（営業メール自動生成）← 2026-06-05追加
ANTHROPIC_API_KEY=     # console.anthropic.com で取得 / Railway outreach サービスに設定

# 営業自動化ダッシュボード（Railway outreach サービス）
DATABASE_URL=          # Railway Postgres → ${{Postgres.DATABASE_URL}} で自動注入
DASHBOARD_PASSWORD=    # Basic認証パスワード（ユーザー名固定: weldex）
DB_PATH=               # 旧SQLite用（PostgreSQL移行後は不要だが変数は残存）

# SendGrid（メール送信）
SENDGRID_API_KEY=
FROM_EMAIL=info@weldex.jp
FROM_NAME=Weldex

# Gmail API（返信検知）
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=

# LINE（予約システム）
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# 予約システム
APP_NAME=             # クライアント名（例：さくら歯科クリニック）
APP_URL=              # クライアントのURL
ADMIN_PASSWORD=       # 管理画面パスワード
SECRET_KEY=           # セッション署名キー
ADMIN_EMAIL=          # 管理者通知先メール

# Weldexサイト
FORMSPREE_ENDPOINT=   # formspree.ioで取得したURL（例：https://formspree.io/f/XXXXXXXX）
GA_MEASUREMENT_ID=    # GoogleアナリティクスのG-XXXXXXXXXX

# Weldex運用ボット（全クライアント共通・アラート専用）
ADMIN_LINE_USER_ID=                    # RyomaのLINE User ID
WELDEX_LINE_CHANNEL_ACCESS_TOKEN=      # Weldex運用ボットのトークン（LINE Developersで専用チャネル作成）

# LINE Push上限監視
LINE_MONTHLY_ALERT_THRESHOLD=160       # 80%到達でRyomaにアラート（デフォルト160）

# メニュー料金表示
SHOW_MENU_PRICE=false                  # true=表示（飲食・美容）/ false=非表示（医療・歯科デフォルト）
```

---

## ディレクトリ構成（全体）

```
weldex/
├── CLAUDE.md                      ← このファイル（毎回読む）
├── docs/
│   ├── implementation_roadmap.md  ← 実装順番・ステップ定義
│   ├── database.md                ← DBスキーマ（全テーブル定義）
│   ├── workflow.md                ← ★開発ワークフロー・マルチクライアント設計（必読）
│   ├── decisions.md               ← 設計判断・懸念事項ログ（ADR/BUG/TODO/RISK）
│   ├── outreach.md                ← 営業自動化仕様
│   ├── reservation.md             ← 予約・顧客管理仕様
│   └── line.md                    ← LINE予約仕様
├── site/                          ← 静的サイト（Cloudflare Pages）
│   ├── weldex.html                ← 本番サイト（★作業対象）
│   └── booking_demo.html          ← 予約デモ
├── outreach/                      ← 営業自動化
├── reservation/                   ← 予約システム
├── line_bot/                      ← LINE予約
└── .env                           ← 環境変数（Gitに含めない）
```

---

## 実装ステータス

> 凡例：✅ 実施済み（コード完成・本番稼働）／ 🔧 実装済み・設定待ち／ ⬜ 未着手

---

### ✅ Phase 5：Weldexサイト公開（完了）
```
[x] weldex.html 完成（デザイン・コンテンツ・SEO・スマホ対応）
[x] booking_demo.html 完成
[x] プライバシーポリシー・特商法 組み込み済み
[x] FAQ・制作フロー 組み込み済み
[x] OGP・構造化データ 組み込み済み
[x] ドメイン取得（weldex.jp）
[x] Formspree ENDPOINT設定（https://formspree.io/f/mqendgdb）
[x] GA4タグ有効化（G-643YQLHM8F）
[x] Cloudflare Pagesデプロイ（weldex.pages.dev）
[x] カスタムドメイン設定・動作確認（https://weldex.jp）
# 2026-05-08 Phase5完了：weldex.jp 公開
```

---

### ✅ Phase 1：営業自動化 — 収集・診断・ダッシュボード（完了・本番稼働）
```
[x] outreach/requirements.txt（psycopg2-binary・anthropic==0.40.0 含む）
[x] outreach/db/database.py（PostgreSQL対応・psycopg2）
    - settings → outreach_settings にリネーム（予約システムとのテーブル衝突解消）
    - get_send_mode() / set_send_mode() 追加
    - send_queue に approval_status/approved_at/rejected_at/subject_override 等追加
[x] outreach/config.py（DEFAULT_LIMIT=100）
[x] outreach/collectors/area_config.py（47都道府県・343市区・10業種）
[x] outreach/analyzers/email_extractor.py
[x] outreach/analyzers/site_checker.py
    - OLD_YEAR_THRESHOLD: 5年→10年に変更
    - _detect_old_tech()追加（フレーム/Flash/非推奨タグ/固定幅レイアウト検出）
    - industry引数追加・医療系業種判定（is_medical_industry）
    - check_site() 返却値に is_medical フラグ追加
[x] outreach/collectors/google_places.py
    - Details API に types フィールド追加（業種自動補正）
    - 大手チェーン除外（_is_chain_store）
[x] outreach/mailers/templates.py
    - テンプレートD追加（医療系・電話のみ→LINE予約訴求）
    - select_template_key() 追加（ステータス+業種→最適テンプレート自動選択）
[x] outreach/main.py（diagnose時にindustry渡す・推奨テンプレートをログ表示）
[x] outreach/dashboard/app.py
    - POST /api/generate-email（Claude Haiku で営業メール自動生成）
    - GET/POST /api/send-mode（確認して送信 / 自動送信 切り替え）
    - GET /api/send-queue（承認待ち一覧・メールプレビュー付き）
    - POST /api/send-queue/{id}/approve（承認→即送信）
    - POST /api/send-queue/{id}/reject（却下・ターゲットをpendingに戻す）
    - GET/POST /api/customers, PATCH/DELETE 顧客CRUD
    - 顧客詳細モーダル・ターゲット手動追加
[x] outreach/dashboard/templates/index.html
    - 「✦ メール生成」ボタン・生成モーダル（件名/本文コピー・再生成）
    - 送信モードトグル（ダッシュボード右上）
    - 「送信キュー」タブ（承認待ち一覧・確認して送信・却下）
    - 「顧客リスト」タブ・顧客詳細モーダル（自動保存）
[x] Railway デプロイ（weldex サービス・Nixpacks・Root: outreach/）
[x] Railway PostgreSQL 接続（${{Postgres.DATABASE_URL}}・sslmode=require）
[x] Railway 環境変数：ANTHROPIC_API_KEY 追加が必要（メール生成に使用）
# 2026-05-09 Phase1実装完了
# 2026-06-01 Railway本番デプロイ・PostgreSQL移行完了
# 2026-06-05 診断ロジック強化・Claude AI営業メール生成・送信モード切り替え追加
本番URL：https://weldex-production.up.railway.app
```

---

### ✅ Phase 2：営業自動化 — 送信・返信（完了）
```
[x] mailers/templates.py（A/B/C/Dパターン・特定電子メール法対応）
[x] mailers/sender.py（SendGrid）
[x] replies/checker.py（Gmail API・自動返信除外ロジック含む）
[x] scheduler.py（1日50件上限・auto対応）
[x] send_queue・outreach_log・unsubscribesテーブル追加
[x] ダッシュボードにKPI追加
[x] outreach/get_gmail_token.py（Gmail OAuth トークン取得スクリプト）
[x] 営業メールテンプレートフッター（特定電子メール法対応・SENDER_ADDRESS）
[x] SendGrid APIキー設定・実送信テスト完了
[x] Gmail API認証設定・返信検知テスト完了
# 2026-05-09 Phase2実装完了 / 2026-05-18 実送信・返信検知テスト完了
```

---

### ✅ Phase 3：予約・顧客管理システム（本番稼働中）
```
本番URL：https://earnest-gentleness-production-f682.up.railway.app
DB：Railway PostgreSQL（同プロジェクト内）

[x] models/schemas.py（Pydanticスキーマ・ハニーポット含む）
[x] services/mail.py（確認・リマインド・管理者通知メール）
[x] services/csv_handler.py（Shift-JIS・BOM付きエクスポート）
[x] services/reminder.py（APScheduler 毎日18時リマインド）
[x] services/data_retention.py（個人情報自動削除・毎月1日0:00）
[x] services/nurturing.py（問い合わせ自動返信・3日後フォロー・LINEアラート）
[x] routers/booking.py（患者向け予約API・カレンダーAPI・レートリミット）
[x] routers/admin.py（管理者API・セッション認証・ログイン試行制限・リマインド手動送信）
[x] routers/customers.py（顧客CRUD）
[x] routers/import_export.py（CSVインポート・エクスポート）
[x] main.py（FastAPIアプリ統合）
[x] static/booking/index.html（フルカレンダーUI・1年先まで・予約状況色分け）
[x] static/admin/index.html（管理画面・LINE/WEB経路バッジ・統計ダッシュボード・メニュー管理・設定ページ）
[x] 本番環境デプロイ（Railway・Nixpacksビルダー）
[x] LINE Webhook統合（reservation/handlers/webhook.py・URLリダイレクト型）
[x] settingsテーブル（notify_on_booking / notify_on_cancel 等）
[x] SlowAPI レートリミット・ハニーポット
# 2026-05-18 本番稼働確認
詳細：docs/reservation.md 参照

未着手（優先度低）：
[ ] #005 LINE Push上限監視（月160通アラート→200通でメールフォールバック）
[ ] #020 WEB予約→LINE紐づけフロー
[ ] XSS対策：admin画面のtextContent化確認
[ ] .env.localと.envの分離
```

---

### ✅ Phase 4：LINE予約システム（URLリダイレクト型・本番稼働中）
```
設計変更：LINEネイティブ予約ステートマシンは廃止。
          テキスト・ポストバックはすべて /booking/ URLに誘導する方式に変更。
          reservation/ に統合済み（line_bot/ は旧実装として残存）。

[x] reservation/handlers/webhook.py（LINE Webhook・FollowEvent・TextEvent・PostbackEvent）
[x] reservation/handlers/reservation.py（キーワード→URL誘導）
[x] LINE Developer Console設定・Webhook疎通確認（200 OK）
[x] 実機テスト完了（予約・変更・キャンセルのキーワード反応確認）

未着手（任意）：
[ ] リッチメニュー画像制作（Weldexで制作）→ LINE Official Account Manager で設定
# 2026-05-18 本番稼働確認（URLリダイレクト型）
詳細：docs/line.md 参照
```

---

### ✅ インフラ移行（完了）
```
[x] LINE bot × reservation を1サービスに統合（reservation/ に集約）
[x] SQLite → PostgreSQL移行（psycopg2 非binary + apt.txt libpq-dev）
[x] Railway PostgreSQL プロビジョニング（${{Postgres.DATABASE_URL}}）
[x] Nixpacksビルダー設定（Dockerfile禁止・NIXPACKS_PKGS=postgresql削除）

未着手：
[ ] Sentry導入（main.pyにsentry_sdk.init()追加）
[ ] UptimeRobot設定（Ryoma手動作業）
[ ] 開発用LINEチャネル作成（Ryoma手動作業）
```

---

### ✅ Phase 6：Weldex.jp リニューアル（Next.js移行・本番稼働中）
```
[x] STEP1：Next.js 15 + TypeScript + Tailwind CSS（site-next/）
[x] STEP2：weldex.htmlをNext.jsコンポーネントに移植
[x] STEP3：業種別LPテンプレート（data/industries.ts・dental/legal/construction/beauty）
[x] STEP4：メタデータ・OGP・Schema.org・sitemap.xml・robots.txt
[x] /works ページ実装
[x] STEP7：Vercelデプロイ（weldex.jp → Vercel、カスタムドメイン設定済み）

[x] サイトリデザイン（2026-06-05）
    - Hero: AI具体的ベネフィット2項目追加（✓チェックマーク付き）
      「AIが予約リマインドを自動送信 → 無断キャンセル率を削減」
      「AIが営業メールを自動生成 → 月多数の企業に自動アプローチ」
    - Header: PCデスクトップナビ正常化・ハンバーガー非表示確実化（CSS対応）
    - KineticSection: テキスト「DXを促進」「全て一社で完結」に更新
    - BrandSection: 語源テキスト更新
    - 浮遊アイコン: PC位置をclamp()で対称化

[x] サービスページ拡充（2026-06-05）
    - /services/reservation 新規作成（WEB予約システム詳細）
    - /services/line 全面書き換え（LINE連携・アカウント作成代行）
    - /services/crm 新規作成（顧客管理システム ¥300,000〜・紫配色）
    - /pricing 削除・各サービスページに料金プランを統合
    - ハンバーガーメニュー全英語化（FREE CONSULTATION / Privacy Policy / Legal）
    - sitemap.ts 更新（4サービスページ追加・/pricing削除）

[x] デモ環境整備（2026-06-05）
    - /works: Share Demoセクション追加（ネイビー背景・直リンク2件）
    - 商談URLとして weldex.jp/works を案内可能な状態に
    - weldex.jp/booking・weldex.jp/demo-dashboard が完全動作するデモとして機能

未着手：
[ ] STEP5：無料診断ツール（PageSpeed Insights API）→ B級優先
[ ] STEP6：Lighthouse計測・docs/seo.mdにスコア記録
[ ] og-image.png 作成（Ryoma手動・1200×630・ネイビー×ゴールド）
[ ] demo.weldex.jp カスタムドメイン（Cloudflare CNAME → Railway）→ Ryoma手動
# 2026-05-13 実装完了 / 2026-05-18 Vercelデプロイ完了
# 2026-06-05 大規模リデザイン・サービスページ拡充・デモ環境整備
詳細：docs/seo.md / docs/decisions.md 参照
```

---

### ✅ Phase 7：全通知のLINE統一（2026-06-05）
```
[x] reservation/services/line_notify.py 新規作成
    - push(message) 共通関数（WELDEX_LINE_CHANNEL_ACCESS_TOKEN + ADMIN_LINE_USER_ID）
    - 失敗しても例外を上げない（本業処理に影響なし）
[x] reservation/main.py: グローバル例外ハンドラー追加（エラー→LINE通知）
    - Sentry廃止（US企業・個人情報保護法リスクを回避）
[x] reservation/services/mail.py: 新規予約・キャンセル時にLINE通知追加
[x] reservation/services/reminder.py: リマインド失敗時にLINE通知追加
[x] reservation/services/nurturing.py: 既存LINE実装をline_notify.pushに統一

有効化に必要な環境変数（Railway > earnest-gentleness > Variables）:
  WELDEX_LINE_CHANNEL_ACCESS_TOKEN = Weldex運用ボットトークン
  ADMIN_LINE_USER_ID               = RyomaのLINE User ID

LINE通知仕様の詳細は今後詰める → docs/decisions.md「LINE通知仕様」参照
# 2026-06-05 実装完了・Railway自動デプロイ済み
```

---

## ▼ 現状サマリー・懸念点・今後のタスク（2026-06-05更新）

---

### ✅ 現在稼働中のもの

| サービス | URL | 状態 |
|---|---|---|
| Weldex 公式サイト（Next.js） | https://weldex.jp | Vercel 本番稼働 |
| 予約システム（FastAPI） | https://earnest-gentleness-production-f682.up.railway.app | Railway 本番稼働 |
| 患者向け予約画面 | /booking/ | フルカレンダーUI・1年先まで予約可 |
| 管理画面 | /admin/ | ダッシュボード・予約・顧客・メニュー・設定 |
| LINE Webhook | /line/webhook | URLリダイレクト型・実機確認済み |
| 営業自動化ダッシュボード | https://weldex-production.up.railway.app | Railway 本番稼働・PostgreSQL |

---

### ⚠️ 懸念点・既知のリスク

**インフラ**
- 障害検知ゼロ：Sentry（エラー通知）・UptimeRobot（死活監視）未設定。Railway がダウンしても気づけない
- Railway 無料枠：スリープあり。初回アクセスに数秒遅延する可能性
- Cloudflare Pages の旧サイトが残存（影響はないが整理推奨）

**予約システム**
- SendGrid 未設定時：確認メール・リマインドが送信されない（Railway 環境変数に SENDGRID_API_KEY 要設定）
- XSS 対策：管理画面の innerHTML 部分が未レビュー（textContent 化が必要）
- `.env` / `.env.local` 分離未実施：本番と開発の環境変数が混在するリスク

**LINE**
- 無料プランは月 1,000 通上限。Push Message（リマインド）が多いクライアントは有料移行必須
- LINE Push 上限監視未実装：160 通アラート・200 通でメールフォールバックの仕組みがない
- リッチメニュー未設定：画像制作・LINE Official Account Manager での設定が残っている

**営業自動化**
- Gmail API の refresh_token は長期未使用時に期限切れの可能性（再取得が必要になる場合あり）
- 1日 100 件上限（DEFAULT_LIMIT=100）。Google Places API 無料枠（月$200）で月約2,000件まで無料
- メール送信は「確認して送信」モードで運用中。Railway ANTHROPIC_API_KEY 設定後にAI生成ボタンが使用可能
- `weldex-volume`（旧SQLite用）はキャンバス上に残存するが使用していない（削除可）
- settings テーブル衝突は解消済み（outreach_settings に改名）

**サイト（Next.js）**
- og-image.png 未作成：OGP 画像がなく SNS シェア時に画像なし
- demo.weldex.jp 未設定：クライアント向けデモ環境がない
- Lighthouse スコア未計測：SEO・パフォーマンス数値を記録していない

---

### 📋 今後の実装タスク（優先度順）

---

#### 🔴 今すぐやる（手動作業・設定のみ）

```
[ ] ANTHROPIC_API_KEY を Railway に設定（Ryoma 手動・5分）
    → https://console.anthropic.com → API Keys → Create Key
    → Railway > weldex サービス > Variables > 追加
    → 設定後にAI営業メール生成ボタンが使用可能になる

[ ] UptimeRobot 設定（Ryoma 手動・無料プラン・15分）
    → https://uptimerobot.com で Railway 2サービスの死活監視を設定
    → ダウン時メール通知。障害に気づけない状態を解消

[ ] og-image.png 作成（Ryoma 手動・1200×630・ネイビー×ゴールド）
    → weldex.jp/ にアクセスした際の OGP 画像（SNS シェア・LINE 等）
    → site-next/public/og-image.png に配置してプッシュ
```

---

#### 🟡 近いうちにやる（工数：小）

```
[ ] Sentry 導入（工数：30分）
    → reservation/requirements.txt に sentry-sdk[fastapi] 追加
    → reservation/main.py に sentry_sdk.init() 追加
    → Railway 環境変数 SENTRY_DSN 追加
    → 理由：本番Railway で例外が起きても現状は気づけない

[ ] 営業自動化 — 実際に収集して試す（工数：1時間）
    → Railway ダッシュボードから業種・エリアを選んで収集
    → 診断を実行して site_status・detail を確認
    → 「✦ メール生成」ボタンで Claude Haiku の生成品質を確認
    → 「送信キュー」タブで確認フローを通しテスト

[ ] SendGrid ドメイン認証（weldex.jp）（工数：30分）
    → Cloudflare DNS に CNAME レコード追加（docs/decisions.md D-1 参照）
    → 未設定だとメールが迷惑メール判定される可能性あり
```

---

#### 🟢 余裕があればやる（工数：小〜中）

```
[ ] XSS 対策：管理画面 innerHTML → textContent 化（工数：1時間）
    → 対象：reservation/static/admin/index.html
    → 予約システムの管理画面にユーザー入力値を innerHTML で出力している箇所

[ ] LINE Push 上限監視（工数：中）
    → 月 160 通でアラート・200 通超でリマインドをメールにフォールバック
    → 対象：reservation/db/database.py・reservation/services/reminder.py

[ ] 無料診断ツール（PageSpeed Insights API）（工数：中）
    → site-next/ に実装。weldex.jp の集客・営業差別化ツール
    → 見込み客が自社サイトのスコアを入力すると問題点と改善提案が表示される

[ ] Lighthouse 計測・docs/seo.md にスコア記録（工数：小）
    → weldex.jp の現状スコアをベースラインとして記録

[ ] weldex.jp サービスページの充実（工数：中）
    → /services/dental・/services/legal 等の業種別LPに実績・価格帯・FAQ を追加
    → 問い合わせ転換率の向上

[ ] ヒアリングフォーム → 提案書自動生成（工数：中）
    → /hearing の回答内容を Claude API で分析して提案書の叩き台を自動生成
    → Ryoma の工数を大幅削減
```

---

#### 📦 クライアント獲得後にやる

```
[ ] Railway 環境変数をクライアント別に設定
    APP_NAME・APP_URL・ADMIN_EMAIL・LINE_CHANNEL_SECRET 等
[ ] 管理画面 URL・ADMIN_PASSWORD をクライアントに共有
[ ] LINE チャネル（クライアント専用）を LINE Developers で作成
[ ] Railway PostgreSQL の定期バックアップ確認
[ ] リッチメニュー画像制作・LINE Official Account Manager で設定
[ ] WEB予約 → LINE 紐づけフロー（予約完了メールに友だち追加 URL を添付）
[ ] demo.weldex.jp セットアップ（Vercel プレビュー URL で代替可能）
```

---

### 🔧 次に着手する推奨タスク（優先度順）

1. **ANTHROPIC_API_KEY を Railway に設定**（5分・手動）→ 今日作った機能が使えるようになる
2. **営業自動化を実際に動かして確認**（1時間）→ 収集→診断→AI生成→送信キュー確認
3. **UptimeRobot 設定**（15分・手動）→ 本番障害の検知体制を整える
4. **Sentry 導入**（30分）→ Railway エラーをリアルタイム検知

---

## ステップ実行フォーマット

```
【ステップN】ファイル名・機能名
─────────────────────────────────
作業：〇〇を実装する

確認コマンド：
  $ python -c "from xxx import yyy; print('OK')"

完了条件：
  □ エラーなく実行できる
  □ 期待する出力が得られる

→ 完了したら「ステップN完了」と報告してから次へ
→ エラーが出たら「エラー発生：〇〇」と報告して止まる
```

---

## Claude Codeの応答ルール（必読・常に守る）

```
【実装前に必ずやること】
  1. 何をどのファイルに・なぜ実装するかを日本語で説明する
  2. ユーザーに「進めてよいですか？」と確認を求める
  3. OKをもらってから実装を開始する

【説明のフォーマット】
  - 対象ファイル
  - 実装内容（何をするか）
  - なぜその方法か（選択の理由）
  - 完了後の確認方法

【例外：確認なしで進めてよいケース】
  - ユーザーが「進めて」「やって」と明示的に指示した場合
  - 同一メッセージ内で複数ステップを一括指示された場合

【工程完了後に必ずやること】
  各タスク・フェーズの完了後、次にできる作業を優先度つきで提案する。
  フォーマット：
    - 次の候補（優先度順）をリストアップ
    - 各候補に「なぜ今やるべきか」を一言添える
    - 工数感（小／中／大）を明記する
```

---

## エラー自動解析ルール

```
【エラー報告】
─────────────────────────────────────
発生箇所：ファイル名・関数名・行番号
エラー種別：ImportError / ValueError / HTTPError / etc.
エラーメッセージ：（全文）
試したこと・提案する解決策
─────────────────────────────────────
```

---

## 判断基準

**新しい機能を追加したい** → 止める。Claude.aiで仕様を詰めてから着手。
**仕様が不明** → 止める。「仕様確認が必要：〇〇」と報告。勝手に決めない。
**エラーが3回解決しない** → エラー全文・コードをClaude.aiに貼る。

---

## CLAUDE.md更新ルール（必須）

Phase完了ごとに：
1. `[ ]` を `[x]` に変更
2. `docs/*.md` に仕様変更を反映
3. 新しい環境変数を追記
4. 「現在のタスク」を次の作業に更新
5. `# 2026-XX-XX PhaseX完了：〇〇` を追記

**このCLAUDE.mdを更新せずに作業を終了しないこと。**
