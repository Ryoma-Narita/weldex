# セッション引き継ぎログ

> **使い方**：セッション終了時に必ずこのファイルを更新する。
> 新しいセッション開始時に最初に読む。CLAUDE.mdより具体的な「今の状態」を記録する。

---

## 最終更新：2026-06-12

## 現在のフォーカス
サイト品質・セキュリティ強化フェーズ。営業は未着手（最優先タスク）。

## 直近で完了した作業

### 2026-06-12（第2弾）
- **営業メールのデータドリブン化**
  - `outreach/analyzers/site_checker.py`：サーバー応答秒数を実測（`response_sec`）。1.5秒以上なら detail に「サーバー応答 X.X秒（推奨は1秒以内）」を自動追記
  - `outreach/dashboard/app.py`：生成プロンプト強化——冒頭で診断事実を1つ specific に言及→一般統計で影響を数値化（伝聞表現必須・捏造禁止・主観的に貶すの禁止）
- **ROI電卓（損失シミュレーター）**：`site-next/components/RoiCalculator.tsx` 新設
  - `/services/reservation` の料金セクション直前に配置（損失を見せてから価格を見せる）
  - 1日の電話件数×取りこぼし割合（ボタン）×客単価 → 月間/年間損失・導入費回収日数
  - 動作確認済み（デフォルト：月¥312,000・3割選択で¥468,000に再計算）
- **ステップ式お問い合わせフォーム**：`app/contact/ContactForm.tsx` 全面書き換え
  - 1問ずつ表示（5ステップ）・相談内容と業種はプルダウンでなくボタン選択（選択=次へ）
  - 回答済みは上部にサマリー表示・クリックで戻って変更可能
  - 見た目は従来フォーム様式を継承（LINE風にはしない・ユーザー指示）
  - Formspree送信は従来同様。全ステップ遷移を動作確認済み
- **docs/blog_ideas.md 新設**：ブログ記事ネタ帳（データレポート系・損失数値化系・意思決定系・制作裏側系）
- ※ 月次レポート（アイデア7）は既存仕様に含まれる。プランにより厚みが変わる方針（Ryoma確認済み）

### 2026-06-12（第1弾）
- **パーソナライズドデモURL実装**（営業の武器）
  - `/booking/?demo=さくら歯科` → タイトルが「さくら歯科 ご予約」になる＋デモ環境注記
  - `GET /api/booking/config`（`routers/booking.py`）で DEMO_MODE を判定。本番クライアント環境では無効
  - XSS安全（textContent のみ・30文字制限）。詳細: docs/reservation.md 末尾
  - **E2E確認は Railway に DEMO_MODE=true を設定後**（未設定だと無効のまま）
- **サービス料金の単一ソース化リファクタリング**（重要）
  - `site-next/data/services.ts` 新設：4サービスの料金・説明・特徴の唯一の定義場所
  - `app/services/page.tsx`・`app/pricing/page.tsx`・`components/PriceTeaser.tsx` がここから import
  - **発見したバグ**：トップページ PriceTeaser が旧料金（HP ¥80,000 / 予約 ¥120,000 / LINE ¥80,000）を本番表示していた
    → 現行料金（¥150,000 / ¥200,000 / ¥150,000）に統一。**料金改定時は data/services.ts のみ変更**
  - 死にコード削除：`components/FAQ.tsx`・`components/SchemaOrg.tsx`（未使用＋旧料金記載）
    → FAQ構造化データ（SEO資産）は将来正しい料金で再実装する価値あり
- 背景デザイン実験は全ロールバック（白背景で確定）

### 2026-06-11
- `/pricing` ページ新規作成・sitemap/Header 反映済み
- 管理画面XSS修正（`reservation/static/admin/index.html`・`esc()` 関数）
- デモリセットジョブ（`reservation/services/demo_reset.py`・`DEMO_MODE=true` で毎日0:00）
- ヘッダーナビ視認性向上（`.nav-link` クラス・ゴールド下線ホバー）

## 次にやること（具体的に）

### 🔴 今すぐ（手動作業・設定）
1. **`DEMO_MODE=true` を Railway の予約サービスに設定**
2. **`ANTHROPIC_API_KEY` を Railway outreach サービスに設定**
3. **営業自動化を実際に回す**（歯科・東京・50件収集→送信キュー確認）
4. **未コミット変更のコミット・プッシュ**（リファクタ含む）

### 🟡 コード作業
5. FAQ構造化データの再実装（data/services.ts の料金を参照する形で）
6. XSS対策の残り確認・`.env.local` 分離

## 未解決の懸念
- Google Places ToS リスク（decisions.md 参照）→ 数件契約後に対応予定
- og-image.png 未作成（SNSシェア時に画像なし）
- UptimeRobot 未設定（本番ダウン検知ゼロ）
- Sentry 廃止済み → LINE通知に統一（WELDEX_LINE_CHANNEL_ACCESS_TOKEN 設定待ち）
- `.claire/worktrees/eager-spence-2cae32/` に別ツールの作業残骸（FAQ.tsx）が残存 → 削除可か要確認

## 重要な設計メモ
- **料金は `site-next/data/services.ts` だけで管理**（services/pricing/PriceTeaser すべてここ参照）
- 各サービス詳細ページ（reservation/line/crm）のプラン表は個別ページ内に残存 → 料金改定時はそちらも確認
- デモ環境（weldex.jp/booking, weldex.jp/demo-dashboard）= Railway の予約サービス本体
- `esc()` 関数は admin/index.html の `statusBadge()` の直前に定義済み
- Next.js dev サーバーはコンポーネント削除後に RSC manifest エラーを出すことがある → `.next` 削除して再起動
