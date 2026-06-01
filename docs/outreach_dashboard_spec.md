# Weldex 営業自動化ダッシュボード 仕様書

**URL**: https://weldex-production.up.railway.app  
**最終更新**: 2026-06-01

---

## 1. インフラ構成

| 項目 | 内容 |
|------|------|
| ホスティング | Railway（プロジェクト: happy-abundance / 環境: production） |
| サービス名 | `weldex` |
| ビルダー | Nixpacks（Dockerfile 禁止） |
| 起動コマンド | `uvicorn dashboard.app:app --host 0.0.0.0 --port $PORT` |
| 設定ファイル | `outreach/railway.toml` |
| DB | SQLite（`/data/outreach.db`） |
| ストレージ | Railway Volume（`weldex-volume`）を `/data` にマウント済み |
| Gitルート | `outreach/`（Add Root Directory に設定済み） |
| 自動デプロイ | GitHub `main` ブランチへの push で自動ビルド |

### Railway 環境変数（Variables）

| 変数名 | 内容 |
|--------|------|
| `GOOGLE_PLACES_API_KEY` | Google Places API キー（収集に使用） |
| `DB_PATH` | `/data/outreach.db`（Volumeのパスと一致させること） |
| `DASHBOARD_PASSWORD` | Basic認証のパスワード |

> **注意**: `DB_PATH` を `/data/outreach.db` に設定しないと、再デプロイのたびにDBが消える。

---

## 2. 認証

- **方式**: HTTP Basic認証
- **ユーザー名**: `weldex`（固定）
- **パスワード**: Railway Variables の `DASHBOARD_PASSWORD` の値
- `DASHBOARD_PASSWORD` が未設定の場合は認証スキップ（ローカル開発用）

---

## 3. コスト

| サービス | 料金 |
|----------|------|
| Railway（Hobby プラン） | 約 $5 / 月 |
| Google Places API | 月400件以内なら無料枠内（月$200クレジット）。100件/日 × 20日 = 2,000件 ≒ 約$6/月 |
| サイト診断（HTTP直接アクセス） | 完全無料 |

---

## 4. ダッシュボード画面構成

### タブ一覧

| タブ | 機能 |
|------|------|
| ダッシュボード | 収集・診断の実行パネル＋統計カード |
| ターゲットリスト | 収集した企業一覧（検索・フィルター・サイトプレビュー） |
| 送信プレビュー | 送信予定メールのプレビュー（Phase2 用） |
| ログ | 収集・診断・送信の実行ログ |

---

## 5. 収集機能

### 画面操作（ダッシュボードタブ）

**業種選択（10業種・チェックボックス）**

| 業種 | 検索キーワード（Google Places に送るクエリ） |
|------|----------------------------------------------|
| 歯科医院 | 歯科医院 / 歯科クリニック / 歯医者 / デンタルクリニック |
| クリニック | 内科クリニック / 内科医院 / 診療所 / クリニック |
| 美容外科 | 美容外科 / 美容クリニック / 美容皮膚科 |
| 整骨院 | 整骨院 / 接骨院 / 整体院 |
| 司法書士 | 司法書士事務所 / 司法書士 |
| 税理士 | 税理士事務所 / 税理士 |
| 行政書士 | 行政書士事務所 / 行政書士 |
| 建設会社 | 建設会社 / 建設業 / 工務店 / 土木会社 |
| リフォーム | リフォーム会社 / リフォーム店 / 住宅リフォーム |
| 美容室 | 美容室 / 美容院 / ヘアサロン |

**エリア選択（47都道府県・343市区・左右分割UI）**

- 左パネル：都道府県リスト（クリックで右パネルを切り替え）
- 右パネル：選択した都道府県の市区町村チェックボックス
- 「全選択 / 全解除」ボタンあり
- 都道府県行に選択中の市区数バッジを表示

**ボタン**

| ボタン | 動作 |
|--------|------|
| ▶ 収集して診断する | 選択した業種×市区を全組み合わせ収集 → 完了後に自動で診断まで実行 |
| 診断のみ | 収集済み未診断ターゲットの診断だけ実行 |

### 収集ロジック

- **1日の収集上限**: 100件（`DEFAULT_LIMIT = 100`）
- 上限に達したボタンはロックされ「本日の上限に達しました（翌日リセット）」と表示
- 翌日0時（`date('now', 'localtime')` の日付変更）に自動リセット
- 重複排除: `place_id`（Google固有ID）で同じ企業を2回入れない
- 1リクエストあたり最大20件を返す Google Places API 仕様に従いループ収集

