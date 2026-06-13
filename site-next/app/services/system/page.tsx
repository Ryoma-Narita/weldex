import type { Metadata } from "next";
import Link from "next/link";
import ServiceHero from "@/components/ServiceHero";

export const metadata: Metadata = {
  title: "システム開発 | Weldex",
  description:
    "予約システム・顧客管理・在庫管理・業務自動化など、貴社の業務に合わせた独自システムをAIでゼロから開発。大手の1/3以下のコストで、必要な機能だけを一社完結で構築します。",
  alternates: { canonical: "https://weldex.jp/services/system" },
};

const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const ACCENT = "#4f46e5";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

// ─── なぜWeldexか ───────────────────────────────
const STRENGTHS = [
  { icon: "🤖", title: "AIで低コスト",   value: "大手の1/3以下", note: "設計・実装にAIを活用し、開発工数とコストを圧縮" },
  { icon: "✏️", title: "ゼロから設計",   value: "フルオーダー",  note: "既製SaaSと違い、業務フローに合わせて必要機能だけを構築" },
  { icon: "🔗", title: "一社完結",       value: "連携まで一気通貫", note: "予約・LINE・CRM・サイトを同一担当者がまとめて連携" },
  { icon: "🛡️", title: "保守まで対応",  value: "公開後も伴走",  note: "障害対応・改善・機能追加まで継続的にサポート" },
];

// ─── 代表プロダクト ─────────────────────────────
const PRODUCTS = [
  {
    badge: "代表プロダクト",
    title: "WEB予約システム",
    desc: "24時間自動受付・前日リマインド・顧客管理まで一式。歯科・クリニック・サロンを中心に導入実績のある、Weldexの主力プロダクトです。",
    href: "/services/reservation",
    cta: "予約システムの詳細を見る",
    featured: true,
  },
  {
    badge: "プロダクト",
    title: "顧客管理システム（CRM）",
    desc: "顧客情報・取引履歴・コミュニケーション履歴を一元管理。予約システムと連携し、リピート率向上・離脱防止につなげます。",
    href: "/services/crm",
    cta: "CRMの詳細を見る",
    featured: false,
  },
];

// ─── 開発できるシステムの例 ─────────────────────
const EXAMPLES = [
  "予約・受付管理",
  "顧客管理（CRM）",
  "在庫・受発注管理",
  "勤怠・シフト管理",
  "見積・請求の自動化",
  "社内ポータル・業務ツール",
  "データ集計・ダッシュボード",
  "LINE・外部API連携",
  "問い合わせ・申込フォーム",
];

