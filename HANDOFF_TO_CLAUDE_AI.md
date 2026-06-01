# Weldex サイト — Claude.ai 引き継ぎドキュメント

> このドキュメントはClaude Code（実装AI）からClaude.ai（設計・レビューAI）への引き継ぎ用です。  
> 現状・懸念点・依頼事項をまとめています。

---

## 🏢 プロジェクト概要

| 項目 | 内容 |
|------|------|
| 事業名 | Weldex（ウェルデックス） |
| 形態 | 個人事業主（成田 涼真） |
| サービス | WEBサイト制作・LINE予約・システム開発・保守 |
| ターゲット | 医療・歯科・士業・建設などの中小企業 |
| 強み | AIで大手比1/3以下のコスト・業種特化 |
| 本番URL | https://weldex.jp |
| 技術構成 | Next.js 15 App Router / TypeScript / Vercel |

---

## ✅ 実装済み（Claude Codeで完成したもの）

### ページ一覧

| ページ | URL | 状態 |
|--------|-----|------|
| トップ | `/` | ✅ 完成 |
| サービス一覧 | `/services` | ✅ 完成 |
| WEB制作詳細 | `/services/web` | ✅ 完成 |
| 制作実績・デモ | `/works` | ✅ 完成 |
| 料金 | `/pricing` | ✅ 完成 |
| About | `/about` | ✅ 完成 |
| お問い合わせ | `/contact` | ✅ 完成 |
| プライバシーポリシー | `/privacy` | ✅ 完成 |
| 特定商取引法 | `/legal` | ✅ 完成 |

### コンポーネント一覧

| コンポーネント | 内容 | 配置場所 |
|--------------|------|---------|
| `LoadingScreen` | Weldex. ローディング画面 | トップのみ |
| `Hero` | メインビジュアル（白背景＋右tech画像） | トップ |
| `BrandSection` | Weld / Connect / Grow の3ブロック | トップ |
| `PainPoints` | LINEトーク風お悩みアニメーション | トップ・services/web |
| `Pillars` | 3つの強み | トップ |
| `Process` | 制作フロー4ステップ | トップ |
| `CTABand` | お問い合わせ誘導バナー | 複数ページ |
| `ComparisonTable` | 3社比較テーブル（Weldex vs A社 vs B社） | services/web |
| `Header` | ナビゲーション（デスクトップ＋ハンバーガー） | 全ページ |
| `Footer` | フッター（リンク・コピーライト） | 全ページ |
| `FadeIn` | スクロール連動フェードインアニメーション | 各所 |

### デザイン変数（globals.css）

```css
--navy:   #0c1a35   /* メインカラー */
--gold:   #b8960c   /* アクセントカラー */
--gray:   #4b5563   /* 本文テキスト */
--white:  #ffffff
--off:    #f8f9fc   /* 薄いグレー背景 */
--border: #e2e8f0
```

### フォント
- **見出し**: Cormorant Garamond（serif、高級感）
- **本文・UI**: DM Sans（sans-serif、読みやすさ）

---

## 🎨 現在のデザイン状態

### Hero（トップページ最上部）
- 背景：白
- 左側：テキストコンテンツ（ネイビー文字）
- 右側：青いtech都市＋ネットワーク画像
- グラデーション：左40%=白、そこから画像がうっすら→右端でフル表示
- ボタン：ゴールド（無料相談）＋ネイビーアウトライン（サービスを見る）

### タイポグラフィ
```
h1: clamp(30px, 7vw, 52px) / weight 900 / line-height 1.2
h2: clamp(22px, 5vw, 36px) / weight 900 / line-height 1.25
h3: clamp(17px, 3vw, 22px) / weight 700 / line-height 1.35
本文p: 0.9375rem (15px) / color #4b5563 / line-height 2.0
```

---

## ✅ 解決済みの懸念点

| 懸念 | 対応内容 | 対応日 |
|------|---------|--------|
| `NEXT_PUBLIC_ADMIN_SECRET` がクライアントバンドルに露出 | Admin.tsx の `adminFetch` を **Server Actions** に置き換え。シークレットはサーバー側のみで処理 | 2026-06-01 |
| 業種別ページが404 | `app/services/[slug]` + `data/industries.ts` で実装済み（dental/legal/construction/beauty） | 2026-05-13 |

