# docs/decisions.md — 設計決定・懸念事項ログ

> 「なぜそう決めたか」を残す。CLAUDE.mdには書かない。
> 解決済みはステータスを「完了」にして消さない（経緯が重要）。

---

## 凡例

| 種別 | 意味 |
|---|---|
| ADR | Architecture Decision Record（設計判断） |
| BUG | コード上の不具合 |
| TODO | 実装前に決める必要がある未解決事項 |
| RISK | リスク・潜在的な問題 |

---

## ログ

| ID | 種別 | 内容 | ステータス | 日付 |
|---|---|---|---|---|
| 001 | ADR | LINE/WEB予約はDBを共有する（`reservation.db`）。疎結合のためサービスは分離 | 決定済み | 2026-05-09 |
| 002 | BUG | `routers/admin.py`: `hasattr(body, "menu_name")` が常にFalseでmenu_nameが空になる | 修正済み | 2026-05-09 |
| 003 | BUG | `dashboard/app.py`: 非同期プロキシで `get_event_loop()` (Python 3.10+ deprecate) を使用 | 修正済み | 2026-05-09 |
| 004 | ADR | `Optional[str]` → `str \| None` に統一（Python 3.10+ モダン記法） | 適用済み | 2026-05-09 |
| 005 | TODO | LINE予約のリマインドはLINE Push Message経由。月1000通無料プランで件数が足りるか確認が必要 | 未確認 | 2026-05-09 |
| 006 | TODO | LINEリッチメニューのデザイン素材をクライアントから調達 or Weldex作成か決める | 未決定 | 2026-05-09 |
| 007 | RISK | LINE無料プランはPush Message上限あり。予約件数が多いクライアントは有料プラン必須 | 要確認 | 2026-05-09 |
| 008 | TODO | 管理画面のパスワード変更フォームが仕様に記載されているが未実装 | 未着手 | 2026-05-09 |
| 009 | TODO | 管理画面のリマインド手動送信UIが仕様に記載されているが未実装 | 未着手 | 2026-05-09 |
| 010 | RISK | reservationのメニュー追加/編集が管理画面UIから行えない（DBを直接操作するしかない） | 未着手 | 2026-05-09 |
| 011 | ADR | Phase4のLINE botは独立FastAPIサービス（port 8002）として起動。DBパスのみ共有 | 決定済み | 2026-05-09 |
| 012 | RISK | 営業自動化の1日50件上限は scheduler.py で管理しているが、複数プロセス起動時に超える可能性 | 低リスク（現状シングルプロセス） | 2026-05-09 |
| 013 | ADR | line_bot/config.py は importlib.util で reservation/config.py を絶対パス読み込みする（sys.path 自己参照バグを回避） | 実装済み | 2026-05-09 |
| 014 | RISK | LINE Push Message 無料プランは月1000通上限。予約数が多い場合は有料移行または送信先絞り込みが必要 | 要確認（クライアント件数次第） | 2026-05-09 |
| 015 | TODO | リッチメニューのデザイン・画像素材。LINE Official Account Manager で手動設定が必要 | 未着手 | 2026-05-09 |
| 016 | TODO | リッチメニューレイアウト仕様（下記参照） | 未着手 | 2026-05-09 |
| 017 | BUG | メニュー選択時にクイックリプライの送信テキストがID("1")になっていた → メニュー名に修正済み | 修正済み | 2026-05-09 |
| 018 | TODO | 管理者通知：LINE予約作成・キャンセル時に管理者へメール通知（下記参照） | 未着手 | 2026-05-10 |
| 019 | TODO | 動的リッチメニュー切り替え：ユーザーの予約状態に応じてリッチメニューを切り替える（下記参照） | 設計検討中 | 2026-05-10 |
| 020 | TODO | WEB予約時のLINE通知：WEBフォームから予約したユーザーへLINEで確認通知を送る（下記参照） | 仕様詰め中 | 2026-05-10 |
| 021 | TODO | 名前重複検知：LINE/WEB両方から予約した同一人物を検知して管理画面で警告表示（将来機能・MVP後） | 未着手 | 2026-05-10 |

---

## 018 管理者通知設計（TODO）

### トリガー
| イベント | 通知内容 |
|---|---|
| LINE予約作成 | 「新規予約（LINE）：〇〇様 / 5/10 10:30 / 初診」 |
| LINE予約キャンセル | 「予約キャンセル（LINE）：〇〇様 / 5/10 10:30 / 初診」 |

### 実装方針（仕様確定が必要な点）
- 通知先：`.env` の `ADMIN_EMAIL`（Phase3の `send_admin_notification()` を流用）
- 通知チャネル：メールのみ or LINE通知も欲しいか？
- 通知タイミング：予約確定直後 / キャンセル直後（同期送信 or 非同期）
- 失敗時の扱い：通知失敗でも予約は成立させる（try-except で握りつぶす）

### 実装箇所
```python
# line_bot/handlers/reservation.py の _confirm() 内
create_line_reservation(...)
send_admin_notification(...)  # reservation/services/mail.py を importlib で呼ぶ

# _cancel_select() の do_cancel 処理内
cancel_reservation(reservation_id)
send_admin_cancel_notification(...)
```

