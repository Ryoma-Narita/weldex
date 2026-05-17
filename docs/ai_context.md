# Weldex — claude.ai コールドスタート用コンテキスト

> このファイルを claude.ai の最初のメッセージに貼り付けて使う。
> 「以下のコンテキストを読んで、〇〇について設計を詰めたい」と続ける。

---

## プロジェクト概要

**事業名**：Weldex（個人事業主）
**サービス**：中小企業向け WEBサイト制作・LINE予約システム・システム開発
**ターゲット**：医療・歯科・士業・建設など社内エンジニアを持たない中小企業
**強み**：AIを活用した大手比1/3以下のコスト・業種特化・一社完結

---

## 技術スタック

```
バックエンド：Python 3.11 / FastAPI / SQLite（sqlite3直接）/ APScheduler
LINE SDK：line-bot-sdk-python v3
メール：SendGrid
フロントエンド（サイト）：Next.js 15 / TypeScript / Tailwind CSS / Framer Motion
フロントエンド（管理画面）：単一HTMLファイル（CSS・JS内包）
インフラ：Railway / Render（バックエンド）/ Vercel（Next.jsサイト）/ Cloudflare Pages（旧静的サイト）
```

---

## ディレクトリ構成

```
weldex/
├── CLAUDE.md                  ← Claude Code 用マスター指示書
├── docs/
│   ├── workflow.md            ← claude.ai / Claude Code 役割分担
│   ├── decisions.md           ← 設計判断・懸念事項ログ（ADR/BUG/TODO/RISK）
│   ├── database.md            ← DBスキーマ全定義
│   ├── seo.md                 ← SEOスコア記録・チェックリスト
│   ├── line.md                ← LINE予約仕様（実装済み）
│   ├── reservation.md         ← 予約・顧客管理仕様
│   └── outreach.md            ← 営業自動化仕様
├── site/                      ← 旧静的サイト（weldex.jp 公開済み）
├── site-next/                 ← Next.jsサイト（移行中）
├── outreach/                  ← 営業自動化（Phase1-2 実装済み）
├── reservation/               ← 予約・顧客管理（Phase3 実装済み・未デプロイ）
└── line_bot/                  ← LINE予約（Phase4 実装済み・実機テスト済み）
```

---

## 実装済み機能（フェーズ別）

### Phase 5：旧Weldexサイト（完了・公開済み）
- https://weldex.jp 公開中（Cloudflare Pages / 静的HTML）
- Formspree お問い合わせフォーム・GA4・OGP・Schema.org

### Phase 6：Next.jsサイト移行（進行中）
- Next.js 15 + TypeScript + Tailwind CSS + Framer Motion
- 実装済みページ：/ / /contact / /services / 404
- 実装済みコンポーネント：Header / Hero / Pillars / AISection / Cases / Process / FAQ / CTABand
- Schema.org：LocalBusiness / FAQPage / WebSite 出力済み
- スクロールアニメーション：Framer Motion whileInView 実装済み
- 未実装：/services/[slug]（業種別LP）/ /works / /pricing / /privacy / /tokusho / /tools/diagnosis

### Phase 1-2：営業自動化（実装済み・APIキー設定待ち）
- Google Places で企業収集 → サイト診断 → SendGrid でメール送信（1日50件上限）
- Gmail API で返信検知
- ダッシュボード（FastAPI + HTML）
- **未完了**：SendGrid APIキー設定・実送信テスト / Gmail API認証設定

### Phase 3：予約・顧客管理システム（実装済み・未デプロイ）
- WEB予約フォーム（患者向け）・管理画面・CSV import/export
- APScheduler 前日リマインド（メール）
- 設定ページ（管理者メール変更・パスワード変更）
- メニュー管理UI・リマインド手動送信・統計ダッシュボード
- 管理者通知（SendGrid / WEB予約・キャンセル）
- **未実装**：WEB予約ウィザード化 / LINE Push上限監視 / WEB→LINE紐づけフロー