---

## ⚠️ 懸念点・未解決事項

### 1. Hero のコンテンツ品質
- 統計数字が「低コスト」「多数」「高い」という定性的な表現のまま
- 「制作実績：多数」は信頼性に欠ける可能性
- → **具体的な数字に変えるべきか？** 例：「1/3以下のコスト」「30社以上」「満足度98%」

### 2. PainPoints コンポーネントの効果
- LINEトーク風アニメーションで「歯科医師・弁護士・工務店」のお悩みを順に表示
- ユーザーに刺さるか未検証
- → **このアプローチが適切か、別の表現法があるか確認したい**

### 3. ComparisonTable の内容
- 「A社（大手制作会社）」「B社（フリーランス）」との比較
- 現在の比較項目：技術/品質/表示速度/費用/納期/一社完結/セキュリティ
- Weldexが全項目で優位な表示 → 信頼性として問題ないか？
- → **比較内容・表現の妥当性を確認したい**

### 4. 業種別サービスページ（実装済み）
- `app/services/[slug]/page.tsx`（動的ルーティング）+ `data/industries.ts` で実装済み
- `/services/dental` `/services/legal` `/services/construction` `/services/beauty` は**全ページ動作中**
- 各ページ：ヒーロー / Before-After（課題→解決）/ FAQ / CTA の構成
- → **内容・コピーの質をレビューしたい**（実装はされているが文言が薄い可能性）

### 5. 実績・デモページの中身
- `WorksCarousel` コンポーネントに実際のデモ案件が入っているが、件数・内容が少ない可能性
- → **実績の見せ方・デモの構成を整理したい**

### 6. 料金ページの構成
- 現在：パッケージ料金（ランディングページ・コーポレートサイト・予約システム等）を表形式で表示
- → **料金設定・見せ方は競合と比較して適切か？**

### 7. Header のナビゲーション
- デスクトップ：ホーム / サービス / 実績・デモ / 料金 / About / 無料相談ボタン
- → **「About」はデスクトップナビに入れるべきか悩んでいる**

### 8. フォントのライセンス
- Google Fonts（Cormorant Garamond, DM Sans）は商用利用可能だが確認済みか？
- → 問題なし（SIL Open Font License）

---

## 🔧 Claude.aiにお願いしたいこと

### 【優先度：高】

#### A. Hero セクションの改善提案
現在のHeroに以下を入れているが、もっと良い案はあるか？
```
キャッチコピー：「AIで、あなたの事業の本質を支える。」
サブコピー：WEBサイト制作からLINE・WEB予約システム・システム開発まで...
ボタン：無料相談をする / サービスを見る
統計：低コスト / 多数 / 高い（← ここが曖昧）
```

**相談：**
- キャッチコピーはこれで刺さるか？別案はあるか？
- 統計数字をどう表現すべきか（具体的数字 vs 定性表現）
- 右側画像（青いtech都市）とネイビー×ゴールドのブランドカラーの相性は？

#### B. PainPoints（お悩みセクション）の設計レビュー
```
登場人物：
  - 歯科医師：「予約が電話だけで手間がかかる」
  - 弁護士：「サイトはあるが問い合わせが全然来ない」
  - 工務店：「古いホームページを新しくしたいけど費用が怖い」
→ Weldexが「すべて解決できます」と返答
```
**相談：**
- このキャラ・悩みの設定は適切か？
- アニメーション演出（LINEトーク風）はUX的に良いか？
- 別のアプローチ（例：数字で示す、Before/After、動画）の方が良いか？

#### C. ページ全体のストーリーライン（トップページ）
現在の構成順：
1. Hero（キャッチ＋tech画像）
2. BrandSection（Weld/Connect/Grow）
3. PainPoints（お悩みアニメ）
4. Pillars（3つの強み）
5. Process（制作フロー）
6. CTABand（お問い合わせ）

**相談：**
- この順番は「初見ユーザーが問い合わせをする」という流れとして自然か？
- 何か抜けているセクション・不要なセクションはあるか？
- BrandSection（Weld/Connect/Grow）の役割がわかりにくい可能性→改善案は？

---

### 【優先度：中】