### 詰めること（次 claude.ai セッションで）
- [ ] メールのみで十分か、LINE通知（管理者のLINEへPush）も必要か
- [ ] 通知メール本文フォーマット
- [ ] Phase3の mail.py をそのまま共有するか、line_bot 内に複製するか

---

## 019 動的リッチメニュー設計（設計検討中）

### 概要
ユーザーの予約状態に応じてリッチメニューの表示を切り替える。
LINE Messaging API の `linkRichMenuIdToUser` を使用。

### 状態パターン（案）

```
状態A：予約なし
┌────────────┬────────────┐
│  📅 予約する │  ❓ 使い方  │
├────────────┴────────────┤
│      📞 お問い合わせ     │
└─────────────────────────┘

状態B：予約あり
┌─────────────────────────┐
│  📋 予約確認             │
│  5/15(金) 10:30 初診     │  ← 静的画像なのでテキストは固定
├─────────────────────────┤
│  ❌ キャンセル           │
└─────────────────────────┘
```

※ リッチメニューは静的画像のため、予約日時を直接表示はできない。
  「予約あり」状態の画像は汎用テキスト（「ご予約中」等）にする。

### 切り替えタイミング
| イベント | 切り替え先 |
|---|---|
| 予約完了（`_confirm` 内） | 状態B（予約あり）メニュー |
| キャンセル完了（`_cancel_select` 内） | 状態A（予約なし）メニュー |
| 友だち追加（`FollowEvent`） | 状態A（予約なし）メニュー |

### 実装方法
```python
# line_bot/handlers/richmenu.py（新規作成）
from linebot.v3.messaging import MessagingApi, ApiClient, Configuration

RICHMENU_NO_RESERVATION = "richmenu-xxxx"   # LINE に登録済みメニューID
RICHMENU_HAS_RESERVATION = "richmenu-yyyy"

def switch_richmenu(line_user_id: str, has_reservation: bool) -> None:
    menu_id = RICHMENU_HAS_RESERVATION if has_reservation else RICHMENU_NO_RESERVATION
    config = Configuration(access_token=LINE_CHANNEL_ACCESS_TOKEN)
    with ApiClient(config) as api_client:
        MessagingApi(api_client).link_rich_menu_id_to_user(line_user_id, menu_id)
```

### 詰めること
- [ ] 状態B の画像テキストをどう表現するか（「ご予約中」固定 or もっと情報を出すか）
- [ ] 複数予約が入った場合の状態管理（件数？最直近？）
- [ ] リッチメニュー画像のデザイン素材（クライアント提供 or Weldex作成）
- [ ] v1（固定メニュー）と v2（動的）のどちらを先に納品するか → **v1に決定**
- [ ] `switch_richmenu` の失敗時の扱い（通知せず握りつぶしてOKか）

---

## 020 WEB予約時のLINE通知（仕様詰め中）

### 問題の核心
WEB予約フォームから予約したユーザーが LINE 友だちかどうかを判定できない。
`line_user_id` はLINEフロー経由でのみ取得できる。

### 紐づけ方法の選択肢

**案A：電話番号で紐づけ（シンプル）**
```
WEB予約時に電話番号を必須入力
LINE予約時にも電話番号を入力してもらう
→ 同一電話番号なら同一人物と判定
→ DBでマッチして line_user_id を特定
→ LINE Push で通知
```
課題：LINE予約フローに電話番号入力ステップを追加する必要がある

**案B：QRコード経由のLINE連携（LINE Login）**
```
WEB予約完了後に「LINEで通知を受け取る」ボタン表示
→ LINE Login で認証 → line_user_id 取得
→ その予約に line_user_id を紐づけ
```
課題：LINE Login の実装が複雑（OAuth フロー）・LINE Login プランが必要

**案C：実装しない（MVP）**
```
WEB予約 → 確認メール送信のみ（Phase3で実装済み）
LINE予約 → LINE Push リマインド（実装済み）
WEB/LINEは独立したチャネルとして運用
→ 顧客には「LINE予約するとリマインドが届く」と案内
```

### 詰めること
- [ ] 電話番号入力をLINEフローに追加するか（案A）
- [ ] LINE Loginまで実装するか（案B）
- [ ] MVP は案Cで、要望が出たら案Aに移行でいいか
- [ ] WEB予約時の確認メールは現状で十分か

---

## 021 名前重複検知（将来機能・MVP後）

### 概要
LINE予約とWEB予約で同じ名前・電話番号の顧客が別レコードとして存在する場合、
管理画面で「同一人物の可能性あり」と警告表示する。

### 検知ロジック案
```python
# 予約作成時に顧客テーブルと照合
def find_duplicate_customer(name: str, phone: str) -> list[dict]:
    """名前が一致 or 電話番号が一致する顧客を返す"""
    normalized_phone = phone.replace('-', '').replace(' ', '')
    # name 完全一致 OR phone 正規化後一致
    ...
```

### 管理画面での表示案
```
予約一覧の行に「⚠ 重複の可能性」バッジを表示
クリック → 重複候補の顧客一覧をモーダルで表示
→ 管理者が手動で「同一人物」として顧客IDを統合
```