### Phase 4：LINE予約システム（実装済み・実機テスト済み）
- FastAPI（port 8002）+ LINE Messaging API v3
- 状態遷移：予約フロー・キャンセルフロー・タイムアウト（30分）
- reservation.db 共有（LINE/WEB 二重予約防止）
- **未実装**：リッチメニュー画像 / Railway/Renderデプロイ / 管理者LINE通知

---

## 詰めること一覧（優先度順）

---

### 【A】サイト（Next.js / Phase 6）

---

#### A-1｜SEOメタタグの最適解

**背景**
現状の layout.tsx に Metadata オブジェクトを静的定義済み。SEOスコア92（目標100）。

**詰めたいこと**
1. `layout.tsx` の Metadata に何を書くべきか（必須 vs 任意の整理）
2. 業種別LP（/services/dental/ 等）でメタを動的生成する方法（generateMetadata）
3. `title` テンプレート（`"%s | Weldex"` 形式）の設定とページ別上書き
4. `canonical URL` の設定方法（alternates.canonical）の最適解
5. `keywords` メタタグは今でも必要か？
6. SEOスコアを92→100にするために何が足りないか

**前提・制約**
- OGP・Twitter Card・canonical は設定済み
- SchemaOrg.tsx で LocalBusiness / FAQPage / WebSite の JSON-LD 出力済み
- ターゲットキーワード：「AI ホームページ制作」「歯科 ホームページ制作」等

---

#### A-2｜og:image の作成・管理方針

**背景**
layout.tsx で `/og-image.png` を参照しているが、ファイルが未作成。SNS共有時に画像なし。

**詰めたいこと**
1. 静的PNG（1200×630 / Figmaで作成）vs Next.js ImageResponse（動的生成）どちらが良いか
2. 静的の場合：デザイン方針（ネイビー×ゴールド・キャッチコピー入り）
3. 動的の場合：`app/opengraph-image.tsx` の実装パターン
4. 業種別LP追加時に og:image を動的に切り替えるか、共通1枚でいくか
5. Vercel デプロイ後に og:debugger で確認する手順

---

#### A-3｜業種別LP設計（/services/[slug]）

**背景**
SEOキーワード「歯科 ホームページ制作」等を拾うための専用ページが必要。
CLAUDE.md Phase6 STEP3 に設計済み・未着手として記録済み。

**詰めたいこと**
1. URLパターン：`/services/[slug]`（動的）vs `dental.tsx`（静的）どちらが良いか
2. `data/industries.ts` に持たせるデータ構造
   - slug / title / description / heroText / targetKeywords / schema @type / caseStudies / faq 等
3. テンプレートと業種固有コンテンツの分け方（共通レイアウト + 差し替えセクション）
4. Schema.org 業種別タイプ（Dentist / LegalService / HomeAndConstructionBusiness）の使い方
5. 初期業種の優先順位（dental / legal / construction / beauty のどれから着手するか）

**前提**
- /services（サービス一覧）は実装済み
- 想定キーワード：docs/seo.md 参照

---

#### A-4｜Worksページ設計（/works）

**背景**
デモ・実績を見せるページ。現状 booking_demo.html が存在するが未公開。

**詰めたいこと**
1. Works ページに掲載するコンテンツの種類と優先順位
   - WEB予約デモ（booking_demo.html へのリンク or 埋め込み）
   - LINE予約デモ（デモ専用チャネル）
   - 歯科デモサイト・美容クリニックデモサイト（未作成）
2. 実績ゼロの状態でどう見せるか（デモ先行 or 「準備中」でスキップ）
3. デモサイトは weldex.jp のサブドメイン（demo.weldex.jp）にするか、別ドメインか
4. 「デモ利用お申し込み」CTA をどう設置するか

---

#### A-5｜料金ページ設計（/pricing）

**背景**
sitemap.ts に `/pricing` を登録済みだがページ未作成。
料金を明示することで問い合わせ前のミスマッチを防ぎたい。

**詰めたいこと**
1. 料金表のフォーマット（シンプルカード vs 比較表 vs 選択式ウィザード）
2. 掲載する料金の粒度（「¥150,000〜」の一言 vs 細かいオプション表）
3. 「まずは相談」誘導とのバランス（料金を見せすぎると問い合わせが減るリスク）
4. 競合他社との比較表を出すべきか
5. 月額保守プラン（¥8,000〜）の明示有無

