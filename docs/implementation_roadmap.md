# docs/implementation_roadmap.md — 実装ロードマップ

> 最速かつ事故ゼロで実装するための順番を定義する。
> **この順番を変えない。依存関係があるので順番通りに進めること。**

---

## 順番設計の原則

```
1. 依存するものを先に作る（DBは全ての基盤→最初）
2. テスト可能な最小単位から作る（大きく作らない）
3. 外部API呼び出しは後回し（モックで動作確認してから本物を繋ぐ）
4. UIは最後（バックエンドが動いてから）
5. 統合テストは各Phaseの最後に1回だけ
```

---

## Phase 1：営業自動化（収集・診断）

**目標：ダッシュボードでリストを確認できる状態にする**
**目安時間：4〜6時間**

```
STEP 1  requirements.txt を作成
         → pip install で全パッケージが入ることを確認
         → 所要時間：5分

STEP 2  .env ファイルを確認
         → 全キーが設定されているか確認
         → python-dotenv で読み込めるか確認
         → 所要時間：5分

STEP 3  db/database.py を作成
         → init_db() でテーブル4つ作成（targets/settings/run_logs）
         → 確認：data/outreach.db が作成される
         → 所要時間：20分

STEP 4  config.py を作成
         → 環境変数の読み込み・デフォルト値設定
         → 確認：APIキーが読み込める
         → 所要時間：10分

STEP 5  collectors/area_config.py を作成
         → 業種キーワードとエリア定義のみ（API呼び出しなし）
         → 確認：get_search_queries() が正しいクエリを返す
         → 所要時間：15分

STEP 6  analyzers/email_extractor.py を作成
         → 外部通信なし・単体テスト可能
         → 確認：正常なメールを抽出・異常なメールを除外
         → 所要時間：20分

STEP 7  analyzers/site_checker.py を作成
         → robots.txt確認・文字コード判定・各種診断
         → 確認：example.comで診断が動く（外部通信あり）
         → 所要時間：40分

STEP 8  collectors/google_places.py を作成
         → --limit 3 で3件のみ取得してDBに保存
         → 確認：DBにデータが入る
         → 所要時間：30分

STEP 9  main.py を作成
         → --collect / --diagnose / --limit オプション
         → 確認：コマンドラインから実行できる
         → 所要時間：20分

STEP 10 dashboard/app.py を作成
         → /api/stats・/api/targets の2エンドポイントのみ
         → 確認：curl でJSONが返る
         → 所要時間：30分

STEP 11 dashboard/templates/index.html を作成
         → 既存の weldex_dashboard.html をベースに実APIと接続
         → モックデータ → fetch('/api/targets') に差し替え
         → 確認：ブラウザで実データが表示される
         → 所要時間：40分

STEP 12 Phase1 統合テスト
         → 10件収集 → 全件診断 → ダッシュボード確認
         → CLAUDE.md のステータス更新
         → 所要時間：20分
```

---

## Phase 2：営業自動化（送信・返信）

**目標：1日50件自動送信・返信をGmailで受け取れる状態**
**目安時間：3〜5時間**
**前提：Phase1完了・SendGridアカウント設定済み**

```
STEP 1  db/database.py に送信関連テーブルを追加
         → outreach_log・send_queue・unsubscribes
         → 確認：init_db()が冪等に動く（何度実行しても同じ結果）
         → 所要時間：15分

STEP 2  mailers/templates.py を作成
         → A/B/Cパターンの文面生成のみ（送信なし）
         → 確認：各パターンで正しい文面が生成される
         → 所要時間：20分

STEP 3  mailers/sender.py を作成
         → SendGrid APIを呼び出す（テスト送信1通）
         → 確認：自分のメールアドレスに届く
         → 所要時間：30分

STEP 4  scheduler.py を作成
         → build_queue()：送信キューの構築
         → run_send_queue()：1日50件上限で送信
         → 確認：キューが構築される・テスト送信できる
         → 所要時間：40分

STEP 5  replies/checker.py を作成
         → Gmail APIで返信検知・DBのstatusを更新
         → 確認：テスト返信が検知される
         → 所要時間：40分

STEP 6  ダッシュボードにKPI追加
         → 送信済み・返信率・今日の送信数カードを追加
         → 確認：数値が正しく表示される
         → 所要時間：30分

STEP 7  Phase2 統合テスト
         → キュー構築 → 5件送信 → 返信検知確認
         → CLAUDE.md ステータス更新
         → 所要時間：20分
```

---

## Phase 3：予約・顧客管理システム

**目標：クライアントに納品できる予約システムを動かす**
**目安時間：6〜8時間**