### MVP後の実装優先度
- 予約件数が増えてきたら着手
- 電話番号が必須入力になってから本格運用（現状は任意）
- 氏名のみでの重複検知は誤検知リスクあり（同姓同名）

---

## 016 リッチメニュー設計仕様（TODO）

### レイアウト
```
┌─────────────────────────────────┐
│  📅 予約する  │  📋 予約確認   │
│               │                 │
├───────────────┴─────────────────┤
│         ❌ キャンセル           │
└─────────────────────────────────┘
```
- 上段：2列（予約する ／ 予約確認）
- 下段：1列全幅（キャンセル）
- サイズ：2500×1686px（LINE推奨・大メニュー）

### 各ボタン設定
| ボタン | テキスト送信 | 説明 |
|---|---|---|
| 予約する | `予約する` | 日付選択フローへ |
| 予約確認 | `予約確認` | 予約一覧表示 |
| キャンセル | `キャンセル` | キャンセルフローへ |

### 実装方法（LINE Official Account Manager）
1. LINE Official Account Manager → リッチメニュー → 「作成」
2. テンプレート：2コラム上段 + 1コラム下段
3. 各エリアにアクション「テキスト送信」を設定
4. 画像をアップロード（2500×1686px PNG/JPEG）
5. 表示期間：設定しない（常時表示）

### 画像素材
- Weldexで作成 or クライアント提供（ブランドカラーに合わせる）
- ブランドカラー例：ネイビー系 or クライアントのCIカラー
- アイコン：カレンダー（予約）・クリップボード（確認）・✕（キャンセル）

### APIでの実装（オプション）
```bash
# リッチメニュー作成API（将来的に自動化する場合）
POST https://api.line.me/v2/bot/richmenu
Authorization: Bearer {ACCESS_TOKEN}
# → LINE Messaging API ドキュメント参照
```


---

<!-- ====== 以下 2026-05-10 claude.ai セッション追記分 ====== -->

## #005 LINE Push月上限 [決定済み 2026-05-10]

**現状**
- 無料プランは月200通

**消費試算（月30予約の小規模クリニック）**
- 確認メッセージ 30通 + 前日リマインド 30通 + ウェルカム 10通 = 約70通/月
- 月30予約以下：余裕 / 月100予約超：有料プラン推奨

**対策**
- 160通（80%）到達時点でWeldex運用ボット経由でRyomaにアラート
- 200通超過時：リマインドをSendGridメール送信に自動フォールバック
  - LINE専用患者（メールアドレスなし）はフォールバック不可のためアラートに明記

**契約・料金**
- 月100予約超のクライアントには契約前にLINE有料プラン（ライト¥5,000/月・5,000通）を説明
- 有料プランへの切り替えはクライアント負担

**追加する環境変数**
```
LINE_MONTHLY_ALERT_THRESHOLD=160（デフォルト）
```

---

## #008 管理画面パスワード変更 [決定済み 2026-05-10]

- 「設定ページ」を新設し、通知先メール変更と同一画面に統合
- パスワード変更時の現パスワード確認は不要（ログイン済みを信頼）
- ログインは共有パスワード方式（スタッフ2〜3人で共有）
- settingsテーブルを新設（key-value形式）
- .envのADMIN_EMAILは初回起動時の初期値としてのみ使用

**追加するDBテーブル**
```sql
settings (
  key   TEXT PRIMARY KEY,
  value TEXT
)
-- 初期データ
INSERT INTO settings VALUES ('admin_email', 'doctor@example.jp');
INSERT INTO settings VALUES ('admin_password', 'ハッシュ化したパスワード');
```

---

## #009 リマインド手動送信UI [決定済み 2026-05-10]

- 予約一覧の各行に「リマインド送信」ボタンを追加
- 送信前に確認ダイアログを表示
  「〇〇さんにリマインドを送りますか？」→ OK / キャンセル
- クライアントへの説明：「基本は自動送信。何らかの原因で届かない時に使用」

**remind_sentフラグ拡張**
```
0 = 未送信
1 = 送信済み
2 = 送信失敗（新規追加）
```

**失敗アラート（2段階）**
- ① 失敗した瞬間：Weldex運用LINEに即時通知（患者名・日時・原因）
- ② 失敗がある日のみ朝8:00にサマリーをWeldex運用LINEに送信
  - 失敗ゼロの日はサマリー送信なし

---

## #010 メニュー管理UI [決定済み 2026-05-10]

- 管理画面でメニューの追加・編集・非表示・並び順変更が可能
- 「削除」は非表示フラグ（is_active=0）で対応（過去予約データを保護）
- 料金フィールドは.envで表示/非表示を切り替え
  - SHOW_MENU_PRICE=false（医療・歯科デフォルト）
  - SHOW_MENU_PRICE=true（飲食・美容・士業）
- 料金未入力の場合は「要相談」と表示

**DBスキーマ変更（menusテーブルに追加）**
```sql
price      INTEGER   -- NULL=「要相談」
is_active  INTEGER DEFAULT 1  -- 0=非表示
sort_order INTEGER DEFAULT 0
```