---

#### A-6｜無料診断ツール設計（/tools/diagnosis）

**背景**
PageSpeed Insights API を使った「あなたのサイトを無料診断」ツールをリード獲得に使いたい。
decisions.md に設計方針メモあり。

**詰めたいこと**
1. PageSpeed Insights API の使い方（APIキー不要のエンドポイント確認）
2. スキャン演出UIの実装方針（プログレスバー → スコアゲージ → 項目別結果）
3. 診断結果の表示項目（表示速度・スマホ対応・SEO・セキュリティの4項目で良いか）
4. CTA設計：「あなたのサイトは〇点。無料相談で改善策を聞く」の文言
5. レート制限対策（API叩きすぎ防止）

---

#### A-7｜Vercelデプロイ戦略

**背景**
現在 weldex.jp は Cloudflare Pages（旧静的HTML）で公開中。
Next.js を Vercel にデプロイして weldex.jp を切り替えたい。

**詰めたいこと**
1. Cloudflare Pages → Vercel へのドメイン切り替え手順（DNSレコード変更・ダウンタイム最小化）
2. Vercel の無料プランで問題ないか（Next.js 15 / Edge Functions / 画像最適化）
3. 環境変数（FORMSPREE_ENDPOINT 等）の Vercel への設定方法
4. 旧 weldex.html（Cloudflare Pages）の扱い（削除 or サブドメインで残す）
5. CI/CD：GitHub main ブランチへの push で自動デプロイが理想か

---

### 【B】予約システム（Phase 3）

---

#### B-1｜WEB予約ウィザード化の設計詳細

**背景**
現状の予約フォームはシンプルな1ページ。decisions.md にウィザード6ステップの設計が決定済み。
実装前に詰めておきたい点がある。

**詰めたいこと**
1. ステップ間のデータ保持方法（React state / URL params / sessionStorage）
2. カレンダーUIの実装方針（ライブラリ使用 or カスタム実装）
3. 時間枠ブロックロジック：メニュー所要時間分をどう計算してブロックするか
4. 先着順ロジックの実装（同一時間に2人がほぼ同時に送信した場合の競合対策）
5. カスタムフィールド（管理画面から追加）のバリデーション設計
6. ステップバック（前に戻る）時のデータ保持

**決定済み事項**（decisions.md より）
- ステップ：メニュー→日付→時間→情報→確認→完了
- 電話番号必須・メールアドレス任意
- LINE友だち追加URLを完了画面に表示
- schedulesテーブル・custom_field_definitionsテーブル新設

---

#### B-2｜LINE Push上限監視の実装設計

**背景**
LINE無料プランは月200通上限。160通（80%）到達でアラート・200通超でメールフォールバック。
decisions.md #005 に決定済み。実装前の確認。

**詰めたいこと**
1. 月間送信数カウントの管理方法（DBテーブル新設 or 既存テーブルに集計）
2. カウントリセットのタイミング（毎月1日0:00に自動リセット）の実装
3. Weldex運用LINEボットへのアラート送信の実装方法
4. フォールバック判定のタイミング（送信直前 or スケジューラー起動時）
5. LINE専用患者（メールアドレスなし）へのフォールバック不可時の管理画面表示

---

#### B-3｜クライアント導入フロー・オンボーディング設計

**背景**
decisions.md にオンボーディング設計が記録済み。
実際にクライアントを獲得した際のオペレーション手順を具体化したい。

**詰めたいこと**
1. ヒアリングシートの項目（何を聞けば環境構築に進めるか）
2. 環境構築の所要時間・手順のチェックリスト整備
3. クライアントへの引き渡しドキュメント（管理画面マニュアル）の構成
4. LINEアカウント作成代行の手順と権限管理
5. 契約書に入れるべき項目（LINE所有権・データ保護・解約時の対応）
6. 保守月額（¥8,000〜）のサービス内容SLA（対応時間・対応範囲）

---

### 【C】LINE予約（Phase 4）

---

#### C-1｜リッチメニュー設計・運用

