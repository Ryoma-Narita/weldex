# docs/outreach.md — 営業自動化システム仕様

> マスターCLAUDE.mdを先に読むこと。

## 概要

Google Places APIでターゲット企業を収集し、サイト診断→メール自動送信→返信管理までを自動化するシステム。

---

## ディレクトリ構成

```
outreach/
├── main.py                  # エントリーポイント
├── config.py                # 設定・環境変数
├── requirements.txt
├── collectors/
│   ├── __init__.py
│   ├── google_places.py     # Google Places APIで収集
│   └── area_config.py       # エリア・キーワード定義
├── analyzers/
│   ├── __init__.py
│   ├── site_checker.py      # サイト診断
│   └── email_extractor.py   # メールアドレス抽出・検証
├── mailers/
│   ├── __init__.py
│   ├── templates.py         # メール文面（A/B/C）
│   └── sender.py            # SendGrid送信
├── replies/
│   ├── __init__.py
│   └── checker.py           # Gmail APIで返信検知
├── db/
│   ├── __init__.py
│   └── database.py          # SQLite CRUD
├── dashboard/
│   ├── app.py               # FastAPI
│   └── templates/
│       └── index.html       # ダッシュボードUI
├── scheduler.py             # 定期実行
└── data/
    └── outreach.db          # 自動生成
```

---

## Phase 1：収集・診断（着手中）

### 実装ステータス
```
[ ] STEP 1: config.py
[ ] STEP 2: db/database.py
[ ] STEP 3: collectors/area_config.py
[ ] STEP 4: collectors/google_places.py
[ ] STEP 5: analyzers/email_extractor.py
[ ] STEP 6: analyzers/site_checker.py
[ ] STEP 7: main.py
[ ] STEP 8: dashboard/app.py
[ ] STEP 9: dashboard/templates/index.html
[ ] STEP 10: 統合テスト・動作確認
```

---

### Phase 1 実装ステップ詳細

**各ステップを順番に実行すること。前のステップが完了するまで次に進まない。**

---

#### STEP 1：config.py

```python
# outreach/config.py
import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")
# 以下 docs の仕様通りに実装
```

確認コマンド：
```bash
python -c "from config import GOOGLE_PLACES_API_KEY; print('OK' if GOOGLE_PLACES_API_KEY else 'KEY MISSING')"
```
完了条件：`OK` が出力される

---

#### STEP 2：db/database.py

作成するテーブル：
- targets（収集した企業情報）
- settings（設定キーバリュー）
- run_logs（実行ログ）

確認コマンド：
```bash
python -c "from db.database import init_db; init_db(); print('DB OK')"
ls data/outreach.db  # ファイルが作成されていること
```
完了条件：`DB OK` + `data/outreach.db` が存在する

---

#### STEP 3：collectors/area_config.py

業種キーワードの揺らぎとエリアのサブ分割を定義する。
docs/outreach.md の「業種キーワード」「エリア設定」を参照。

確認コマンド：
```bash
python -c "from collectors.area_config import get_search_queries; q = get_search_queries('歯科医院', '東京都渋谷区'); print(len(q), '件のクエリを生成'); print(q[0])"
```
完了条件：複数のクエリが生成される

---

#### STEP 4：collectors/google_places.py

**注意：テストは必ず --limit 3 で3件のみ取得すること（API料金節約）**

確認コマンド：
```bash
python -c "
from db.database import init_db
from collectors.google_places import collect_targets
init_db()
n = collect_targets('歯科医院', '東京都渋谷区', limit=3)
print(f'{n}件収集')
"
```
完了条件：1件以上収集されてDBに保存される

---

#### STEP 5：analyzers/email_extractor.py

誤抽出防止フィルタを含む。
docs/outreach.md の「メールアドレス抽出の除外パターン」を参照。

確認コマンド：
```bash
python -c "
from analyzers.email_extractor import extract_email
# テスト用HTML
html = '<a href="mailto:info@example.com">お問い合わせ</a>'
result = extract_email(html, 'https://example.com')
print('抽出結果:', result)
assert result == 'info@example.com', 'NG'
print('OK')
"
```
完了条件：`info@example.com` が正しく抽出される