---

## #018 管理者通知 [決定済み 2026-05-10]

**対象イベント**
- WEB予約が入った
- LINE予約が入った
- キャンセルされた（WEB/LINE両方）

**仕様**
- 通知先：ADMIN_EMAIL（クライアントの管理者）にSendGridでメール送信
- 予約はDB保存を最優先。SendGrid失敗でも予約処理は止めない
- SendGrid失敗時：Weldex運用LINEボットでRyomaにプッシュアラート
  「⚠️ SendGrid失敗 / [クライアント名] / [患者名] [日時] / 管理者通知未送信」

**通知チャネル設計**
- LINEあり（紐づけ済み）→ LINE Push
- LINEなし → Email
- EmailもLINEもなし → 管理画面に警告表示（SMSは現時点で不採用）

**Weldex運用LINEボット（新規作成・専用）**
- 全クライアントのアラートをRyoma宛に送信する専用チャネル
- クライアント用ボットとは完全分離
- LINE Developersで新チャネル作成が必要（Ryoma手動作業）

**追加する環境変数**
```
ADMIN_LINE_USER_ID=（RyomaのLINE User ID）
WELDEX_LINE_CHANNEL_ACCESS_TOKEN=（Weldex運用ボットのトークン）
```

**RyomaのLINE User ID取得方法**
Weldex運用ボットに自分のLINEアカウントからメッセージを送る
→ webhookログに line_user_id が出力される → コピーして.envに設定

---

## #019 動的リッチメニュー [保留]

v1完成後に検討。

---

## #020 WEB予約時のLINE通知 [決定済み 2026-05-10]

**解決策：予約完了メール＋LINE友だち追加URLで自然に誘導**

```
WEB予約完了
  ↓
確認メール送信
  + 「LINE予約ならメアド不要で便利！」
  + 友だち追加URL（https://lin.ee/xxxxxxx）
  ↓
患者が自分の意思でLINE友だち追加
  ↓
ウェルカムメッセージ
  「予約番号を入力してください（例：WB-0012）」
  ↓
LINE User IDをreservationsテーブルに紐づけ保存
  ↓
以降のリマインドはLINEで送信
```

- QRコードではなくURLリンクで誘導
- 強制せず、患者が希望した場合のみ
- reservationsテーブルのline_user_idカラムは既存のためスキーマ変更不要

---

## #021 名前重複検知 [保留]

MVP後に検討。

---

## 統計ダッシュボード [決定済み 2026-05-10]

管理画面トップに表示する4項目：
- 今月の予約数
- 今月のキャンセル率（例：6%（2人））
- 本日の予約（リスト表示）
- チャネル比率（LINE % / WEB %）

---

## LINE疎通テスト [決定済み 2026-05-10]

- 設定ページ下部に目立たない形で設置
- ボタン押下でWeldex運用LINEにテストメッセージ送信
- 主にオンボーディング時にRyomaが使用
- 将来的に削除予定
- 実装時は `# TODO: 本番安定後に削除` のコメントを明記

---

## 通知先メール変更 [決定済み 2026-05-10]

- 設定ページから管理者通知メールを変更可能
- settingsテーブルのadmin_emailキーを更新
- .envのADMIN_EMAILは初期値としてのみ使用（起動時にDBへ移行）
- 変更時のパスワード確認不要

---

## WEB予約システム設計 [決定済み 2026-05-10]

### 患者側フロー（ウィザード形式・6ステップ）
```
STEP1：メニュー選択
STEP2：カレンダーで日付選択（空き日のみ選択可）
STEP3：時間選択（空き枠のみ表示）
STEP4：情報入力
STEP5：確認画面
STEP6：完了（確認メール送信 + LINE誘導リンク）
```

### 入力項目
- 必須：名前・電話番号
- 任意：メールアドレス
  - 未入力時「確認メールが届きません」と警告表示
  - LINEへの誘導文言を併記「LINE予約ならメアド不要で便利！」+ 友だち追加URL
- 追加項目：管理画面で自由設定（JSON形式保存）
  - 例）症状・来院経緯・人数・アレルギーなど

### LINE誘導の配置
- 予約フォームSTEP1上部
- 情報入力画面（STEP4）のメアド欄付近
- 予約完了画面（STEP6）

### クリニック側スケジュール設定
- 曜日ごとに時間帯を複数設定（昼休みは時間帯の区切りで表現）
  - 例）09:00〜12:00 / 14:00〜18:00
- 枠の間隔：固定（デフォルト30分）
- 予約が入るとメニュー所要時間分の枠を自動ブロック
  - 例）初診60分が9:00→9:00・9:30をブロック、次は10:00〜
- 同一時間帯の予約：先着順（先にDBに保存された方が確定）
- 1枠あたりの最大予約数：クライアントごとに設定
  - 例）歯科：1 / 飲食：テーブル数
- 休業日：個別設定可能（実装済み）
- 営業時間変更：管理画面から随時変更可能

