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

### Phase 5：Weldexサイト公開 ← 今ここ
```
[x] weldex.html 完成（デザイン・コンテンツ・SEO・スマホ対応）
[x] booking_demo.html 完成
[x] プライバシーポリシー・特商法 組み込み済み
[x] FAQ・制作フロー 組み込み済み
[x] OGP・構造化データ 組み込み済み
[x] ドメイン取得（weldex.jp）
[x] コピーライト年修正（2026）
[x] Formspree送信ロジック実装済み（ENDPOINTのID差し替えのみでOK）
[x] GA4タグ埋め込み済み（コメントアウト解除＋ID差し替えのみでOK）
[x] Phase5 STEP1：Formspree ENDPOINT差し替え・テスト送信確認（https://formspree.io/f/mqendgdb）
[x] Phase5 STEP2：GA4タグ有効化（G-643YQLHM8F）
[x] Phase5 STEP3：Cloudflare Pagesにデプロイ（weldex.pages.dev）
[x] Phase5 STEP4：カスタムドメイン設定・動作確認（https://weldex.jp）
# 2026-05-08 Phase5完了：weldex.jp 公開
```

### Phase 1：営業自動化（収集・診断）
```
[x] STEP1：outreach/requirements.txt 作成
[x] STEP2：.env ファイル確認
[x] STEP3：outreach/db/database.py 作成
[x] STEP4：outreach/config.py 作成
[x] STEP5：outreach/collectors/area_config.py 作成
[x] STEP6：outreach/analyzers/email_extractor.py 作成
[x] STEP7：outreach/analyzers/site_checker.py 作成
[x] STEP8：outreach/collectors/google_places.py 作成
[x] STEP9：outreach/main.py 作成
[x] STEP10：outreach/dashboard/app.py 作成
[x] STEP11：outreach/dashboard/templates/index.html 作成
[x] STEP12：Phase1 統合テスト（13件収集・診断完了）
詳細：docs/outreach.md 参照
# 2026-05-09 Phase1 STEP1-11完了
```

### Phase 2：営業自動化（送信・返信）
```
[x] mailers/templates.py（A/B/Cパターン・特定電子メール法対応）
[x] mailers/sender.py（SendGrid）
[x] replies/checker.py（Gmail API）
[x] scheduler.py（1日50件上限・auto対応）
[x] send_queue・outreach_log・unsubscribesテーブル追加
[x] ダッシュボードにKPI追加
[ ] SendGrid APIキー設定・実送信テスト
[ ] Gmail API認証設定・返信検知テスト
# 2026-05-09 Phase2実装完了（APIキー設定待ち）
```

### Phase 3：予約・顧客管理システム（MVP完了）
```
[x] models/schemas.py（Pydanticスキーマ）
[x] services/mail.py（確認・リマインド・管理者通知メール）
[x] services/csv_handler.py（CSV/Excel日本語対応・Shift-JIS・BOM付きエクスポート）
[x] services/reminder.py（APScheduler 毎日18時リマインド）
[x] routers/booking.py（患者向け予約API）
[x] routers/admin.py（管理者API・セッション認証）
[x] routers/customers.py（顧客CRUD）
[x] routers/import_export.py（CSVインポート・エクスポート）
[x] main.py（FastAPIアプリ統合）
[x] static/booking/index.html（患者向け予約フォーム）
[x] static/admin/index.html（管理画面・LINE/WEB経路バッジ表示）
[x] 統合テスト（API全ルート・DB初期化・予約作成・ログイン確認）
[ ] 本番環境デプロイ（Railway/Render）
[ ] クライアント向けカスタマイズ（APP_NAME・メール設定）
詳細：docs/reservation.md 参照
# 2026-05-09 Phase3実装完了（デプロイ待ち）
# 2026-05-10 Phase3追加機能 STEP1〜STEP6完了（settings・設定UI・メニュー管理・リマインド・ダッシュボード強化・管理者通知）
```