---

#### STEP 6：analyzers/site_checker.py

**注意：実在するURLでテストすること。タイムアウトは8秒以内。**

以下を必ず実装：
- 文字コード自動判定（chardet使用）
- robots.txt確認
- Copyright年判定（5年以上前を "old"）
- viewport確認（スマホ非対応判定）
- 予約システム有無の確認

確認コマンド：
```bash
python -c "
from analyzers.site_checker import check_site
# サイトなしのテスト
result = check_site('')
print('サイトなし:', result['status'])
assert result['status'] == 'none'

# 実在するサイトのテスト
result = check_site('https://example.com')
print('example.com:', result['status'])
print('OK')
"
```
完了条件：`none` が正しく判定される・エラーなし

---

#### STEP 7：main.py

`--collect` と `--diagnose` の2オプションを実装。

確認コマンド：
```bash
# ヘルプ表示
python main.py --help

# 収集テスト（3件）
python main.py --collect --industry 歯科医院 --area 東京都渋谷区 --limit 3

# 診断テスト（収集済み1件）
python main.py --diagnose --limit 1
```
完了条件：エラーなく実行できる・DBにデータが入る

---

#### STEP 8：dashboard/app.py

FastAPIアプリ。エンドポイント：
- `GET /` → index.html
- `GET /api/stats` → 統計JSON
- `GET /api/targets` → ターゲット一覧（フィルター・ページネーション）

確認コマンド：
```bash
uvicorn dashboard.app:app --port 8000 &
sleep 2
curl http://localhost:8000/api/stats
# JSONが返ってくればOK
```
完了条件：`/api/stats` がJSONを返す

---

#### STEP 9：dashboard/templates/index.html

`weldex_dashboard.html`（既存デモ）を元に実APIと接続する。
モックデータをAPIレスポンスに差し替えるだけでよい。

確認コマンド：
```bash
# ブラウザで http://localhost:8000 を開いて確認
# データが表示されること
```
完了条件：ブラウザでダッシュボードが表示される・実データが見える

---

#### STEP 10：統合テスト

```bash
# 1. 収集（10件）
python main.py --collect --industry 歯科医院 --area 東京都渋谷区 --limit 10

# 2. 診断（全件）
python main.py --diagnose

# 3. ダッシュボードで確認
uvicorn dashboard.app:app --port 8000
# http://localhost:8000 でデータが表示されること

# 4. CLAUDE.md のステータスを更新する
```
完了条件：10件収集→診断→ダッシュボード表示まで一通り動く

### サイト診断の判定基準
```python
# Copyright年の判定
OLD_YEAR_THRESHOLD = datetime.now().year - 5  # 5年以上前を「古い」と判定

# ステータス分類
"none"       # URLなし・404・タイムアウト・接続不可
"old"        # Copyright5年以上前・SSL未対応
"no_mobile"  # viewport未設定・@mediaなし
"phone_only" # 予約フォームなし・電話のみ
"ok"         # 問題なし
"error"      # 診断エラー
"unchecked"  # 未診断
```

### 重複排除（重要）
```python
# 1. place_idで重複チェック
# 2. 店舗名+住所の先頭20文字で類似チェック
# 3. 電話番号（ハイフン除去後）で重複チェック
```

### メールアドレス抽出の除外パターン
```python
EXCLUDED_EXTENSIONS = {'.png','.jpg','.gif','.svg','.css','.js','.woff'}
EXCLUDED_PREFIXES   = {'noreply','no-reply','webmaster','postmaster','bounce'}
```

---

## Phase 2：送信・返信管理

### 実装ステータス
```
[ ] mailers/templates.py（A/B/Cパターン）
[ ] mailers/sender.py（SendGrid）
[ ] replies/checker.py（Gmail API）
[ ] scheduler.py（1日50件上限）
[ ] outreach_log・send_queue・unsubscribesテーブル追加
[ ] ダッシュボードにKPI追加
```

