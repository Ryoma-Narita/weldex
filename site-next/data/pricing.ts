/**
 * 詳細料金データ — Single Source of Truth
 *
 * 各サービスの初期費用・月額プランを管理する。
 * 各プランは前プランの全機能を引き継ぐ（newFeatures = 追加分のみ格納）。
 */

export type Price = number | null; // null = 要相談

export interface PriceItem {
  name: string;
  price: Price;
  note?: string;
}

export interface Plan {
  name: string;
  price: Price;
  recommended?: boolean;
  newFeatures: string[];
}

// ─── WEB 制作 ─────────────────────────────────────────────
export const WEB_INITIAL: PriceItem[] = [
  { name: "コーポレートサイト",  price: 300000 },
  { name: "ECサイト",            price: 700000 },
  { name: "ページ追加（1P）",    price: 50000 },
  { name: "リニューアル",        price: null, note: "規模・既存資産により変動" },
];

export const SEO_ITEMS: PriceItem[] = [
  { name: "SEO診断",     price: 50000 },
  { name: "内部SEO対策", price: 150000 },
  { name: "SEOコンサル", price: null },
];

export const WEB_PLANS: Plan[] = [
  {
    name: "ライト",
    price: 12000,
    newFeatures: ["サーバー・ドメイン管理", "バックアップ", "更新対応（月30分まで）"],
  },
  {
    name: "スタンダード",
    price: 30000,
    newFeatures: [
      "テキスト月1回修正",
      "画像差し替え",
      "お知らせ更新（月2時間まで）",
      "月次レポート",
    ],
  },
  {
    name: "集客保守",
    price: 49800,
    recommended: true,
    newFeatures: ["SEO順位チェック・改善提案", "MEO対応", "LINE配信"],
  },
  {
    name: "集客DXプラン",
    price: 98800,
    newFeatures: [
      "Web更新無制限",
      "SEOキーワード分析",
      "配信4回",
      "シナリオ改善",
    ],
  },
  {
    name: "運用顧問",
    price: 200000,
    newFeatures: ["月次戦略MTG", "専任担当者", "優先対応"],
  },
];

// ─── LINE 連携 ────────────────────────────────────────────
// 競合調査: 初期¥50,000〜¥200,000 / 月額¥30,000〜¥100,000 が市場相場
// 中小企業（医療・歯科・士業・建設）向けに市場下限〜中間帯で設定

export const LINE_INITIAL: PriceItem[] = [
  { name: "アカウント構築（開設・初期設定）", price: 50000 },
  { name: "リッチメニュー制作",               price: 30000 },
  { name: "ステップ配信設計・設定",            price: 80000 },
];

export const LINE_PLANS: Plan[] = [
  {
    name: "ライト",
    price: 19800,
    newFeatures: ["アカウント管理", "月1回配信", "簡易レポート"],
  },
  {
    name: "スタンダード",
    price: 39800,
    recommended: true,
    newFeatures: ["月3回配信", "セグメント分析", "QR最適化"],
  },
  {
    name: "プレミアム",
    price: 79800,
    newFeatures: [
      "ステップ配信改善",
      "属性分析",
      "シナリオ設計",
      "月4回配信",
    ],
  },
];

// ─── CRM ─────────────────────────────────────────────────
export const CRM_INITIAL: PriceItem[] = [
  { name: "独自CRM構築（クラウド・DB化）",        price: 350000 },
  { name: "ヒアリング・データ移行・クレンジング", price: 200000 },
  { name: "LINE予約連携",                          price: 200000 },
  { name: "WEB連携",                               price: 200000 },
];

export const CRM_BUNDLE_PRICE = 800000;

export const CRM_PLANS: Plan[] = [
  {
    name: "ベーシック",
    price: 19800,
    newFeatures: ["サーバー管理", "障害対応", "バックアップ"],
  },
  {
    name: "スタンダード",
    price: 49800,
    recommended: true,
    newFeatures: ["CSV取込支援", "ユーザー追加対応", "マスタ修正", "レポート作成"],
  },
  {
    name: "プレミアム",
    price: 99800,
    newFeatures: ["月2時間改修", "レポート作成", "運用改善（弊社分析）", "WEB連携サポート"],
  },
];

// ─── 予約システム ─────────────────────────────────────────
export const RESERVATION_INITIAL: PriceItem[] = [
  { name: "予約システム開発", price: 300000 },
];

export const RESERVATION_PLANS: Plan[] = [
  {
    name: "ベーシック",
    price: 30000,
    newFeatures: [
      "各種変更・スタッフ追加対応",
      "軽微修正",
      "障害対応・バックアップ",
      "サーバー管理",
    ],
  },
];

// ─── ユーティリティ ──────────────────────────────────────
export const fmtPrice = (p: Price): string =>
  p === null ? "要相談" : `¥${p.toLocaleString("ja-JP")}`;

/** planIndex 番目まで累積したフィーチャーを返す（後方互換用） */
export function getCumulativeFeatures(
  plans: Plan[],
  upToIndex: number
): { text: string; isNew: boolean }[] {
  const result: { text: string; isNew: boolean }[] = [];
  for (let i = 0; i <= upToIndex; i++) {
    plans[i].newFeatures.forEach((f) => {
      result.push({ text: f, isNew: i === upToIndex });
    });
  }
  return result;
}

/**
 * プランカード表示用: 前プランは "○○プランの全て。" 1行にまとめ、
 * 今プランの追加機能だけをリストアップする。
 */
export function getPlanDisplay(
  plans: Plan[],
  idx: number
): { summary: string | null; features: string[] } {
  const prevName = idx > 0 ? plans[idx - 1].name : "";
  const summary = idx > 0
    ? prevName.endsWith("プラン")
      ? `${prevName}の全て`
      : `${prevName}プランの全て`
    : null;
  return { summary, features: plans[idx].newFeatures };
}