### Phase 3 追加機能：設計済み・実装待ち
```
[x] settingsテーブル作成（key-value形式）
[x] 管理画面「設定ページ」新設
    - 管理者通知メール変更（#008）
    - パスワード変更（#008）
    - LINE疎通テストボタン（TODO:本番安定後に削除）
[x] #010 メニュー管理UI
    - menusテーブルに price / active / sort_order カラム追加
    - 追加・編集・非表示・並び順変更
[x] #009 リマインド手動送信UI
    - 予約一覧に「リマインド送信」ボタン追加（メールあり予約のみ表示）
    - 送信前確認ダイアログ
    - POST /admin/reservations/{id}/remind API追加
[x] 統計ダッシュボード（管理画面トップ）
    - 6指標表示：本日・今週・今月・今月キャンセル件数・キャンセル率・累計顧客数
    - 予約一覧クイックフィルター（今日・明日・今週・すべて）追加
    - GET /admin/reservations に date_from / date_to パラメータ追加（週範囲対応）
[x] #018 管理者通知（SendGrid）
    - WEB予約・LINE予約・患者キャンセルの3イベントで管理者にメール
    - 管理者が自分でキャンセルした場合は通知なし
    - notify_on_booking / notify_on_cancel で設定画面からON/OFF切替
    - LINE予約通知：案A（line_bot/services/mail.py コピー）
    - テスト用メール：Gmailエイリアス（+weldex）を使用
[ ] #005 LINE Push上限監視
    - 月間送信数をDBで管理
    - 160通でWeldex運用LINEアラート送信
    - 200通超過でリマインドをメールにフォールバック
[ ] #020 WEB予約→LINE紐づけフロー
    - 予約完了メールにLINE友だち追加URL添付
    - ウェルカムメッセージで予約番号入力を促す
    - 予約番号でline_user_idを紐づけ保存
詳細：docs/decisions.md 参照
```

### インフラ移行
```
[ ] LINE bot × reservation を1サービスに統合
[ ] SQLite → PostgreSQL移行（psycopg2）
[ ] Railway PostgreSQL プロビジョニング
[ ] Sentry導入（main.pyにsentry_sdk.init()追加）
[ ] UptimeRobot設定（Ryoma手動作業）
[ ] 開発用LINEチャネル作成（Ryoma手動作業）
```

### セキュリティ
```
[x] SlowAPI導入・レートリミット設定
    POST /booking：5/IP/分・GET /slots：30/IP/分・POST /admin/login：5/IP/分
[x] ログイン試行制限（5回→10分ソフトロック・login_failed_count / login_locked_until）
[x] 個人情報自動削除スケジューラー（reservation/services/data_retention.py）
    毎月1日0:00：完了予約を1年後に匿名化・キャンセルを3ヶ月後に削除
[ ] XSS対策：admin画面のtextContent化確認・修正
[ ] LINE webhook署名検証の実装確認
[x] ハニーポット追加（booking form + schemas.py + booking.py）
[ ] .env.localと.envの分離設定
```

### D-1 営業自動化
```
[x] outreach/get_gmail_token.py 作成
[x] outreach/replies/checker.py 自動返信除外ロジック追加
[x] 営業メールテンプレートフッター追加（特定電子メール法対応・SENDER_ADDRESS環境変数追加）
```

### CMO マーケティング
```
[ ] demo.weldex.jp セットアップ（Ryoma手動作業）
[x] /works ページ実装（site-next/app/works/page.tsx）
[x] 問い合わせナーチャリング実装（reservation/services/nurturing.py）
    即時自動返信（SendGrid）・即時RyomaへLINEアラート・3日後フォローアップ
[ ] outreach/mailers/templates.pyにinquiry_auto_reply / inquiry_followup_1追加（nurturing.pyに実装済み）
```

### Phase 3 WEB予約ウィザード：設計済み・実装待ち
```
[ ] ウィザード形式6ステップに変更（メニュー→日付→時間→情報→確認→完了）
[ ] schedulesテーブル新設（曜日ごと時間帯・所要時間ブロック）
[ ] custom_field_definitionsテーブル新設（管理画面から項目追加）
[ ] reservationsにcustom_fieldsカラム追加（JSON）
[ ] 時間枠自動ブロック（メニュー所要時間分）
[ ] 先着順ロジック（同一時間帯の競合対策）
詳細：docs/decisions.md「WEB予約システム設計」参照
```