function SecLabel({ children }: { children: string }) {
  return (
    <p style={{ ...DM, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: "0.65rem" }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: string }) {
  return (
    <h2 style={{ ...ZEN, fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: NAVY, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
      {children}
    </h2>
  );
}

export default function SystemServicePage() {
  return (
    <>
      <style>{`
        .sys-section { border-bottom: 1px solid ${BORDER}; }
        .sys-inner   { max-width: 1080px; margin: 0 auto; padding: 5rem clamp(1.5rem,5vw,5rem); }
        .sys-strength-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-top: 2.5rem; }
        .sys-product-grid  { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.25rem; margin-top: 2.5rem; align-items: stretch; }
        .sys-example-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-top: 2rem; }
        @media (max-width: 768px) {
          .sys-inner          { padding: 3rem 20px; }
          .sys-strength-grid  { grid-template-columns: 1fr 1fr; }
          .sys-product-grid   { grid-template-columns: 1fr; }
          .sys-example-grid   { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <main>
        {/* ─── ヒーロー ─── */}
        <ServiceHero
          crumb="システム開発"
          tag="システム開発"
          accent={ACCENT}
          image="/images/services/system.png"
          imageAlt="システム開発のイメージ"
          title={<>業務の課題を、<br /><em style={{ color: GOLD, fontStyle: "normal" }}>システムで解く。</em></>}
          desc={<>予約・顧客管理・在庫・業務自動化など、貴社の業務に合わせた独自システムをAIでゼロから開発。「使わない機能に払う」既製SaaSではなく、必要な仕組みだけを低コストで構築します。</>}
        />

        {/* ─── なぜWeldexか ─── */}
        <section className="sys-section" style={{ background: BG_L }}>
          <div className="sys-inner">
            <SecLabel>Why Weldex</SecLabel>
            <H2>Weldexのシステム開発</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, maxWidth: 640 }}>
              「既製ツールだと自社の業務に合わない」「フルスクラッチは見積もりが高すぎる」。
              Weldexはその間を埋めます。AIを活用して開発工数を圧縮し、
              貴社の業務フローに合わせたシステムを、大手の1/3以下のコストでゼロから構築します。
            </p>

            <div className="sys-strength-grid">
              {STRENGTHS.map(c => (
                <div key={c.title} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "1.25rem 1rem" }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{c.icon}</div>
                  <div style={{ ...DM, fontSize: "0.68rem", color: GRAY, fontWeight: 500, letterSpacing: "0.04em", marginBottom: "0.2rem" }}>{c.title}</div>
                  <div style={{ ...ZEN, fontSize: "0.95rem", fontWeight: 700, color: NAVY, marginBottom: "0.35rem" }}>{c.value}</div>
                  <div style={{ ...ZEN, fontSize: "0.72rem", color: GRAY, lineHeight: 1.5 }}>{c.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 代表プロダクト ─── */}
        <section className="sys-section" style={{ background: "#fff" }}>
          <div className="sys-inner">
            <SecLabel>Products</SecLabel>
            <H2>代表的なプロダクト</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, maxWidth: 640 }}>
              これまでに開発したシステムの一例です。いずれもパッケージ販売ではなく、
              導入先の業務に合わせてカスタマイズしています。
            </p>

            <div className="sys-product-grid">
              {PRODUCTS.map(p => (
                <Link key={p.title} href={p.href} style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  background: p.featured ? NAVY : "#fff",
                  border: p.featured ? `2px solid ${NAVY}` : `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "2rem 1.75rem",
                }}>
                  <span style={{ ...DM, alignSelf: "flex-start", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: p.featured ? GOLD : ACCENT, padding: "0.2rem 0.6rem", borderRadius: 100, marginBottom: "1rem" }}>
                    {p.badge}
                  </span>
                  <h3 style={{ ...ZEN, fontSize: "1.15rem", fontWeight: 800, color: p.featured ? "#fff" : NAVY, marginBottom: "0.75rem", lineHeight: 1.3 }}>
                    {p.title}
                  </h3>
                  <p style={{ ...ZEN, fontSize: "0.82rem", color: p.featured ? "rgba(255,255,255,0.8)" : GRAY, lineHeight: 1.8, flex: 1 }}>
                    {p.desc}
                  </p>
                  <span style={{ ...DM, marginTop: "1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: p.featured ? GOLD : NAVY }}>
                    {p.cta}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h9M7 2.5L11.5 7 7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 開発できるシステムの例 ─── */}
        <section className="sys-section" style={{ background: BG_L }}>
          <div className="sys-inner">
            <SecLabel>What We Build</SecLabel>
            <H2>開発できるシステムの例</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, maxWidth: 640 }}>
              下記はあくまで一例です。「こんな業務を自動化したい」「この作業を1つの画面でまとめたい」
              といったご相談から、最適な仕組みをご提案します。
            </p>

            <div className="sys-example-grid">
              {EXAMPLES.map(e => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "#fff", border: `1px solid ${BORDER}`, padding: "0.85rem 1rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                  <span style={{ ...ZEN, fontSize: "0.85rem", color: NAVY, fontWeight: 500 }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="svc-cta" style={{ background: "#f8f9fb", padding: "6rem clamp(1.5rem,5vw,5rem)", textAlign: "center" }}>
          <p style={{ ...DM, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>Contact</p>
          <h2 style={{ ...ZEN, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: NAVY, marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
            まずは、課題を聞かせてください。
          </h2>
          <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.85, marginBottom: "2.5rem" }}>
            「これってシステムにできる？」という段階で構いません。<br />
            実現可否・費用・進め方を無料でご提案します。
          </p>
          <Link href="/contact" style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.04em", ...DM }}>
            無料相談をする
          </Link>
        </section>
      </main>
    </>
  );
}