**背景**
decisions.md #016 にレイアウト仕様が決定済み。画像素材が未作成。

**詰めたいこと**
1. リッチメニュー画像のデザイン制作フロー（Figmaで作る？外注？）
2. クライアントごとにブランドカラーを変えるか、Weldex共通デザインにするか
3. API経由での自動設定（`POST /v2/bot/richmenu`）を実装するか、手動設定のままか
4. 動的リッチメニュー（decisions.md #019 / 保留中）をv1後にいつ実装するか

---

#### C-2｜管理者通知のLINEボット実装（decisions.md #018）

**背景**
WEB予約はSendGrid通知が実装済み。LINE予約時の管理者通知が未実装。
Weldex運用LINEボット（専用チャネル）を作成してRyomaにアラートを送る設計。

**詰めたいこと**
1. Weldex運用ボットとクライアント用ボットのコード上の分離方法
2. アラートをWeldex→Ryomaに送るのか、クライアント管理者にも送るのか
3. `reservation/services/mail.py` をline_botから呼び出す方法（importlib経由）
4. 将来的に全クライアントのアラートを一元管理する方法（1つのボットで複数クライアント対応）

---

### 【D】営業自動化（Phase 1/2）

---

#### D-1｜SendGrid・Gmail API の設定と実運用

**背景**
コードは実装済み。APIキー設定が完了していないため実送信テストが未実施。

**詰めたいこと**
1. SendGrid のドメイン認証（weldex.jp で送信するためのDNS設定）手順
2. Gmail API の OAuth認証フロー（refresh_token 取得の手順）
3. 特定電子メール法の遵守チェックリスト（送信者情報・配信停止リンク必須事項）
4. 1日50件上限のテスト方法（本番送信前にモックで検証する手順）
5. 返信検知ロジックの精度向上（自動返信・OOO返信を除外する方法）

---

#### D-2｜営業ターゲット選定・メール文面の最適化

**背景**
メールテンプレートA/B/C3パターンを実装済み。実際の開封率・返信率データがまだない。

**詰めたいこと**
1. 業種別の文面最適化（歯科・士業・建設でどう変えるか）
2. 件名のA/Bテスト設計（開封率を上げるための件名パターン）
3. 送信タイミングの最適化（曜日・時間帯）
4. フォローアップメール（初回未返信→3日後に別文面）の仕様設計
5. 配信停止リクエスト対応フロー（unsubscribesテーブルは実装済み）

---

### 【E】インフラ・運用

---

#### E-1｜バックアップ戦略

**背景**
予約データはSQLite。Railway/Renderのディスクは永続化できるが、障害時のデータ保護が未設計。

**詰めたいこと**
1. SQLiteのバックアップ頻度・保存先（S3 / Cloudflare R2 / GitHub等）
2. 自動バックアップの実装方法（APSchedulerで毎日実行 or cron）
3. 複数クライアントのDBを一元管理するバックアップスクリプト設計
4. 障害時のリストア手順とクライアントへの説明

---

#### E-2｜複数クライアント運用の管理効率化

**背景**
現状はクライアントごとに独立デプロイ。10件超えてきたら管理が煩雑になる懸念。

**詰めたいこと**
1. クライアント管理台帳（スプレッドシート）に記録すべき情報の整理
2. Railway/Render の複数サービス管理のベストプラクティス
3. 共通機能（バグ修正・機能追加）を全クライアントに展開する手順
4. 21件〜でのマルチテナント化検討（decisions.md に方針あり）のトリガー条件

---

## claude.ai での会話が終わったら

1. 決定事項を decisions.md に追記する文章をまとめてもらう
2. Claude Code に貼って「docs/decisions.md に追記して」と指示
3. 「CLAUDE.md の現在のタスクに実装ステップを追記して」と指示
4. 「CLAUDE.md を読んで現在のタスクを実行して」で実装開始

---

## 次に claude.ai で詰めたいこと（今すぐ貼り付けるセクション）

※ 上記の「詰めること一覧」から選んで、このセクションだけを会話の冒頭に貼る

```
【今回詰めたいこと】
（ここに A-1〜E-2 から選んだトピックをコピーして貼り付ける）
```
