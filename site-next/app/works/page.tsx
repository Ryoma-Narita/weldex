import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CTABand from "@/components/CTABand";
import WorksCarousel from "./WorksCarousel";

export const metadata: Metadata = {
  title: "制作実績・デモ | Weldex",
  description:
    "WEB予約システム・管理画面・LINE予約など、実際に動くデモをご用意しています。歯科・士業・建設・美容サロンなどあらゆる業種に対応可能です。",
  alternates: { canonical: "https://weldex.jp/works" },
};

const industries = [
  { name: "歯科・クリニック", href: "/services/dental" },
  { name: "士業・法律事務所", href: "/services/legal" },
  { name: "建設・工務店", href: "/services/construction" },
  { name: "美容・サロン", href: "/services/beauty" },
];

export default function WorksPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,6rem) 6rem" }}>

        <FadeIn style={{ marginBottom: "4rem", textAlign: "center" }}>
          <div className="sec-label" style={{ justifyContent: "center" }}>Works &amp; Demo</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(30px,4vw,52px)",
            fontWeight: 900, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}>
            制作実績・デモ
          </h1>
          <p style={{
            fontSize: "0.9375rem", color: "var(--gray)",
            lineHeight: 2.0, maxWidth: 440, margin: "0 auto",
          }}>
            実際に動くデモをご用意しています。<br />
            商談の場でそのままお見せいただけます。
          </p>
        </FadeIn>

        {/* カルーセル */}
        <FadeIn delay={0.1}>
          <WorksCarousel />
        </FadeIn>

        {/* 直リンクセクション */}
        <FadeIn delay={0.15} style={{ marginTop: "4rem" }}>
          <div style={{
            background: "var(--navy)", borderRadius: 2,
            padding: "2.5rem clamp(1.5rem,4vw,3rem)",
          }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Share Demo
            </div>
            <h2 style={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 900, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.3 }}>
              このURLを商談相手にそのまま送れます
            </h2>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginBottom: "2rem", lineHeight: 1.8 }}>
              アプリ不要・ログイン不要。URLを貼るだけで相手がすぐ試せます。
            </p>
            <style>{`.demo-link:hover { background: rgba(255,255,255,0.12) !important; }`}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "WEB予約フォーム", url: "https://weldex.jp/booking", desc: "予約フロー体験（スマホ対応）" },
                { label: "管理ダッシュボード", url: "https://weldex.jp/demo-dashboard", desc: "予約管理・顧客CRM・統計" },
              ].map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="demo-link"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "1rem 1.25rem", textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", marginBottom: "0.2rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{item.desc}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0, marginLeft: "1rem" }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.04em", fontWeight: 600 }}>weldex.jp</span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>→ 開く</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 業種別LP誘導 */}
        <FadeIn delay={0.2} style={{ marginTop: "6rem" }}>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "4rem" }}>
            <div className="sec-label">Industries</div>
            <h2 style={{
              fontSize: "clamp(22px,2.5vw,36px)",
              fontWeight: 900, color: "var(--navy)", lineHeight: 1.25, marginBottom: "0.75rem",
            }}>
              業種別の導入事例
            </h2>
            <p style={{
              fontSize: "0.9375rem", color: "var(--gray)",
              lineHeight: 2.0, marginBottom: "2rem",
            }}>
              業種ごとの課題・解決策・よくあるご質問をまとめています。
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {industries.map((ind) => (
                <Link key={ind.name} href={ind.href} className="btn btn-outline" style={{ fontSize: "0.82rem" }}>
                  {ind.name} →
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

      </div>

      <CTABand />
    </main>
  );
}
