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
  { name: "建設・工務店",     href: "/services/construction" },
  { name: "美容・サロン",     href: "/services/beauty" },
];

export default function WorksPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section style={{
        position: "relative",
        background: "var(--navy)",
        minHeight: "68vh",
        display: "flex",
        alignItems: "flex-end",
        padding: "10rem clamp(1.5rem, 5vw, 6rem) 5rem",
        overflow: "hidden",
      }}>
        <div aria-hidden="true" style={{
          position: "absolute",
          top: "50%", right: "-3%",
          transform: "translateY(-50%)",
          fontSize: "clamp(9rem, 25vw, 20rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "rgba(201,168,76,0.04)",
          userSelect: "none",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
        }}>
          WORKS
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="sec-label" style={{ color: "var(--gold)" }}>Works &amp; Demo</div>
          <h1 style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 6rem)",
            fontWeight: 900,
            color: "var(--white)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
          }}>
            実際に触れて、<br />
            <em style={{ color: "var(--gold)", fontStyle: "normal" }}>体験してください。</em>
          </h1>
          <p style={{
            fontSize: "clamp(0.9375rem, 1.4vw, 1.05rem)",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 2.0,
            maxWidth: 460,
          }}>
            ログイン不要・アプリ不要。<br />
            完全動作するデモを今すぐお試しいただけます。
          </p>
        </div>
      </section>

      {/* ── カルーセル ── */}
      <section style={{ padding: "6rem clamp(1.5rem,5vw,6rem)", maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <WorksCarousel />
        </FadeIn>
      </section>

      {/* ── Share Demo ── */}
      <section style={{ padding: "0 clamp(1.5rem,5vw,6rem) 6rem", maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <div style={{
            background: "var(--navy)",
            padding: "3rem clamp(1.5rem,4vw,3.5rem)",
          }}>
            <div style={{
              fontSize: "0.65rem", fontWeight: 700,
              letterSpacing: "0.18em", color: "var(--gold)",
              textTransform: "uppercase", marginBottom: "0.5rem",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Share Demo
            </div>
            <p style={{
              fontSize: "0.85rem", color: "rgba(255,255,255,0.45)",
              marginBottom: "2rem", lineHeight: 1.8,
            }}>
              商談・ご説明の際にそのままシェアいただけます。
            </p>
            <style>{`.demo-link:hover { background: rgba(255,255,255,0.12) !important; }`}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "WEB予約フォーム",    url: "https://weldex.jp/booking",       desc: "予約フロー体験（スマホ対応）" },
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
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", marginBottom: "0.2rem" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    gap: "0.25rem", flexShrink: 0, marginLeft: "1rem",
                  }}>
                    <span style={{ fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.04em", fontWeight: 600 }}>
                      weldex.jp
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>→ 開く</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── 業種別LP誘導 ── */}
      <section style={{
        padding: "5rem clamp(1.5rem,5vw,6rem)",
        borderTop: "1px solid var(--border)",
        background: "var(--off)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <div className="sec-label">Industries</div>
            <h2 style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              color: "var(--navy)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}>
              業種別の導入事例
            </h2>
            <p style={{
              fontSize: "0.9375rem", color: "var(--gray)",
              lineHeight: 2.0, marginBottom: "2.5rem", maxWidth: 480,
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
          </FadeIn>
        </div>
      </section>

      <CTABand />
    </main>
  );
}
