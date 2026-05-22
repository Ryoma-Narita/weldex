import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CTABand from "@/components/CTABand";

export const metadata: Metadata = {
  title: "料金プラン | Weldex",
  description:
    "AIを活用した効率化により、大手制作会社の3分の1以下のコストで同等以上のアウトプットを実現。ライト・スタンダード・エンタープライズの3プランをご用意。",
  alternates: { canonical: "https://weldex.jp/pricing" },
};

const plans = [
  {
    badge: "Light",
    name: "ライトプラン",
    price: "¥150,000",
    unit: "〜 税別",
    desc: "個人事業主・小規模クリニック向け。シンプルで信頼感のある顔をつくりたい方に。",
    features: [
      "5ページ以内のサイト制作",
      "スマホ最適化・SSL対応",
      "基本SEO設定",
      "お問い合わせフォーム",
      "Googleマップ・アナリティクス設定",
    ],
    featured: false,
  },
  {
    badge: "Most Popular",
    name: "スタンダードプラン",
    price: "¥350,000",
    unit: "〜 税別",
    desc: "中小企業・成長フェーズのクリニック・事務所向け。集客・予約・信頼を一気に底上げしたい方に。",
    features: [
      "10ページ以内のサイト制作",
      "SEO設計・競合分析込み",
      "LINE予約システム連携",
      "ブログ・お知らせ機能",
      "Google広告用LP制作",
      "公開後1ヶ月サポート込み",
    ],
    featured: true,
  },
  {
    badge: "Enterprise",
    name: "エンタープライズ",
    price: "要見積",
    unit: "ご相談ください",
    desc: "複数拠点・大規模クリニック・士業法人・建設会社など。システム開発込みの包括的な支援が必要な方に。",
    features: [
      "ページ数・機能制限なし",
      "カスタムシステム開発",
      "LINE本格運用設計",
      "採用サイト・LP複数対応",
      "月次保守・SEO継続改善",
      "専任担当者アサイン",
    ],
    featured: false,
  },
];

const options = [
  { label: "SEO強化パック", price: "¥80,000〜", desc: "キーワード戦略・競合分析・記事4本" },
  { label: "LINE予約システム構築", price: "¥80,000〜", desc: "リッチメニュー設計・予約連携・リマインド設定" },
  { label: "WEB予約システム", price: "¥120,000〜", desc: "管理画面・顧客管理・CSV出力込み" },
  { label: "月次保守プラン", price: "¥5,000〜 / 月", desc: "内容更新・SEO改善・トラブル対応" },
];

const aiPoints = [
  { title: "文章・コピー生成", desc: "業種特化のライティングをAIが担当" },
  { title: "デザイン補助", desc: "レイアウト・配色をAIがアシスト" },
  { title: "SEO分析", desc: "競合調査・キーワード設計をAIが処理" },
  { title: "コード品質", desc: "速度・セキュリティをAIが自動検出" },
];

export default function PricingPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      {/* ヒーロー */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,6rem) 4rem" }}>
        <FadeIn>
          <div className="sec-label">Pricing</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(30px,4vw,52px)",
            fontWeight: 900, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}>
            料金プラン
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--gray)", lineHeight: 2.0, maxWidth: 520 }}>
            AIを活用した効率化により、大手制作会社の3分の1以下のコストで
            同等以上のアウトプットを実現します。
          </p>
        </FadeIn>
      </div>

      {/* AI低コスト説明 */}
      <section style={{ background: "var(--navy)", padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="resp-2col">
              <div>
                <div className="sec-label" style={{ color: "var(--gold)" }}>Why Low Cost</div>
                <h2 style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900, color: "var(--white)",
                  lineHeight: 1.25, marginBottom: "1rem",
                }}>
                  AIを活用するから、<br />この価格が実現できる。
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.75)", lineHeight: 2.0 }}>
                  文章・デザイン・コード・SEO分析をAIが高速処理し、
                  人間はその品質チェックと戦略判断に集中。
                  大手の3分の1以下のコストで、本質的なアウトプットを届けます。
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "rgba(255,255,255,0.08)" }}>
                {aiPoints.map((p) => (
                  <div key={p.title} style={{ background: "rgba(255,255,255,0.04)", padding: "1.25rem 1.5rem" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gold)", marginBottom: "0.4rem" }}>{p.title}</div>
                    <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* プラン */}
      <section style={{ padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn style={{ marginBottom: "3rem" }}>
            <div className="sec-label">Plans</div>
            <h2 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.25 }}>
              3つのプラン
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 2, background: "var(--border)" }}>
            {plans.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.1} style={{
                background: p.featured ? "var(--navy)" : "var(--white)",
                padding: "2.5rem 2rem",
                position: "relative",
              }}>
                {p.featured && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: 3, background: "var(--gold)",
                  }} />
                )}
                <div style={{
                  display: "inline-block", fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: p.featured ? "var(--gold)" : "var(--light)",
                  border: `1px solid ${p.featured ? "var(--gold)" : "var(--border)"}`,
                  padding: "0.2rem 0.6rem", marginBottom: "1rem",
                }}>
                  {p.badge}
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: p.featured ? "var(--white)" : "var(--navy)", marginBottom: "0.5rem" }}>{p.name}</div>
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "2rem", fontWeight: 700,
                    color: p.featured ? "var(--gold)" : "var(--navy)",
                  }}>{p.price}</span>
                  <span style={{ fontSize: "0.75rem", color: p.featured ? "rgba(255,255,255,0.5)" : "var(--light)", marginLeft: 6 }}>{p.unit}</span>
                </div>
                <p style={{ fontSize: "0.9375rem", color: p.featured ? "rgba(255,255,255,0.75)" : "var(--gray)", lineHeight: 2.0, marginBottom: "1.5rem" }}>
                  {p.desc}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem", color: p.featured ? "rgba(255,255,255,0.8)" : "var(--gray)" }}>
                      <span style={{ color: "var(--gold)", flexShrink: 0 }}>→</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={p.featured ? "btn btn-primary" : "btn btn-outline"}
                  style={{ fontSize: "0.8rem" }}
                >
                  相談する
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* オプション */}
      <section style={{ background: "var(--off)", borderTop: "1px solid var(--border)", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn style={{ marginBottom: "2.5rem" }}>
            <div className="sec-label">Options</div>
            <h2 style={{ fontSize: "clamp(22px,2.5vw,36px)", fontWeight: 900, color: "var(--navy)", lineHeight: 1.25 }}>
              オプションサービス
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 2, background: "var(--border)" }}>
            {options.map((o, i) => (
              <FadeIn key={o.label} delay={i * 0.08} style={{ background: "var(--white)", padding: "1.25rem 1.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--light)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{o.label}</div>
                <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.4rem" }}>{o.price}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--gray)" }}>{o.desc}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </main>
  );
}