### 診断ロジック（site_checker）

| ステータス | 意味 | 営業チャンス |
|------------|------|------------|
| `none` | サイトなし・404 | ★★★ サイト制作提案 |
| `old` | 5年以上更新なし・SSL未対応 | ★★★ リニューアル提案 |
| `no_mobile` | スマホ非対応 | ★★ スマホ対応提案 |
| `phone_only` | 電話予約のみ | ★★ LINE予約提案 |
| `ok` | 問題なし | — スルー |
| `unchecked` | 未診断 | — |
| `error` | 診断エラー | — |

---

## 6. ターゲットリストタブ

### テーブル列

| 列 | 内容 |
|----|------|
| 店舗名 / 業種・エリア | 店舗名（太字）＋ 業種タグ・エリアタグ（小さいバッジ） |
| ステータス | 診断結果を日本語バッジで表示 |
| 電話 | 電話番号 |
| メール / サイト | メールリンク＋「サイトを開く」リンク |

### フィルター

- ステータス（サイトなし / 古いサイト / スマホ非対応 / 電話のみ / 問題なし / 未診断 / エラー）
- 業種（10業種）
- キーワード（店舗名・住所）

### 右パネル（サイトプレビュー）

- 行をクリックすると右パネルにサイトをiframe表示
- プロキシ経由（`/proxy`）で X-Frame-Options を除去してiframe表示
- 「新しいタブ」ボタンで直接開く
- iframeブロック時は「新しいタブで開く」に自動切替

---

## 7. DB スキーマ（主要テーブル）

### `targets` テーブル

| カラム | 型 | 内容 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| place_id | TEXT UNIQUE | Google固有ID（重複排除キー） |
| name | TEXT | 店舗名 |
| address | TEXT | 住所 |
| phone | TEXT | 電話番号 |
| website | TEXT | サイトURL |
| industry | TEXT | 業種 |
| area | TEXT | エリア（都道府県+市区町村） |
| site_status | TEXT | 診断ステータス（デフォルト: unchecked） |
| email | TEXT | メールアドレス（診断時に抽出） |
| created_at | TEXT | 収集日時 |
| send_status | TEXT | 送信状態（pending / sent / failed / unsubscribed） |
| has_line | INTEGER | LINE連携あり(1)/なし(0)/未調査(NULL) |
| has_ssl | INTEGER | SSL対応(1)/非対応(0)/未調査(NULL) |
| has_contact_form | INTEGER | フォームあり(1)/なし(0)/未調査(NULL) |

---

## 8. APIエンドポイント一覧

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/` | ✓ | ダッシュボードHTML |
| GET | `/api/stats` | ✓ | 収集・診断・送信の統計 |
| GET | `/api/targets` | ✓ | ターゲット一覧（ページネーション・フィルター） |
| GET | `/api/logs` | ✓ | 実行ログ一覧 |
| GET | `/api/logs/stream` | ✓ | SSEリアルタイムログ配信 |
| GET | `/api/options` | ✓ | 業種・都道府県別エリアリスト |
| GET | `/api/daily-quota` | ✓ | 本日の収集件数・残り枠 |
| POST | `/api/collect` | ✓ | 収集実行（industries[], areas[]） |
| POST | `/api/diagnose` | ✓ | 診断実行（limit） |
| GET | `/api/preview-queue` | ✓ | 送信候補メールプレビュー |
| GET | `/proxy` | ✓ | 外部サイトiframe用プロキシ |
| GET | `/unsubscribe` | なし | 配信停止（メール文面リンク用） |

---

## 9. ディレクトリ構成（outreach/）

```
outreach/
├── railway.toml                  ← Railwayビルド・起動設定
├── requirements.txt              ← Python依存パッケージ
├── config.py                     ← 環境変数・定数管理
├── main.py                       ← CLIエントリーポイント（ローカル用）
├── scheduler.py                  ← メール自動送信スケジューラー（Phase2）
├── db/
│   └── database.py               ← SQLite CRUD・テーブル定義
├── collectors/
│   ├── area_config.py            ← 47都道府県・343市区・業種キーワード定義
│   └── google_places.py          ← Google Places API収集ロジック
├── analyzers/
│   ├── site_checker.py           ← サイト診断ロジック
│   └── email_extractor.py        ← メールアドレス抽出
├── mailers/
│   ├── sender.py                 ← SendGrid送信ロジック（Phase2）
│   └── templates.py              ← メールテンプレートA/B/C（Phase2）
├── replies/
│   └── checker.py                ← Gmail返信検知（Phase2）
└── dashboard/
    ├── app.py                    ← FastAPI アプリ本体
    └── templates/
        └── index.html            ← ダッシュボードHTML（CSS・JS内包）
