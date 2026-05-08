# Weldex — マスター CLAUDE.md

## 最初に必ず読むこと（読み飛ばし禁止）

1. このファイルを最初から最後まで読む
2. `docs/` 配下の該当する.mdを読む
3. 「現在のタスク」セクションだけを実行する
4. **1ステップ完了するたびに必ず動作確認してから次に進む**
5. 仕様が不明な点は実装を止めて質問する（勝手に決めない）

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
```

---

## ディレクトリ構成（全体）

```
weldex/
├── CLAUDE.md                      ← このファイル（毎回読む）
├── docs/
│   ├── implementation_roadmap.md  ← 実装順番・ステップ定義
│   ├── database.md                ← DBスキーマ
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
[ ] STEP1：outreach/requirements.txt 作成
[ ] STEP2：.env ファイル確認
[ ] STEP3：outreach/db/database.py 作成
[ ] STEP4：outreach/config.py 作成
[ ] STEP5：outreach/collectors/area_config.py 作成
[ ] STEP6：outreach/analyzers/email_extractor.py 作成
[ ] STEP7：outreach/analyzers/site_checker.py 作成
[ ] STEP8：outreach/collectors/google_places.py 作成
[ ] STEP9：outreach/main.py 作成
[ ] STEP10：outreach/dashboard/app.py 作成
[ ] STEP11：outreach/dashboard/templates/index.html 作成
[ ] STEP12：Phase1 統合テスト
詳細：docs/outreach.md 参照
```

### Phase 2：営業自動化（送信・返信）
```
[ ] 全STEP未着手 / 詳細：docs/outreach.md 参照
```

### Phase 3：予約・顧客管理システム
```
[ ] 全STEP未着手 / 詳細：docs/reservation.md 参照
```

### Phase 4：LINE予約システム
```
[ ] 全STEP未着手 / 詳細：docs/line.md 参照
```

---

## ▼ 現在のタスク（ここだけ実行する）

### 【今すぐやること】Phase 5 STEP1〜4（サイト公開）

---

#### STEP1：Formspree ENDPOINT差し替え

```
対象ファイル：site/weldex.html

事前準備（Codeでは不可・人間がやること）：
  1. https://formspree.io でアカウント作成
  2. 新しいフォームを作成
  3. 通知先メールを info@weldex.jp に設定
  4. フォームIDを控える（例：xpzgkwrb）

Codeでやること：
  site/weldex.html の以下の行を差し替える
  （行番号はgrep -n "FORMSPREE_ENDPOINT" site/weldex.htmlで確認）

  変更前：const FORMSPREE_ENDPOINT = 'https://formspree.io/f/XXXXXXXX';
  変更後：const FORMSPREE_ENDPOINT = 'https://formspree.io/f/【実際のID】';

確認：
  ブラウザで site/weldex.html を開く（file://でOK）
  お問い合わせフォームからテスト送信
  Formspreeダッシュボードに受信記録が表示される

完了条件：
  □ フォーム送信後「送信完了 ✓」が表示される
  □ Formspreeに受信記録がある
```

---

#### STEP2：GA4タグ有効化

```
対象ファイル：site/weldex.html

事前準備（人間がやること）：
  1. https://analytics.google.com でプロパティ作成
  2. G-XXXXXXXXXX を控える

Codeでやること：
  site/weldex.html の8〜15行目のコメントアウト（<!-- -->）を解除
  G-XXXXXXXXXX を実際のIDに差し替え（2箇所）

確認：
  ブラウザでアクセス → GAリアルタイムで自分のアクセスが表示される

完了条件：
  □ GAリアルタイムにアクセスが表示される
```

---

#### STEP3：Cloudflare Pagesデプロイ

```
事前準備（人間がやること）：
  1. GitHubリポジトリ作成（例：weldex-site、privateでOK）
  2. site/ フォルダの内容をpush
     git init && git add . && git commit -m "initial" && git push

Codeでやること：
  1. Cloudflare Pages → Workers & Pages → 「作成」→「Pages」
  2. GitHubリポジトリを接続
  3. ビルド設定：
     - フレームワークプリセット：なし
     - ビルドコマンド：（空欄）
     - 出力ディレクトリ：/（ルート）
  ※ Cloudflare操作は人間がブラウザで実施

完了条件：
  □ *.pages.dev でサイトが表示される
  □ カスタムドメイン weldex.jp の設定に進む
```

---

#### STEP4：最終動作確認

```
確認項目：
  □ https://weldex.jp でサイトが表示される
  □ HTTPS有効
  □ お問い合わせフォームのテスト送信（本番URL経由）
  □ Formspreeに受信記録・info@weldex.jpにメールが届く
  □ スマホで表示確認（iOS Safari / Android Chrome）
  □ GAリアルタイムで計測確認

完了後：
  CLAUDE.md の Phase5 全 [ ] を [x] に更新
  # 2026-05-XX Phase5完了 のコメントを追記
  → Phase1 STEP1に進む
```

---

### 【Phase5完了後すぐやること】Phase 1 STEP1〜2

```
STEP1：outreach/requirements.txt 作成
  詳細：docs/outreach.md → Phase1 STEP1 参照

STEP2：.env ファイル確認
  詳細：docs/outreach.md → Phase1 STEP2 参照
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
