import Image from "next/image";
import Link from "next/link";
import FadeIn from "./FadeIn";

export default function Hero() {
  return (
    <div style={{
      minHeight: "100svh",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      padding: "8rem clamp(1.5rem, 5vw, 6rem) 5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* 画像：ヒーロー全体を覆い、左側がうっすら見えるグラデーション */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/hero-tech.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center right" }}
          priority
          aria-hidden="true"
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.92) 52%, rgba(255,255,255,0.45) 65%, rgba(255,255,255,0.05) 82%, rgba(255,255,255,0) 100%)",
        }} />
      </div>

      {/* テキストコンテンツ：左側 */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 580 }}>
        <FadeIn delay={0.1} style={{
          fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em",
          color: "var(--gold)", textTransform: "uppercase", marginBottom: "1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--gold)" }} />
          AI-Powered Digital Partner
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 700,
            color: "var(--navy)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
          }}>
            AIで、あなたの事業の<br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>本質</em>を支える。
          </h1>
        </FadeIn>

        <FadeIn delay={0.28}>
          <Link href="/diagnosis" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "var(--gold)", color: "var(--navy)",
            padding: "0.55rem 1.1rem", fontSize: "0.75rem", fontWeight: 700,
            textDecoration: "none", letterSpacing: "0.06em", marginBottom: "1.5rem",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            サイトを無料診断する →
          </Link>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p style={{
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            color: "var(--gray)",
            lineHeight: 1.85,
            marginBottom: "2rem",
            maxWidth: 480,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            padding: "0.5rem 0.75rem",
            borderRadius: 4,
          }}>
            WEBサイト制作・LINE予約システム・システム開発まで、<br />
            大手の1/3以下のコストで一社完結のデジタル支援を提供します。
          </p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div style={{
            borderLeft: "2px solid var(--gold)",
            maxWidth: 440,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(4px)",
            padding: "0.75rem 0.75rem 0.75rem 1rem",
            borderRadius: "0 4px 4px 0",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}>
            {[
              "AIが予約リマインドを自動送信 → 無断キャンセル率を削減",
              "AIが営業メールを自動生成 → 月多数の企業に自動アプローチ",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "0.5rem",
                fontSize: "clamp(0.78rem, 1.2vw, 0.875rem)",
                color: "var(--gray)", lineHeight: 1.65,
              }}>
                <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