### 追加するDB
```sql
-- スケジュール設定（新設）
schedules (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week     INTEGER,  -- 0=日〜6=土
  start_time      TEXT,     -- 例：09:00
  end_time        TEXT,     -- 例：12:00
  is_active       INTEGER DEFAULT 1,
  max_bookings_per_slot INTEGER DEFAULT 1
)

-- カスタムフィールド定義（新設）
custom_field_definitions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT,
  field_type  TEXT,  -- text / textarea / select
  is_required INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0
)

-- reservationsテーブルに追加
custom_fields TEXT  -- JSON形式
```

---

## Weldex.jpリニューアル（Phase 6）[決定済み 2026-05-10]

### 技術スタック
```
Next.js 15（App Router）
TypeScript
Tailwind CSS
Cloudflare Pages（next-on-pages）
デザイン資産引き継ぎ：ネイビー×ゴールド・Cormorant Garamond
```

### ページ構成
```
/                          ホーム
/services/                 サービス概要
/services/[slug]/          業種別LP（テンプレート自動生成）
/works/                    インタラクティブデモ集
/pricing/                  料金
/tools/diagnosis/          無料診断ツール
/contact/                  お問い合わせ
/privacy/                  プライバシーポリシー
/tokusho/                  特商法
```

### 業種別LP設計
```typescript
// data/industries.ts でデータ管理
// slugを追加するだけでページが自動生成される
// 初期業種：dental / legal / construction / beauty
```

### Worksページ
- WEB予約システム（booking_demo.htmlへリンク）
- LINE予約デモ（デモ専用チャネル・他チャネルと完全分離）
- 歯科デモサイト・美容クリニックデモサイト
- デモであることを明示して掲載

### 無料診断ツール（/tools/diagnosis/）
- PageSpeed Insights API使用（無料・APIキー不要）
- UI：スキャン系アニメーション（進捗バー→円形スコアゲージ→項目別結果）
- スコア項目：表示速度・スマホ対応・SEO・セキュリティ
- CTA：「無料相談する」→ /contact/ へ遷移

### Lighthouseターゲット
```
Performance    95以上
Accessibility  95以上
Best Practices 100
SEO            100
```

---

## オンボーディング設計 [決定済み 2026-05-10]

### 全体の流れ
```
契約締結
  ↓ STEP1：情報収集（クライアントから・ヒアリングシート送付）
  ↓ STEP2：環境構築（Ryoma作業・約30分）
  ↓ STEP3：接続確認（Ryoma作業・約15分）
  ↓ STEP4：クライアントに引き渡し（約15分）
  ↓ STEP5：稼働後サポート（1週間）
```

### LINEアカウント
- Weldexが作成代行
- 管理者権限はクライアントのメールアドレスに付与
- Weldexは保守目的で管理者権限を共有
- 契約終了時：Weldexが管理者権限から退出 → クライアント単独所有
- 契約書に上記を明記

### 月額保守費
- 推奨：¥8,000〜10,000/月
- LINE有料プラン発生時は実費別途

### 通知パターン（全チャネル実装・LINEに自然誘導）
```
LINE紐づけ済み → LINE Push（優先）
LINE未紐づけ  → Email
Email未登録   → 管理画面に警告表示
```
# decisions.md 追記分（2026-05-10）

---

## インフラ・アーキテクチャ [決定済み 2026-05-10]

### LINE bot × 予約システム統合
- reservation/ と line_bot/ を1つのFastAPIサービスに統合
- /webhook/line エンドポイントをreservation/に取り込む
- 理由：管理コスト最小・障害対応が明快・Ryoma1人体制に最適

### DB移行：SQLite → PostgreSQL
- Railway Managed PostgreSQLに移行
- DATABASE_URL=（RailwayのPostgres接続文字列）を.envに設定
- Railway Volume マウント：/app/data（DB_PATH=/app/data/reservation.db は廃止）
- コード変更：sqlite3 → psycopg2に置き換え
- タイミング：クライアント導入前に完了させる

### 開発環境 vs 本番環境の分離
```
.env.local（開発）
  DATABASE_URL=postgresql://localhost/weldex_dev
  SENDGRID_SANDBOX_MODE=true
  LINE_CHANNEL_ACCESS_TOKEN=（開発用テストチャネル）

.env（本番・Railway環境変数）
  DATABASE_URL=（Railway PostgreSQL URL）
  SENDGRID_SANDBOX_MODE=false
  LINE_CHANNEL_ACCESS_TOKEN=（本番クライアント用）
```
- LINEは開発用チャネルを別途作成（本番クライアントに届かない）
- SendGridは開発時sandbox_mode=Trueで実際には送信しない
- Google Places APIキーは共通でOK

### エラー監視スタック（全て無料・最初から導入）
| 層 | ツール | 役割 |
|---|---|---|
| コード層 | Sentry（無料枠） | 例外・エラー詳細ログ |
| アプリ層 | Weldex運用LINEボット | ビジネスロジックアラート |
| 外形監視 | UptimeRobot（無料） | URL死活監視 |
| インフラ層 | Railwayダッシュボード | CPU・メモリ監視 |

実装：main.pyにsentry_sdk.init()を3行追加

---

## セキュリティ設計 [決定済み 2026-05-10]