### Phase 4：LINE予約システム（実機テスト済み）
```
[x] line_bot/requirements.txt
[x] line_bot/config.py（APP_NAME追加・reservation/config.pyのスロット設定を共有）
[x] line_bot/db/database.py（user_sessions CRUD・予約件数チェック）
[x] line_bot/handlers/messages.py（全ステップ・ウェルカム・キャンセル完了・リマインドQR）
[x] line_bot/handlers/reservation.py（状態遷移・予約上限チェック・キャンセル後再予約促進）
[x] line_bot/handlers/reminder.py（LINE Push・キャンセルQR付き）
[x] line_bot/handlers/webhook.py（署名検証・MessageEvent・FollowEvent対応）
[x] line_bot/main.py（FastAPI + APScheduler）
[x] 状態遷移動作テスト（予約フロー・キャンセルフロー・タイムアウト・最初からリセット）
[x] LINE Developer Console設定・実機テスト完了
[ ] リッチメニュー画像制作（Weldexで制作）→ LINE Official Account Manager で設定
[ ] Railway/Renderデプロイ（port 8002）
詳細：docs/line.md 参照
# 2026-05-10 Phase4実装・実機テスト完了
```

### Phase 6：Weldex.jpリニューアル（Next.js移行）：設計済み・未着手
```
[x] STEP1：Next.js 15 + TypeScript + Tailwind CSSプロジェクト初期構築（site-next/）
[x] STEP2：既存weldex.htmlをNext.jsコンポーネントに移植
    - Header / Hero / Pillars / AISection / Cases / Process / FAQ / CTABand / Footer
[x] STEP3：業種別LPテンプレート実装（data/industries.ts・dental/legal/construction/beauty）
[x] STEP4：メタデータ・OGP・Schema.org・sitemap.xml・robots.txt設定
[x] STEP3-ex：/works ページ実装
[ ] STEP5：無料診断ツール実装（PageSpeed Insights API）
[ ] STEP6：Lighthouse計測・docs/seo.mdにスコア記録
[ ] STEP7：Vercelデプロイ
[ ] og-image.png 作成（Ryoma手動・1200×630・ネイビー×ゴールド）
# 2026-05-13 セキュリティ・D-1・CMO・Phase6 STEP3 実装完了
詳細：docs/seo.md 参照
```

---

## ▼ 現在のタスク（ここだけ実行する）

### 【今すぐやること】Phase 3 追加機能（設計済み・実装順）

優先順位：✅①②③完了 → ④ リマインド手動送信 → ⑤ 統計ダッシュボード → ⑥ 管理者通知

---

#### STEP4：リマインド手動送信UI

```
対象ファイル：
  reservation/routers/admin.py（手動リマインド送信API追加）
  reservation/static/admin/index.html（予約一覧に「リマインド送信」ボタン追加）

実装内容：
  - POST /admin/reservations/{id}/remind（手動リマインド送信）
  - 予約一覧の操作列に「リマインド」ボタン追加
  - 送信前確認ダイアログ（confirm()）
  - remind_sentは 0=未送信 / 1=送信済み（2=失敗は将来対応）
  - メールアドレス未設定の場合はエラーメッセージ表示

詳細：docs/decisions.md #009 参照

完了条件：
  □ APIルート確認（python3 -c "from routers.admin import router; ..."）
  □ 管理画面でリマインドボタンが表示される
  □ 送信確認ダイアログが表示される
```

---

#### STEP5：統計ダッシュボード強化

```
対象ファイル：
  reservation/db/database.py（get_dashboard_stats()拡張）
  reservation/static/admin/index.html（ダッシュボードUI更新）

追加する指標：
  - チャネル比率（LINE/WEB/手動/CSV）
  - キャンセル件数（今月）
  - 今週の予約件数

完了条件：
  □ get_dashboard_stats()テスト
  □ 管理画面ダッシュボードに指標が表示される
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
