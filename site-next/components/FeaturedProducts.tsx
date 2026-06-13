import Image from "next/image";
import Link from "next/link";
import FadeIn from "./FadeIn";

const NAVY = "#0c1a35";
const GRAY = "#4b5563";

const PRODUCTS = [
  {
    label: "Reservation",
    title: "WEB予約システム",
    desc: "24時間自動受付・前日リマインド・顧客管理まで一式。歯科・クリニック・サロンで導入が進む主力プロダクト。",
    img: "/images/services/reservation.png",
    href: "/services/reservation",
    accent: "#0ea5e9",
  },
  {
    label: "CRM",
    title: "独自CRM（顧客管理）",
    desc: "顧客情報・取引履歴を一元管理。予約・LINE・サイトと自由に連携できる、貴社専用の顧客管理システム。",
    img: "/images/services/crm.png",
    href: "/services/crm",
    accent: "#7c3aed",
  },
];

/**
 * トップページの「4つの柱」直下に置く代表プロダクト紹介。
 * 主力である予約システムと独自CRMを、画像付きカードで訴求する。
 */
export default function FeaturedProducts() {
  return (
    <section style={{ background: "var(--off)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem clamp(1.5rem,5vw,3rem)" }}>
        <FadeIn style={{ marginBottom: "2.5rem" }}>
          <div className="sec-label">Featured Products</div>
          <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            代表プロダクト
          </h2>
          <p className="sec-desc" style={{ marginTop: "0.75rem", maxWidth: 560 }}>
            システム開発の中でも、特に導入実績の多い2つのプロダクトです。
          </p>
        </FadeIn>

        <div className="fp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1.5rem" }}>
          {PRODUCTS.map((p, i) => (
            <FadeIn key={p.title} delay={0.08 + i * 0.1}>
              <Link href={p.href} className="fp-card" style={{ textDecoration: "none", display: "block", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", height: "100%" }}>
                {/* 画像 */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                  <Image
                    src={p.img}
                    alt={p.title}
                    fill
                    sizes="(max-width: 720px) 100vw, 45vw"
                    className="fp-img"
                    style={{ objectFit: "cover" }}
                  />
                  <span style={{ position: "absolute", top: "0.9rem", left: "0.9rem", background: p.accent, color: "#fff", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.25rem 0.7rem", borderRadius: 100, fontFamily: "'DM Sans', sans-serif" }}>
                    {p.label}
                  </span>
                </div>
                {/* テキスト */}
                <div style={{ padding: "1.5rem 1.6rem 1.6rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: NAVY, lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "0.7rem" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: GRAY, lineHeight: 1.85, marginBottom: "1.1rem" }}>
                    {p.desc}
                  </p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 700, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>
                    詳しく見る
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h9M7 2.5L11.5 7 7 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>

      <style>{`
        .fp-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .fp-card:hover { transform: translateY(-6px); box-shadow: 0 24px 56px rgba(12,26,53,0.14); }
        .fp-img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
        .fp-card:hover .fp-img { transform: scale(1.05); }
        @media (max-width: 720px) {
          .fp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