```

---

## 10. ローカル開発手順

```bash
cd ~/Desktop/weldex/outreach

# DB初期化（初回のみ）
python3 -c "from db.database import init_db; init_db(); print('DB OK')"

# ダッシュボード起動
uvicorn dashboard.app:app --reload --port 8000
# → http://localhost:8000
# ※ローカルはDASHBOARD_PASSWORD未設定なので認証スキップ

# CLIで収集（ローカルDB）
python3 main.py collect --industry 歯科医院 --area 千葉市中央区 --limit 20

# CLIで診断
python3 main.py diagnose

# バッチ収集（全業種×全エリア）
python3 main.py batch-collect --limit-per-industry 5
```

> **注意**: ローカルのDBとRailwayのDBは別物。実務はRailwayのダッシュボードを使うこと。

---

## 11. デプロイ手順

```bash
# コードを変更後
git add .
git commit -m "変更内容"
git push origin main
# → Railwayが自動でビルド＆デプロイ（約2分）
```

---

## 12. 運用フロー（推奨）

```
月曜: ダッシュボードで業種・都道府県を選択 → 「収集して診断する」
      → 完了後にターゲットリストで none / old のみフィルター

火〜金: ターゲットリストを確認しながら電話営業
        → 反応あった企業はメモ

※メール送信は Phase2（未実装）で追加予定
```

---

## 13. 既知の制限・注意事項

- **メール送信は未実装**（Phase 2）。送信プレビュータブは確認専用
- **1日100件の収集上限**（Google API無料枠保護のため）。翌日自動リセット
- サイト診断はHTTPアクセスのため、相手サーバーの応答速度に依存（タイムアウト8秒）
- robots.txtを無視したスクレイピングは禁止（site_checker は HEAD/GETのみ）
- 個人情報（電話・メール）はログに出力しない
- **DB_PATHとVolumeのマウントパスを必ず一致させること**（ずれるとデータ消失）
- **スマホではサイトプレビュー右パネルを非表示**（768px以下）

---

## 14. トラブルシューティング

### 診断が途中で止まる・「undefined」エラーが出る

**原因**: Railway のリクエストタイムアウト（約30秒）を超えた。  
サイト診断は1件あたり最大8秒かかるため、一度に多く処理すると接続が切れる。

**対策済み**: 診断は20件ずつバッチ実行し、未診断がなくなるまで自動ループする。  
画面に `診断中... (20件完了)` のように進捗が表示される。

---

### データが全部0になった（収集後にリセットされた）

**原因**: Railway Volume のアタッチ・再デプロイのタイミングで旧コンテナのデータが消えた。

**防止策**: Volume（`weldex-volume`）が weldex サービスの `/data` にマウントされていることを確認してから収集する。

**確認方法**:  
Railway キャンバスで weldex サービスボックスの下に `weldex-volume` アイコンが表示されていればOK。

> ⚠️ **一度消えたデータは復元不可。再収集が必要。**

---

### Volumeをアタッチするとデータが消える

**原因**: Volume アタッチ操作は Railway の強制再デプロイを引き起こす。  
旧コンテナのメモリ・一時ファイルは引き継がれない。

**手順（正しい順番）**:  
1. Volume を先に作成してアタッチする  
2. `DB_PATH=/data/outreach.db` を Variables に設定する  
3. デプロイが完了してから収集を開始する  

Volume 設定前に収集したデータは消える。

---

### Railway への push 後にダッシュボードが動かない

1. Railway キャンバスで weldex サービスの状態を確認（Building / Deploying / Online）
2. Deployments タブでビルドログを確認
3. `uvicorn dashboard.app:app --host 0.0.0.0 --port $PORT` が起動しているか確認
4. Variables に `GOOGLE_PLACES_API_KEY` / `DB_PATH` / `DASHBOARD_PASSWORD` が設定されているか確認

---

### 「本日の上限に達しました」が翌日も出る

**原因**: サーバー時刻（UTC）とローカル時刻のズレ。  
クエリは `date('now', 'localtime')` を使用しているため通常は日本時間で動作するが、Railway サーバーの TZ 設定によっては0時リセットが数時間ズレることがある。

**対処**: 翌朝9時以降に試す。それでも変わらない場合は Railway Variables に `TZ=Asia/Tokyo` を追加する。
