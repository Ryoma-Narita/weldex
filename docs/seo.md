# Weldex SEO管理ドキュメント

> 定期的に更新する生きたドキュメント。
> 計測のたびにスコアと日付を記録する。
> 計測ツール：https://pagespeed.web.dev/

---

## 現在のスコア（weldex.jp）

| 計測日 | デバイス | Performance | Accessibility | Best Practices | SEO | Core Web Vitals |
|--------|---------|-------------|---------------|----------------|-----|-----------------|
| 2026-05-10 | Mobile  | 93 | 91 | 100 | 92 | ❌ Failed（INP: 245ms） |
| 2026-05-10 | Desktop | 97 | 91 | 100 | 92 | - |

---

## ターゲットスコア

| 項目           | 目標値 |
|----------------|--------|
| Performance    | 95以上 |
| Accessibility  | 95以上 |
| Best Practices | 100    |
| SEO            | 100    |

---

## ターゲットキーワード（Weldex本体・B2B）

| キーワード                  | 優先度 | 対応ページ              |
|-----------------------------|--------|-------------------------|
| AI ホームページ制作          | 高     | /                       |
| 歯科 ホームページ制作        | 高     | /services/dental/       |
| 士業 ホームページ制作        | 高     | /services/legal/        |
| 建設 ホームページ制作        | 中     | /services/construction/ |
| LINE予約システム 導入        | 中     | /services/              |
| ホームページ診断 無料        | 中     | /tools/diagnosis/       |
| 中小企業 ホームページ 安い   | 中     | /pricing/               |

---

## SEO実装チェックリスト

### テクニカルSEO
```
[ ] Next.js App Router構成
[ ] 全ページ title・meta description 設定
[ ] OGP（og:title / og:description / og:image）
[ ] Twitter Card
[ ] canonical URL
[ ] XMLサイトマップ（自動生成）
[ ] robots.txt
[ ] 404ページ
[ ] HTTPSリダイレクト（Cloudflare設定）
```

### Schema.org
```
[ ] Organization（トップ）
[ ] WebSite + SearchAction（トップ）
[ ] Service（各サービスページ）
[ ] 業種別Schema（Dentist / LegalService / HomeAndConstructionBusiness 等）
[ ] FAQPage（FAQ掲載ページ）
[ ] BreadcrumbList（全ページ）
```

### パフォーマンス
```
[ ] 画像すべてWebP + next/image使用
[ ] フォント：next/font使用（セルフホスト・font-display:swap）
[ ] LCP要素の特定と最適化
[ ] 不要なJS削除（デフォルトJSゼロを目指す）
[ ] Tailwind CSS purge設定確認
```

### アクセシビリティ
```
[ ] 全画像にalt属性
[ ] 色コントラスト比4.5:1以上（ネイビー×白は問題なし・ゴールド系は要確認）
[ ] キーボードナビゲーション対応
[ ] フォームにlabel紐付け
[ ] lang="ja"設定済み確認
```

---

## Googleビジネスプロフィール（GBP）

```
作成状況：[ ] 未作成（Ryoma手動作業）
URL：（作成後に記入）
住所表示：サービス提供エリアのみ（住所非公開）
カテゴリ：ウェブデザイン会社
口コミ数：-
最終更新：-
```

---

## 改善ログ

| 日付 | 対応内容 | Before | After |
|------|----------|--------|-------|
| -    | -        | -      | -     |

---

## 次のアクション

```
[ ] Next.jsプロジェクト初期構築
[ ] 既存weldex.htmlをNext.jsコンポーネントに移植
[ ] 業種別LPテンプレート実装（dental / legal / construction / beauty）
[ ] Lighthouseで初回計測・このファイルにスコアを記録
[ ] GBP作成（Ryoma手動）
[ ] Search Console設定
```
