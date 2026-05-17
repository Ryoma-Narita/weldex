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
DB：SQLite（開発）→ PostgreSQL（本番スケール時）
ORM：なし（sqlite3直接）
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

### ✅ Phase 1：営業自動化 — 収集・診断（完了）
```
[x] outreach/requirements.txt
[x] outreach/db/database.py
[x] outreach/config.py
[x] outreach/collectors/area_config.py
[x] outreach/analyzers/email_extractor.py
[x] outreach/analyzers/site_checker.py
[x] outreach/collectors/google_places.py
[x] outreach/main.py
[x] outreach/dashboard/app.py
[x] outreach/dashboard/templates/index.html
[x] 統合テスト（13件収集・診断完了）
# 2026-05-09 Phase1完了
```

---

### ✅ Phase 2：営業自動化 — 送信・返信（完了）
```
[x] mailers/templates.py（A/B/Cパターン・特定電子メール法対応）
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

### 🔧 Phase 6：Weldex.jp リニューアル（Next.js移行・実装済み・デプロイ待ち）
```
[x] STEP1：Next.js 15 + TypeScript + Tailwind CSS（site-next/）
[x] STEP2：weldex.htmlをNext.jsコンポーネントに移植
    Header / Hero / Pillars / AISection / Cases / Process / FAQ / CTABand / Footer
[x] STEP3：業種別LPテンプレート（data/industries.ts・dental/legal/construction/beauty）
[x] STEP4：メタデータ・OGP・Schema.org・sitemap.xml・robots.txt
[x] /works ページ実装

未着手：
[ ] STEP5：無料診断ツール（PageSpeed Insights API）
[ ] STEP6：Lighthouse計測・docs/seo.mdにスコア記録
[ ] STEP7：Vercelデプロイ
[ ] og-image.png 作成（Ryoma手動・1200×630・ネイビー×ゴールド）
[ ] demo.weldex.jp セットアップ（Ryoma手動作業）
# 2026-05-13 実装完了 / デプロイ未実施
詳細：docs/seo.md 参照
```

---

## ▼ 現在のタスク（ここだけ実行する）

### 現状サマリー（2026-05-18時点）
```
✅ 稼働中：reservation/ → Railway（earnest-gentleness-production-f682.up.railway.app）
✅ 稼働中：LINE Webhook → URLリダイレクト型（reservation/ に統合）
✅ 稼働中：weldex.jp（Cloudflare Pages）
🔧 実装済み・デプロイ未：site-next/（Next.js版サイト）
⬜ 未着手：Sentry / UptimeRobot / demo.weldex.jp
```

### 【次の候補】優先度順

```
① Phase 6 STEP7：Next.jsサイトをVercelにデプロイ（工数：小）
   → site-next/ は実装完了。Vercelに繋ぐだけで本番公開できる。

② Phase 6 STEP5：無料診断ツール（PageSpeed Insights API）（工数：中）
   → 営業トークに使える差別化ツール。Vercelデプロイ後に着手推奨。

③ インフラ：Sentry + UptimeRobot 設定（工数：小）
   → 本番障害検知。Railway稼働中なので早めに入れたい。

④ Phase 3 追加：#005 LINE Push上限監視（工数：小）
   → 月200通超でメールにフォールバック。LINE無料プラン運用時に必要。
```

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