### レートリミット（SlowAPIで実装）
- POST /booking（予約送信）：1IP・1分間に5回まで
- GET /slots（空き枠取得）：1IP・1分間に30回まで
- POST /admin/login（管理画面ログイン）：1IP・1分間に5回まで

### 管理画面ログイン試行制限
- 5回失敗 → 10分間ソフトロック（自動解除）
- ハードロックではないのでRyomaへの連絡不要
- パスワード変更フォーム自体はロックなし
- settingsテーブルに login_failed_count / login_locked_until を追加

### 個人情報保持期間（個人情報保護法対応）
- 完了予約：DATA_RETENTION_COMPLETED_DAYS=365（デフォルト1年）
- キャンセル予約：DATA_RETENTION_CANCELLED_DAYS=90（デフォルト3ヶ月）
- クライアントと相談して.envで変更可能
- 営業メール送信先：1年間送信なしでDB削除（固定）
- APSchedulerで毎月1日0:00に自動実行

### XSS対策
- 管理画面でユーザー入力を表示する際に必ずエスケープ
- カスタムフィールドの値をinnerHTMLで出力しない（textContentを使う）
- Codeが実装確認・修正

### LINE webhook署名検証
- line-bot-sdk-python v3が自動処理
- Codeが実装済みか確認・未実装なら追加

### ハニーポット（ボット対策）
- 予約フォームに非表示の入力欄を追加
  <input type="text" name="website" style="display:none" tabindex="-1">
- FastAPI側でwebsite欄に値があれば静かに無視（エラーを返さない）

---

## CMO：マーケティング設計 [決定済み 2026-05-10]

### デモ環境（demo.weldex.jp）
- demo.weldex.jp/booking/ → WEB予約デモ
- demo.weldex.jp/admin/ → 管理画面（読み取り専用）
- LINEデモボット：専用チャネル（他チャネルと完全分離）
- デモ予約は毎日0:00にAPSchedulerでリセット
- 1LINEアカウント1予約まで（悪用対策）
- 「これはデモです」を明示

### Worksページ（/works）
- WEB予約デモ・LINEデモ・管理画面デモ・デモサイトを掲載
- 末尾に追加：
  「その他、飲食店・不動産・サロンなどあらゆる業種に対応可能です。
   まずはお気軽にご相談ください。」→ [無料相談する]ボタン
- 初受注後：ケーススタディをworks/に追加（課題・解決策・技術・デモURL）

### 問い合わせナーチャリングフロー
1. 即時：SendGridで自動返信メール
   内容：受付確認・24時間以内連絡・デモURL・LINE友だち追加リンク
2. 即時：Weldex運用LINEボットでRyomaに通知
   「🔔 新規問い合わせ / 会社名・氏名・内容」
3. 24時間以内：Ryoma手動返信（テンプレ+カスタマイズ）
4. 3日後：未返信の場合のみフォローアップ①を自動送信
   返信有無はGmail APIで確認
5. 7日後フォローアップ：不採用

ツール：
- 自動返信・フォローアップ：SendGrid（無料枠100通/日）
- Ryomaアラート：Weldex運用LINEボット
- 配信停止：outreach/のunsubscribesテーブル流用

---

## B-1 WEB予約ウィザード詳細 [決定済み 2026-05-10]

### ステップ構成
STEP1：メニュー選択
STEP2：カレンダーで日付選択（Flatpickr使用）
STEP3：時間選択（GET /api/slotsで空き枠のみ表示）
STEP4：情報入力（名前・電話必須 / メール任意）
STEP5：確認画面
STEP6：完了（確認メール + LINE友だち追加URL）

### データ保持
- JS変数（メモリ）で管理 + 各ステップ完了時にsessionStorageに書く
- リロード時はsessionStorageから復元してSTEP1に戻る
- 個人情報（名前・電話）はSTEP4なので序盤は安全

### カレンダーUI
- Flatpickr（CDN・日本語対応・日付無効化可能）
- 休業日・満枠の日をグレーアウト

### 時間枠ブロックロジック
- GET /api/slots?date=YYYY-MM-DD&menu_id=N
- サーバー側でscheduleから30分刻みスロット生成
- 既存予約のメニュー所要時間分を自動ブロック
  例）初診60分が10:00 → 10:00・10:30をブロック、11:00から空き

### 先着順競合対策（PostgreSQL移行後に自然解決）
- PostgreSQLトランザクション + SELECT FOR UPDATE
- 空き確認と予約挿入をアトミックに実行

### カスタムフィールドバリデーション
- クライアント側（JS）：送信ボタン押下時にrequiredチェック
- サーバー側（FastAPI）：custom_field_definitionsを参照して検証

### ステップバック
- 戻るボタン押下でJS変数から入力値を復元・再描画
- 日付変更時は時間選択をリセット

---

## D-1 営業自動化・メール設定 [決定済み 2026-05-10]

### SendGridドメイン認証
- weldex.jpでメール送信するためDNS認証が必要
- SendGrid → Sender Authentication → CNAMEレコードをCloudflare DNSに追加