#### D. 業種別ページのコンテンツ品質
`/services/dental` `/services/legal` `/services/construction` `/services/beauty` は実装済みで動作中
- `data/industries.ts` に各業種の painPoints / solutions / FAQ を定義
- SEO的には業種×地域キーワードで有効だが、テキスト量が薄いと逆効果の可能性
- **判断：各業種ページの文章量・具体性が十分か確認したい**

#### E. ComparisonTable の戦略的妥当性
A社（大手）B社（フリーランス）との比較でWeldexが全勝の表現
- 「一社完結」「AI活用」「表示速度」がWeldexのみ◎
- 信頼性・違和感の観点から問題ないか？
- 比較の見せ方（テーブル vs 別の形式）の提案は？

#### F. 料金設定の妥当性
- LP制作：¥80,000〜
- コーポレートサイト：¥150,000〜
- WEB予約システム：¥120,000〜
- LINE予約連携：¥80,000〜
- 月額保守：¥5,000〜
→ 相場感・競合比較での妥当性を確認したい

---

### 【優先度：低・将来】

#### G. リデザイン候補
以下のセクションが現在「ありきたり」に感じる可能性：
- `BrandSection`（Weld/Connect/Growの3カラム）→ もっと視覚的インパクトを出すには？
- `Pillars`（強みの3カード）→ 差別化できる見せ方は？
- `Process`（制作フロー4ステップ）→ タイムライン or 別の形式の方が良いか？

#### H. モバイル対応の確認
- 全ページ `resp-2col` クラスでスマホ1カラム対応済み
- Heroのtech画像がスマホで適切に見えるか（グラデーションの見え方が変わる）
- PainPointsのアニメーションがスマホで動くか

---

## 📁 ファイル構成（実装担当者向け）

```
site-next/
├── app/
│   ├── page.tsx              ← トップページ
│   ├── globals.css           ← デザイン変数・共通スタイル
│   ├── layout.tsx            ← 共通レイアウト（Header/Footer）
│   ├── services/
│   │   ├── page.tsx          ← サービス一覧
│   │   ├── web/page.tsx      ← WEB制作詳細
│   │   └── [slug]/page.tsx   ← 業種別LP（dental/legal/construction/beauty）
│   ├── works/page.tsx        ← 制作実績・デモ
│   ├── pricing/page.tsx      ← 料金
│   ├── about/page.tsx        ← About
│   ├── contact/page.tsx      ← お問い合わせ
│   ├── hearing/page.tsx      ← ヒアリングフォーム（問い合わせ詳細版）
│   ├── admin/
│   │   ├── hearing/page.tsx  ← ヒアリング管理画面（noindex）
│   │   └── outreach/page.tsx ← 営業管理画面（noindex）
│   ├── api/
│   │   ├── hearing/          ← ヒアリングCRUD API（POST公開・GET/PATCH認証済）
│   │   └── outreach/         ← 営業API
│   ├── privacy/page.tsx      ← プライバシーポリシー
│   └── tokusho/page.tsx      ← 特定商取引法
├── components/
│   ├── Hero.tsx              ← ★最近リデザイン済み
│   ├── PainPoints.tsx        ← ★LINEトーク風（要レビュー）
│   ├── ComparisonTable.tsx   ← ★3社比較（要レビュー）
│   ├── hearing/Admin.tsx     ← ヒアリング管理UIコンポーネント
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── data/
│   ├── industries.ts         ← 業種別LPデータ（dental/legal/construction/beauty）
│   └── outreach.ts
└── public/
    └── hero-tech.jpg         ← ★青いtech都市画像（使用中）
```

---

## 🚀 Claude.aiへの橋渡し方法

このドキュメントをClaude.aiのチャットに貼り付けて、以下を伝えてください：

```
Weldex（個人事業のWEB制作会社）のサイトを作っています。
上記のドキュメントを読んで、以下について相談に乗ってください：

1. Heroセクションのコピーと統計数字の改善案
2. トップページ全体のストーリーラインが適切か
3. PainPointsセクション（LINEトーク風）のUX評価
4. [その他聞きたいこと]
```

---

*最終更新：2026-06-01 / 業種別ページ実装確認・Server Actions移行・ファイル構成更新*
