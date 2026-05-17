# docs/workflow.md — 開発ワークフロー・マルチクライアント設計

> **役割分担の原則**
> - **claude.ai** → 仕様設計・アーキテクチャ判断・要件整理（このファイルへの記載）
> - **Claude Code** → 実装・ファイル編集・デバッグ・テスト実行

---

## 役割分担の具体例

```
【claude.aiでやること】
  - 新機能の仕様を詰める（どう動くか、エッジケースは何か）
  - アーキテクチャの選択肢を比較（メリット・デメリット）
  - decisions.md に判断を記録する
  - エラーが3回解決しない場合の原因分析

【Claude Codeでやること】
  - 仕様に従ってファイルを作成・編集
  - 動作確認コマンドの実行
  - 依存ライブラリのインストール
  - CLAUDE.mdのステータス更新
```

---

## マルチクライアント設計（LINE予約システム）

### 基本方針：クライアントごとに独立デプロイ

```
クライアントA（歯科医院）          クライアントB（整骨院）
  Railway: weldex-client-a           Railway: weldex-client-b
  port: 8002                         port: 8002
  .env:                              .env:
    APP_NAME=さくら歯科                APP_NAME=なかた整骨院
    LINE_CHANNEL_SECRET=xxx_a          LINE_CHANNEL_SECRET=xxx_b
    LINE_CHANNEL_ACCESS_TOKEN=xxx_a    LINE_CHANNEL_ACCESS_TOKEN=xxx_b
    ADMIN_PASSWORD=clientA_pass        ADMIN_PASSWORD=clientB_pass
  DB: /data/reservation.db           DB: /data/reservation.db
```

**理由：**
- LINE Messaging APIはチャンネル単位（クライアントごとにLINE公式アカウントが必要）
- データ分離が自然（DBを共有しないので情報漏洩リスクなし）
- 1クライアントの障害が他に影響しない
- Railway/Renderは1サービス $5〜7/月 → 10クライアントで $50〜70/月

---

## クライアント導入フロー

```
STEP1: 要件確認（claude.aiで仕様書作成）
  - メニュー・受付時間・休業日パターン
  - LINE公式アカウントはあるか（なければ開設案内）
  - メール通知の要不要

STEP2: 環境セットアップ（Claude Codeで実行）
  - Railway/Renderで新サービス作成
  - 環境変数を設定（APP_NAME, LINE_*, ADMIN_PASSWORD, etc.）
  - DB初期化・メニュー登録

STEP3: LINE設定（人間が実施）
  - LINE Developer Console でWebhook URL設定
  - リッチメニュー作成（LINE Official Account Manager）
  - 友達追加QRコードをクライアントに共有

STEP4: 動作テスト（Claude Codeで確認）
  - 予約フロー通し確認
  - リマインド手動実行テスト
  - 管理画面ログイン・操作確認

STEP5: 引き渡し
  - 管理画面URL・パスワードをクライアントに渡す
  - 操作マニュアル（PDF）を渡す
```

---

## 環境変数チェックリスト（新クライアント追加時）

```bash
# 必須
APP_NAME=             # クライアント名（例：さくら歯科クリニック）
APP_URL=              # 予約フォームの公開URL
ADMIN_EMAIL=          # 管理者通知先メール
ADMIN_PASSWORD=       # 管理画面パスワード（ランダム12文字推奨）
SECRET_KEY=           # セッション署名キー（ランダム32文字）

# LINE（LINE予約を使う場合）
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# メール送信（SendGrid）
SENDGRID_API_KEY=     # Weldexの共通キーを使う or クライアント専用
FROM_EMAIL=           # info@weldex.jp or クライアントのメール
FROM_NAME=            # クライアント名

# 予約設定（.envで上書き可能）
SLOT_START=09:00      # 受付開始
SLOT_END=18:00        # 受付終了
SLOT_INTERVAL_MIN=30  # スロット間隔（分）
ADVANCE_DAYS=30       # 何日先まで予約可能か
```

---

## スケール判断基準

| クライアント数 | アーキテクチャ | 運用コスト目安 |
|---|---|---|
| 1〜5件 | 独立デプロイ（現行） | $25〜35/月 |
| 6〜20件 | 独立デプロイ継続 | $60〜140/月 |
| 21件〜 | マルチテナント化を検討（claude.aiで設計） | 要設計 |

**マルチテナント移行のトリガー：**
- 管理コストが月2時間を超えた場合
- DB容量が問題になった場合（SQLiteの限界）
- 共通機能のアップデートが煩雑になった場合

---

## claude.ai ↔ Claude Code の紐づけ方

自動連携はない。**`docs/` フォルダが唯一の橋渡し。**

### Claude Code → claude.ai（設計を詰めたいとき）

```
1. Claude Code で行き詰まったら、以下を claude.ai にコピペする

   ① CLAUDE.md（全文）
   ② 関連する docs/*.md
      例：LINE機能なら docs/line.md + docs/decisions.md
   ③ 具体的な質問
      例：「decisions.md #020 のWEB予約LINE通知をどう設計する？」

2. claude.ai で仕様・設計を詰める

3. 結論を decisions.md に貼り付ける（Claude Code で編集）

4. CLAUDE.md の「現在のタスク」に実装ステップを追記

5. Claude Code に「CLAUDE.mdを読んで現在のタスクを実行して」と指示
```

### claude.ai → Claude Code（実装に移るとき）

```
claude.ai での会話が終わったら：

1. claude.ai に「decisions.md に追記する内容をまとめて」と依頼
   → コード形式で出力してもらう

2. そのテキストを Claude Code に貼って
   「docs/decisions.md に追記して」と指示

3. 「CLAUDE.mdの現在のタスクを更新して」と指示

4. 「CLAUDE.mdを読んで現在のタスクを実行して」で実装開始
```

### 仕様変更・機能追加のフロー（全体）

```
1. claude.ai で詰める
   「〇〇機能を追加したい。どう設計するか？」
   → アーキテクチャ・エッジケース・影響範囲を整理
   → decisions.md に結論を記録

2. CLAUDE.md に「現在のタスク」として追記
   → 実装ステップを箇条書き

3. Claude Code で実装
   「CLAUDE.mdを読んで現在のタスクを実行」
   → 1ステップずつ確認しながら進める

4. 完了後に CLAUDE.md のステータスを [x] に更新
```

### どちらに何を持っていくか 早見表

| 状況 | どちらへ |
|---|---|
| 「この機能どう設計する？」 | claude.ai |
| 「このエラーが解決しない（3回以上）」| claude.ai |
| 「新テーブルが必要？カラム構成は？」 | claude.ai |
| 「仕様は決まった、実装して」 | Claude Code |
| 「このファイルを編集して」 | Claude Code |
| 「動作確認コマンドを実行して」 | Claude Code |
| 「CLAUDE.md を更新して」 | Claude Code |

---

## よくある判断の基準

```
Q: 既存機能に影響するか？
  → 影響する → claude.aiで先に設計・影響範囲確認
  → 影響しない → Claude Codeで直接実装可能

Q: 新しいテーブル/カラムが必要か？
  → 必要 → database.mdを更新してからClaude Codeで実装
  → 不要 → Claude Codeで直接実装可能

Q: 外部APIを追加するか？
  → 追加 → requirements.txtのバージョン確認、テスト方法をclaude.aiで確認
  → 追加しない → Claude Codeで直接実装可能

Q: クライアントをまたぐ変更か？
  → またぐ → claude.aiで全クライアントへの影響を整理してから実施
```