### Gmail API認証
- outreach/get_gmail_token.pyを作成してrefresh_tokenを取得
- client_id・client_secret・refresh_tokenはRyomaが.envに直接記載
- AIチャットには絶対に貼らない

### 自動返信除外ロジック
- 以下のパターンを返信検知から除外：
  件名：「自動返信」「Auto-Reply」「不在」「Out of Office」
  Return-Path：noreply系
  X-Auto-Response-Suppressヘッダーあり

### メールフッター（特定電子メール法対応）
```
──────────────────
Weldex（ウェルデックス）
担当：【名前】
Mail：info@weldex.jp
住所：【自宅住所】
配信停止はこちら：【unsubscribeリンク】
──────────────────
```

---

## Phase 6 Next.js追加設計 [決定済み 2026-05-10]

### og:image
- 静的PNG（1200×630）をpublic/og-image.pngとして配置
- デザイン：ネイビー×ゴールド・Weldexロゴ・キャッチコピー
- 業種別LPも共通1枚でOK（当面）

### 業種別LPデータ構造
```typescript
// data/industries.ts
export type Industry = {
  slug: string           // "dental"
  name: string           // "歯科・クリニック"
  keyword: string        // "歯科 ホームページ制作"
  heroText: string       // キャッチコピー
  painPoints: string[]   // 「予約電話が多い」
  solutions: string[]    // Weldexの解決策
  schemaType: string     // "Dentist"
  demoUrl?: string       // デモURL
  faq: {q: string, a: string}[]
}
// slugを追加するだけでページが自動生成される
// 初期：dental / legal / construction / beauty
```

### A-7 Vercelデプロイ
- 保留中

---

## セキュリティルール（全実装共通）

- APIキー・シークレット・トークンはAIチャットに絶対に貼らない
- .envから必ずos.environ.get()で読み込む
- .envはGitignoreに含まれていることを確認してから作業開始
- client_id・client_secret・refresh_tokenはRyomaが自分で.envに直接記載
- 本番環境はRailway/Vercelの環境変数画面で設定

---

<!-- ====== 以下 2026-06-05 セッション追記分 ====== -->

## LINE通知仕様 [実装済み・詳細は今後詰める 2026-06-05]

### 現在の実装（reservation/services/line_notify.py）

共通 `push(message)` 関数で以下のイベントをRyomaのLINEに送信：

| イベント | メッセージ例 |
|---|---|
| 未処理例外 | `⚠️ [APP_NAME] エラー\nPOST /api/booking/create\nValueError: ...` |
| 新規予約 | `📅 新規予約 / [APP_NAME]\n田中様 / 2026-06-10 10:00\nメニュー: 初診` |
| キャンセル | `❌ キャンセル / [APP_NAME]\n田中様 / 2026-06-10 10:00` |
| リマインド失敗 | `⚠️ リマインド失敗 / [APP_NAME]\n2026-06-10\n失敗: 2件` |
| Weldex問い合わせ | `🔔 新規問い合わせ\n[会社名] / [名前]\n[内容先頭50文字]` |

### 今後詰めること（TODO）

- [ ] LINE通知の送信頻度上限（同じエラーが大量発生した場合の重複抑制）
- [ ] 通知のグルーピング（複数件まとめて1通にするか個別送信か）
- [ ] クライアント本人（院長・スタッフ）へのLINE通知フロー（現状はRyomaのみ）
- [ ] Push Message上限監視との連携（月160通アラート→200通フォールバック）
- [ ] 日次サマリー送信（毎朝8時に当日予約件数・前日リマインド結果など）
- [ ] LINE通知 vs メール通知の優先順位整理（クライアント側通知設計）
- [ ] 通知テンプレートのカスタマイズ（クライアント名・絵文字統一）

### 環境変数（必須）
```
WELDEX_LINE_CHANNEL_ACCESS_TOKEN = Weldex運用ボットのアクセストークン
ADMIN_LINE_USER_ID               = RyomaのLINE User ID
```

---

## LINE公式アカウント Webhook [設定済み 2026-06-05]

- 予約システムのWebhook URL:
  `https://earnest-gentleness-production-f682.up.railway.app/line/webhook`
- LINE Developers → Messaging API → Webhook URL に設定
- 設定後「検証」ボタンで疎通確認（200 OK）

---

## Weldexサイト リニューアル（2026-06-05セッション）[完了]

### 追加・変更したページ

| ページ | URL | 内容 |
|---|---|---|
| WEB予約システム詳細 | /services/web | 既存（料金リンクを削除） |
| WEB予約システム詳細 | /services/reservation | 新規作成（比較表・プラン付き） |
| LINE連携・代行詳細 | /services/line | 全面書き換え（「アカウント作成代行」に変更） |
| 顧客管理システム | /services/crm | 新規作成（紫配色・¥300,000〜） |
| デモポータル | /works | Share Demoセクション追加 |

### デプロイ済みデモURL（商談用）

```
WEB予約フォーム:    https://weldex.jp/booking
管理ダッシュボード: https://weldex.jp/demo-dashboard
```

### 料金ページ削除

- `/pricing` ページを削除（各サービスページ内に料金プランを統合）
- sitemapから除去・各サービスページのリンクも更新済み

---

