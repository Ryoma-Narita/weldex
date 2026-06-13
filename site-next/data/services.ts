/**
 * サービス定義の単一ソース（Single Source of Truth）
 *
 * 料金・説明・特徴はすべてここで管理する。
 * 使用箇所: app/services/page.tsx・app/pricing/page.tsx・components/PriceTeaser.tsx
 * 料金改定時はこのファイルだけを変更すること。
 */

export interface Service {
  num: string;
  slug: "web" | "reservation" | "line" | "crm";
  tag: string;
  title: string;
  /** 初期費用（円・税抜） */
  priceFrom: number;
  /** 月額保守（円・税抜） */
  monthlyFrom: number;
  /** サービス一覧ページの説明文 */
  desc: string;
  /** サービス一覧ページの特徴タグ */
  features: string[];
  /** 料金ページの箇条書き */
  points: string[];
  /** トップページ料金ティーザーの補足 */
  teaserNote: string;
  href: string;
}

/** 数値を「150,000」形式にフォーマットする */
export const fmtYen = (n: number): string => n.toLocaleString("ja-JP");

export const SERVICES: Service[] = [
  {
    num: "01",
    slug: "web",
    tag: "HP / LP",
    title: "ホームページ制作",
    priceFrom: 300000,
    monthlyFrom: 12000,
    desc: "集客・信頼・問い合わせ増加を目的とした、業種特化のWebサイトを制作します。SEO対応・スマホ最適化・お問い合わせフォームまで含みます。",
    features: ["業種特化デザイン", "SEO対応", "スマホ最適化", "Formspreeフォーム設置", "公開後1ヶ月サポート"],
    points: [
      "デザイン・コーディング・公開まで一式",
      "スマホ最適化・SEO対応含む",
      "保守プランで更新・修正に対応",
    ],
    teaserNote: "スマホ対応・SEO込み",
    href: "/services/web",
  },
  {
    num: "02",
    slug: "reservation",
    tag: "予約 / 管理",
    title: "WEB予約システム",
    priceFrom: 300000,
    monthlyFrom: 30000,
    desc: "24時間自動で予約を受け付ける管理画面付きの予約システムです。歯科・クリニック・サロンなど幅広い業種に対応します。",
    features: ["24時間自動受付", "管理画面付き", "メール自動返信", "顧客管理・CSV出力", "前日リマインド"],
    points: [
      "予約フォーム・管理画面・自動メール一式",
      "前日リマインド・顧客管理・CSV出力",
      "保守プランで機能追加・サポートに対応",
    ],
    teaserNote: "カレンダー予約・管理画面",
    href: "/services/reservation",
  },
  {
    num: "03",
    slug: "line",
    tag: "LINE / 代行",
    title: "LINE連携・アカウント作成代行",
    priceFrom: 50000,
    monthlyFrom: 19800,
    desc: "LINE公式アカウントの開設から設定・予約システム連携・リッチメニュー制作まで一社完結で代行します。LINEを使った顧客との接点づくりをまるごとお任せいただけます。",
    features: ["LINE公式アカウント開設代行", "リッチメニュー制作", "予約システム連携", "自動メッセージ設定", "運用サポート"],
    points: [
      "LINE公式アカウント開設・初期設定代行",
      "リッチメニュー制作・予約システム連携",
      "保守プランで運用サポートに対応",
    ],
    teaserNote: "公式アカウント開設代行",
    href: "/services/line",
  },
  {
    num: "04",
    slug: "crm",
    tag: "CRM / 顧客管理",
    title: "顧客管理システム（CRM）",
    priceFrom: 350000,
    monthlyFrom: 19800,
    desc: "顧客情報・来院履歴・コミュニケーション履歴を一元管理。予約システムとシームレスに連携し、リピート率向上・離脱防止につながる顧客DXを実現します。",
    features: ["顧客情報一元管理", "予約履歴連携", "CSV入出力", "自動フォローアップ", "レポート・分析機能"],
    points: [
      "顧客情報・来歴・コミュニケーションを一元管理",
      "予約システムとのシームレスな連携",
      "自動フォローアップ・レポート機能",
    ],
    teaserNote: "予約・LINE・WEBと自由に連携できる独自CRM",
    href: "/services/crm",
  },
];

/** 月額保守の最低価格（トップページ料金ティーザーで使用） */
export const MAINTENANCE_FROM = Math.min(...SERVICES.map((s) => s.monthlyFrom));
