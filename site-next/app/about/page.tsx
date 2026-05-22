import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Weldex",
  description:
    "Weldexの理念・価値観・技術スタック。AIを活用し中小企業のデジタル変革を支援する個人事業主の成田涼真について。",
  alternates: { canonical: "https://weldex.jp/about" },
};

const VALUES = [
  {
    num: "01",
    title: "誠実さ",
    desc: "価格競争ではなく、本質的な価値で勝負する。クライアントの課題を自分事として捉え、最善の解を届けることに全力を注ぐ。",
  },
  {
    num: "02",
    title: "一貫性",
    desc: "小さなランディングページも、複雑なシステムも、同じ熱量と品質で向き合う。規模に関係なく、プロとして一貫して対応する。",
  },
  {
    num: "03",
    title: "シンプル",
    desc: "複雑にしない。本当に必要なものだけを過不足なく丁寧に実装する。余計な機能で混乱させない、クリーンな体験を追求する。",
  },
];

const STACK = [
  "Next.js", "TypeScript", "React", "Python",
  "FastAPI", "SQLite", "LINE Messaging API",
  "SendGrid", "Vercel", "Cloudflare Pages", "Tailwind CSS",
];

export default function AboutPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--navy)",
        minHeight: "82vh",
        display: "flex",
        alignItems: "center",
        padding: "8rem clamp(1.5rem, 5vw, 6rem) 6rem",
      }}>
        {/* Watermark */}
        <div aria-hidden="true" style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(7rem, 23vw, 17rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: "rgba(201,168,76,0.042)",
          userSelect: "none",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
        }}>
          WELDEX
        </div>

        {/* Rotating rings */}
        <div aria-hidden="true" className="about-ring-wrap">
          <div className="about-ring-outer" />
          <div className="about-ring-inner" />
        </div>

        {/* Hero content */}
        <div style={{
          position: "relative", zIndex: 1, maxWidth: 680,
          animation: "aboutHeroIn 0.9s ease 0.2s both",
        }}>
          <div className="sec-label" style={{ color: "var(--gold)" }}>
            About Weldex
          </div>

          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(3rem, 7vw, 5.8rem)",
            fontWeight: 900,
            color: "var(--white)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: "1.75rem",
          }}>
            技術で、<br />
            小さな会社を<br />
            <em style={{ color: "var(--gold)", fontStyle: "normal" }}>強くする。</em>
          </h1>

          <p style={{
            fontSize: "clamp(0.9375rem, 1.5vw, 1.05rem)",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 2.0,
            maxWidth: 500,
          }}>
            Weldexは、医療・士業・建設などの中小企業向けに、<br />
            AIを活用したWEB制作・予約システム・LINE連携を<br />
            大手の1/3以下のコストで提供する個人事業です。
          </p>
        </div>
      </section>

      {/* ── Philosophy & Values ── */}
      <section style={{
        background: "#f8f9fc",
        padding: "7rem clamp(1.5rem, 5vw, 6rem)",
      }}>
        <div style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "start",
        }} className="resp-2col">

          {/* Left: blockquote */}
          <div>
            <div className="sec-label">Philosophy</div>
            <blockquote style={{
              borderLeft: "2px solid var(--gold)",
              paddingLeft: "2rem",
              margin: "2rem 0 2.5rem",
            }}>
              <p style={{
                fontSize: "clamp(1.05rem, 2.2vw, 1.45rem)",
                fontWeight: 700,
                color: "var(--navy)",
                lineHeight: 1.78,
                letterSpacing: "-0.01em",
              }}>
                &ldquo;技術を安売りせず、<br />
                誠実に向き合う。<br />
                それがWeldexの<br />
                存在理由です。&rdquo;
              </p>
              <footer style={{
                marginTop: "1.25rem",
                fontSize: "0.75rem",
                color: "var(--gray)",
                letterSpacing: "0.06em",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                — 成田 涼真 / Founder
              </footer>
            </blockquote>

            <p style={{
              fontSize: "0.9375rem",
              color: "var(--gray)",
              lineHeight: 2.0,
              maxWidth: 400,
            }}>
              大手制作会社への対抗軸は「価格」だけではありません。
              レスポンスの速さ、クライアントへの理解、そして実装品質—
              その全てで期待を超えることを目指しています。
            </p>
          </div>

          {/* Right: numbered value cards */}
          <div>
            <div className="sec-label">Values</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem", marginTop: "2rem" }}>
              {VALUES.map((v, i) => (
                <div
                  key={v.num}
                  style={{
                    borderBottom: i < VALUES.length - 1 ? "1px solid var(--border)" : "none",
                    paddingBottom: i < VALUES.length - 1 ? "2.25rem" : 0,
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "var(--gold)",
                    paddingTop: "0.35rem",
                    flexShrink: 0,
                  }}>
                    {v.num}
                  </span>
                  <div>
                    <h3 style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--navy)",
                      marginBottom: "0.5rem",
                    }}>
                      {v.title}
                    </h3>
                    <p style={{
                      fontSize: "0.9375rem",
                      color: "var(--gray)",
                      lineHeight: 2.0,
                    }}>
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{
        background: "var(--white)",
        padding: "5.5rem clamp(1.5rem, 5vw, 6rem)",
        borderTop: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="sec-label">Tech Stack</div>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: 900,
            color: "var(--navy)",
            lineHeight: 1.25,
            marginBottom: "2.5rem",
            letterSpacing: "-0.01em",
          }}>
            使用技術
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
            {STACK.map(tag => (
              <span key={tag} style={{
                display: "inline-block",
                border: "1px solid var(--border)",
                padding: "0.45rem 1.1rem",
                fontSize: "0.78rem",
                color: "var(--navy)",
                fontWeight: 500,
                letterSpacing: "0.02em",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{
            marginTop: "4.5rem",
            paddingTop: "3rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}>
            <p style={{ fontSize: "0.9375rem", color: "var(--gray)", lineHeight: 2.0 }}>
              まずはお気軽にご相談ください。初回相談は無料です。
            </p>
            <div>
              <Link href="/contact" className="btn btn-primary">
                無料相談をする
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
