import Link from "next/link";
import FadeIn from "./FadeIn";

export default function Hero() {
  return (
    <div style={{
      minHeight: "100svh", background: "var(--navy)",
      display: "flex", alignItems: "center",
      padding: "8rem clamp(1.5rem, 5vw, 6rem) 5rem",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 70% 50%, #162645 0%, #0c1a35 100%)",
      }} />
      <div style={{
        position: "absolute", top: "10%", right: "5%",
        width: "clamp(300px,40vw,600px)", aspectRatio: "1",
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        borderRadius: "50%", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
        <FadeIn delay={0.1} style={{
          fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.15em",
          color: "var(--gold)", textTransform: "uppercase", marginBottom: "1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--gold)" }} />
          AI-Powered Digital Partner
        </FadeIn>

        <FadeIn delay={0.2}>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 700, color: "var(--white)",
            lineHeight: 1.15, letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
          }}>
            AIで、あなたの事業の<br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>本質</em>を支える。
          </h1>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p style={{
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            color: "rgba(255,255,255,0.7)", fontWeight: 300,
            lineHeight: 1.85, marginBottom: "2.5rem", maxWidth: 500,
          }}>
            WEBサイト制作からLINE・WEB予約システム・システム開発まで、
            AIを活用した低コスト・高品質なデジタル支援を提供します。
          </p>
        </FadeIn>

        <FadeIn delay={0.5} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3.5rem" }}>
          <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
          <Link href="/services" className="btn btn-outline-white">サービスを見る</Link>
        </FadeIn>

        <FadeIn delay={0.65} style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
          {[
            { num: "低コスト", lbl: "大手比の価格" },
            { num: "多数", lbl: "制作実績" },
            { num: "高い", lbl: "顧客満足度" },
          ].map((s) => (
            <div key={s.lbl}>
              <span style={{
                display: "block", fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(1.4rem, 5vw, 2.6rem)", fontWeight: 700,
                color: "var(--white)", lineHeight: 1,
              }}>{s.num}</span>
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>
                {s.lbl}
              </span>
            </div>
          ))}
        </FadeIn>
      </div>
    </div>
  );
}