<!-- ====== 以下 2026-06-09 セッション追記分 ====== -->

## ADR：営業収集のメール発見ロジック強化＋フォームを第2経路化 [実装済み 2026-06-09]

### 背景
「メールアドレスが取れず、アプローチできる相手が少ない」問題。
収集はGoogle Places起点だが Places APIはメアドを返さないため、サイト巡回で抽出するしかない。
従来は固定パス（/contact 等9件）を当て推量でGETしており、発見率が低く・無駄リクエストも多かった。

### 決定（analyzers/email_extractor.py を刷新）
1. **本物の問い合わせリンクを辿る**：トップHTMLの `<a href>` をスコアリングし、実在の問い合わせページ（/toiawase/ 等の独自パス含む）を最大3件巡回。固定パス当て推量を廃止。
2. **取得を1回に統合**：メール抽出とフォーム判定を同じ取得HTMLでまとめて実行（二重取得を撲滅）。
3. **難読化メール＋JSON-LD抽出**：全角＠・(at)/[dot]表記・HTMLエンティティ・schema.orgの email を拾う。
4. **フォームを第2のアプローチ経路に**：メールが無くても `contact_form_url` をDB保存。
   - targets に `contact_form_url TEXT` 追加（ALTER ... ADD COLUMN IF NOT EXISTS でマイグレーション）
   - get_stats に `with_form`／`approachable`（email or form）を追加
   - ⚠️ **フォーム自動送信はしない**（CAPTCHA・サイト規約・スパム性で特電法より高リスク）。
     ダッシュボードにURLを表示し、Ryomaが手動/半自動で送る運用とする。

### APIむだうち撲滅
- collectors/google_places.py：Details API を叩く**前**に `target_exists(place_id)` で重複チェック。
  既存place_idの Details 課金を回避（再収集時のコスト削減）。

### robots遵守の修正（#3a）
- 旧 `_check_robots` は `Disallow: /` 完全一致しか見ず、`/contact` 等の部分Disallowを無視していた。
- 標準ライブラリ urllib.robotparser を使う analyzers/robots.py を新設し、**パス単位で尊重**。
  メール巡回の各リクエスト前にも is_allowed() を通す。

---

## RISK：Google Places ToS のデータ保存制限 [未対応・要判断 2026-06-09]

- Google Maps Platform 規約は Places コンテンツ（名称・住所・電話・website・types）の**長期保存を原則禁止**。
  永続保存が許されるのは **place_id のみ**。さらに「Googleデータでの独自DB構築・prospecting」を禁止。
- 現状 targets テーブルは全フィールドを恒久保存＝**規約上グレー〜違反**。違反検知でAPIキー停止 → 収集停止のリスク。
- 緩和の選択肢（要設計判断・未着手）：
  (a) place_id のみ保存し他フィールドは都度取得 or 短期キャッシュ(≤30日)
  (b) Places を起点にせず、別データソース（公式サイト直・業界ディレクトリ等）へ切替
- 特電法フッターのオプトアウトは実装済みで要件充足（公開アドレスB2B例外）。問題は Places ToS のみ。

---

## ADR：Google Places ToS 対応の方針確定（実装は保留） [決定済み・実装保留 2026-06-09]

### 決定した方針（将来の実装方向）
RISK（Places ToS のデータ保存制限）への対処方針を以下に確定する：

1. **place_id は永続保存**（規約で唯一許される永続保存対象）
2. **会社名・電話・住所は、診断時に巡回するサイト本文から自前抽出**して保持する
   → Google Places 由来フィールドへの依存をなくし、「自分のデータ」として合法的に永続保持
3. **Google Places は「見込み先の発見入口」専用**とし、Places由来の生フィールドは長期保存しない
4. （任意）サイトから取り直せなかったレコードの Google由来フィールドは、checked_at が30日超で NULL 化（月次パージ）

### 既知の限界（許容する）
- サイトがある相手：サイトから取り直せる → 永続保持OK
- サイトがない相手（phone_only / no-site）：Google由来情報しかない → 厳密遵守なら30日で消える
  → この層は「30日以内に電話/郵送で動く」運用とし、長期保存に依存しない
  （= 既知の「高価値リードほどメールが取れない」構造的ジレンマと同根）

### 実装タイミング：保留
- **とりあえず数件契約するまでは現状の方針（現行の収集・保存）を維持する**（事業判断）。
- 理由：いま優先すべきは受注。収集アーキテクチャの作り替えより、
  「今回の結果パネル」での効果測定と実営業を回す方が先に価値が出る。
- 検知確率は個人規模では低い（サーバー内保存はGoogleから見えない）が、用途自体が
  規約のprospecting禁止に近い「低確率・高影響」リスクである点は認識した上での保留。
- 数件契約後にこのADRの 1〜4 を実装する（次フェーズ）。

### dedup（重複スキップ）との整合
- 現行の target_exists による重複スキップは維持（コスト削減）。
- 「30日キャッシュ更新」と「重複スキップ」は本来両立しないが、上記方針（自前抽出で自分のデータ化）
  により、そもそもGoogle由来データの更新に依存しないため矛盾は解消される。
