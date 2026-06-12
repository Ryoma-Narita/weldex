# News & Blog 仕様

## 概要

`weldex.jp/news` に記事一覧・個別記事ページを実装。
記事データは `site-next/data/posts.ts` で一元管理する。

---

## ページ構成

| URL | ファイル | 内容 |
|---|---|---|
| `/news` | `app/news/page.tsx` | 記事一覧（3カラムカードグリッド） |
| `/news/[slug]` | `app/news/[slug]/page.tsx` | 個別記事（本文＋右サイドバー） |

---

## 記事の追加方法

### 1. `site-next/data/posts.ts` に記事オブジェクトを追加

```typescript
{
  slug: "article-slug",              // URL: /news/article-slug
  title: "記事タイトル",
  excerpt: "一覧カードに表示される要約文（80字程度）",
  category: "カテゴリ名",
  categoryColor: "#1e40af",          // バッジ色（HEX）
  publishedAt: "2026-07-01",         // YYYY-MM-DD
  readMin: 5,                        // 想定読了時間（分）
  image: "/images/news/article-slug.png",  // サムネイル（省略可）
  body: [ ... ],                     // 記事本文（Section[]）
}
```

### 2. サムネイル画像を配置

```
site-next/public/images/news/article-slug.png
```
推奨サイズ：1200×675px（16:9）

---

## Body セクション型一覧

```typescript
{ type: "p",     text: "段落テキスト" }
{ type: "h2",    text: "大見出し（navy背景・左ボーダー）" }
{ type: "h3",    text: "小見出し（gold左ボーダー）" }
{ type: "ul",    items: ["リスト1", "リスト2"] }
{ type: "note",  text: "注釈ボックス（黄色背景）" }
{ type: "table", headers: ["列1", "列2"], rows: [["A", "B"]] }
{ type: "cta",   heading: "CTA見出し", text: "説明文", href: "/services/web", label: "ボタンテキスト" }
```

---

## デザイン仕様

### 一覧ページ
- 背景: `#f8f9fc`
- カード: 白・角丸10px・ホバーで浮き上がり（`translateY(-4px)`）
- グリッド: 3列（≤900px → 2列・≤560px → 1列）

### 個別記事ページ
- ヘッダー: navy背景・パンくず・カテゴリバッジ・タイトル
- 本文エリア: 白カード、最大幅 760px
- サイドバー: 幅 300px、`position: sticky; top: 5.5rem`
  - 新着記事リスト（同記事を除く最大4件）
  - 無料相談CTAボックス

### h2 スタイル（`.art-h2`）
```css
background: #f0f4fb;
border-left: 4px solid var(--navy);
border-radius: 0 6px 6px 0;
padding: 0.55rem 1rem;
```

### h3 スタイル（`.art-h3`）
```css
border-left: 3px solid #c9a84c;
padding-left: 0.75rem;
```

---

## 公開済み記事

| slug | タイトル | カテゴリ | 公開日 |
|---|---|---|---|
| `what-is-maintenance-fee` | 「保守費って何のお金？」月額保守に含まれるもの・含まれないものを全解説 | コスト・費用 | 2026-06-12 |

---

## サムネイル画像生成プロンプト（参考）

### what-is-maintenance-fee
```
flat illustration blog thumbnail, Japanese corporate website, server maintenance concept,
deep navy blue background, gold accent color, server rack + calendar + yen coin + wrench + shield icons,
white Japanese typography overlay「保守費」って何のお金？, modern minimal design, 16:9 aspect ratio
--ar 16:9 --style raw --v 6
```