### メール文面パターン
```
A：サイトなし     → WEB集客の機会損失を訴求
B：古い・スマホ非対応 → スマホ流入7割・SEO低下を訴求
C：電話予約のみ   → 時間外の取りこぼしを訴求

共通：資料請求ベースのCTA（対面なし）
      配信停止リンク必須（特定電子メール法）
      1日50件以内厳守
```

### 送信優先度（send_queueのpriority）
```
phone_only → 3（最高：即効性が高い）
none       → 2
no_mobile  → 1
old        → 0
```

---

## ダッシュボード画面構成

```
タブ1：ダッシュボード
  - サマリーカード8枚
  - 業種別・ステータス別棒グラフ
  - 7日間収集推移グラフ（Chart.js）
  - 最近の収集リスト

タブ2：ターゲットリスト
  - キーワード・ステータス・業種フィルター
  - ソート・ページネーション（15件/ページ）

タブ3：設定
  - 業種ON/OFF・エリア追加削除
  - スライダー（間隔・並列数・Copyright年数）

タブ4：ログ
  - INFO/WARN/ERROR色分け
  - カテゴリフィルター（collect/diagnose/system）
  - SSEでリアルタイム更新
```

---

## 起動コマンド

```bash
# 収集のみ
python main.py --collect --industry 歯科医院 --area 東京都渋谷区

# 診断のみ
python main.py --diagnose

# ダッシュボード起動
uvicorn dashboard.app:app --reload --port 8000

# 送信（Phase2）
python scheduler.py --build   # キュー構築
python scheduler.py --run     # 送信実行
```

---

## 注意事項

```
- Google Places API：月$200無料枠（約1万件/月）
- SendGrid：月100通まで無料
- 特定電子メール法：1日50件以内・配信停止リンク必須
- robots.txt：必ず確認してからスクレイピング
- 文字コード：Shift-JIS対応必須（chardetで自動判定）
```

---

## 営業メール改善アイデア（2026-06-12〜・継続検討）

> 文面・判断ロジックを詰めていくための作業メモ。実装したら「実装済み」と記す。

### 実装済み
- **診断データの数値化**：site_checker が応答秒数を実測（1.5秒以上で detail に追記）。
  AI生成プロンプトを「診断事実→一般統計で影響を数値化→解決策」構成に強化。
  伝聞表現必須・捏造禁止・主観的に貶す表現禁止。

### 検討中（優先度順）
- **A. 同業他社の動向を1行（社会的証明）**［工数:小］
  「〇〇市の歯科120院のうち46%がすでにWEB予約を導入」等。outreach DBの
  同エリア・同業種の集計から生成。「遅れている側」と気づかせる訴求。
- **B. 診断×パーソナライズドデモの合わせ技**［工数:極小］
  「貴院サイトは応答3.2秒。比較用に貴院名入りの予約システムをご用意（0.3秒）→URL」。
  既存の診断機能とデモURL機能を繋ぐだけ。問題提起と解決体験が1通で完結。
- **C. 送信時刻を「電話が繋がらない時間」に合わせる**［工数:小］
  電話のみの医院に昼休み(12:30)・診療終了直後に送信。「今この瞬間も繋がらなかった
  患者様がいるかも」と書く。スケジューラーの送信時刻制御で実現。
- **D. スマホ表示のスクショ添付**［工数:中・注意］
  視覚的証拠は強力だが、画像添付はスパム判定率を上げる＋ヘッドレスブラウザが必要。
  開封率が安定してから検討。

### 保留（リスクあり）
- **E. 検索順位への言及**：Google検索結果のスクレイピングはToS違反リスク。
  やるなら Places API の取得順位を代理指標にする等の工夫が必要。
  decisions.md の RISK と合わせて要判断。

### 詰めるべき判断ロジック（TODO）
- テンプレA/B/C/D の選択基準は select_template_key() にあるが、上記アイデアA〜Cを
  どの条件で差し込むか未定義。
- 統計の出典をどこまで明記するか（信頼性 vs 文章の重さ）。
- 1通あたりの「事実への言及」は1つに絞る方針だが、複数問題がある場合の優先順位。