```
STEP 1  requirements.txt を作成
         → 所要時間：5分

STEP 2  db/database.py を作成
         → customers・reservations・closed_dates・admin_sessions
         → 確認：全テーブルが作成される
         → 所要時間：25分

STEP 3  config.py を作成
         → メニュー定義・予約設定・クライアント情報
         → 確認：設定値が正しく読み込まれる
         → 所要時間：15分

STEP 4  services/csv_handler.py を作成
         → 日本語ヘッダー対応・Shift-JIS対応・重複チェック
         → 確認：サンプルCSVを取り込んで顧客が登録される
         → 所要時間：40分

STEP 5  services/mail.py を作成
         → 確認メール・リマインドメール・管理者通知
         → 確認：テスト送信で届く
         → 所要時間：30分

STEP 6  routers/booking.py を作成
         → /api/booking/available-dates
         → /api/booking/available-times/{date}
         → /api/booking/create
         → 確認：curlで各エンドポイントが動く
         → 所要時間：45分

STEP 7  routers/customers.py を作成
         → 一覧・詳細・更新・削除
         → 確認：curlで動く
         → 所要時間：30分

STEP 8  routers/admin.py を作成
         → ログイン・セッション管理・予約管理
         → 確認：ログインできる・予約一覧が取れる
         → 所要時間：40分

STEP 9  routers/import_export.py を作成
         → CSVインポート・エクスポート
         → 確認：サンプルCSVを取り込める
         → 所要時間：30分

STEP 10 services/reminder.py を作成
         → APSchedulerで毎日実行
         → 確認：手動実行でリマインドが送られる
         → 所要時間：25分

STEP 11 static/booking/index.html を作成
         → booking_demo.html のWEB予約タブをAPIと接続
         → 確認：実際に予約できる・DBに入る
         → 所要時間：60分

STEP 12 static/admin/index.html を作成
         → booking_demo.html の管理画面タブをAPIと接続
         → 確認：予約一覧・顧客管理・CSV取込が動く
         → 所要時間：60分

STEP 13 main.py を作成
         → FastAPIアプリ・スケジューラー起動
         → 確認：uvicornで起動・全エンドポイントが動く
         → 所要時間：20分

STEP 14 Phase3 統合テスト
         → 予約 → DB確認 → 管理画面確認 → リマインド確認
         → CLAUDE.md ステータス更新
         → 所要時間：30分
```

---

## Phase 4：LINE予約システム

**目標：LINEから予約できる状態にする**
**目安時間：4〜6時間**
**前提：Phase3完了・LINE Developers登録済み**

```
STEP 1  ngrokのセットアップ
         → ローカルをHTTPSで公開（LINE WebhookはHTTPS必須）
         → ngrok http 8000 → URLをLINE Developer Consoleに設定
         → 確認：Webhookの疎通確認（LINE Developer ConsoleでVerify）
         → 所要時間：15分

STEP 2  requirements.txt・config.py を作成
         → 所要時間：10分

STEP 3  db/database.py を作成
         → reservations・user_sessionsテーブル
         → 確認：init_db()が動く
         → 所要時間：20分

STEP 4  handlers/webhook.py を作成
         → イベント振り分けのみ（まずFollowEventだけ動かす）
         → 確認：友達追加するとウェルカムメッセージが届く
         → 所要時間：30分

STEP 5  handlers/reservation.py を作成
         → 状態遷移を1ステップずつ実装
           5a. select_date のみ → 確認
           5b. select_time を追加 → 確認
           5c. select_menu を追加 → 確認
           5d. input_name を追加 → 確認
           5e. confirm・完了 を追加 → 確認
         → 各サブステップで必ずLINEで動作確認
         → 所要時間：90分

STEP 6  handlers/reminder.py を作成
         → 確認：手動実行でリマインドが届く
         → 所要時間：25分

STEP 7  main.py を作成
         → FastAPI + APScheduler
         → 確認：起動して全フローが動く
         → 所要時間：20分

STEP 8  Phase4 統合テスト
         → LINEから予約フル操作 → リマインド確認 → キャンセル確認
         → CLAUDE.md ステータス更新
         → 所要時間：30分
```

---

## Phase 5：サイト公開

**目標：weldex.jpで公開・お問い合わせが届く状態**
**目安時間：1〜2時間**

```
STEP 1  Formspreeでフォームを機能させる（10分）
         → formspree.io でフォーム作成
         → weldex.html の form action に設定
         → 確認：テスト送信でメールが届く

STEP 2  Googleアナリティクス設置（10分）
         → G-XXXXXXXのタグをweldex.htmlに埋め込む
         → 確認：アナリティクスのリアルタイムで自分のアクセスが見える

STEP 3  Cloudflare Pagesにデプロイ（15分）
         → GitHubにpush → Cloudflare Pagesと連携
         → 確認：weldex.jpでアクセスできる

STEP 4  動作確認（15分）
         → お問い合わせフォームのテスト送信
         → メール受信確認（Gmail）
         → スマホで表示確認
```

---

## 全体の優先順位まとめ

```
今日：
  Phase 5 STEP1〜3（サイト公開・30分）
  Phase 1 STEP1〜4（環境構築・30分）

今週：
  Phase 1 STEP5〜12（収集・診断・ダッシュボード）

来週以降：
  Phase 2（送信・返信）
  Phase 3（予約システム）
  Phase 4（LINE）
```

---

## よくある実装ミスと対策

```
❌ DBスキーマを後から変えようとする
✅ STEP3で必ず全テーブルを作ってからSTEP4に進む

❌ APIを本番データで最初からテストする
✅ --limit 3 で3件のみ・テスト用URLで確認してから本番データ

❌ フロントとバックを同時に作る
✅ バックエンドのAPIをcurlで確認してからフロントを作る

❌ LINEのWebhookをローカルで直接テストしようとする
✅ 必ずngrokを使ってHTTPS経由でテストする

❌ 全Phaseのrequirements.txtを1つにまとめる
✅ Phase毎に独立したrequirements.txtを持つ
```
