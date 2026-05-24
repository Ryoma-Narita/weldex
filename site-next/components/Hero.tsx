import Link from "next/link";
import Image from "next/image";
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

        <FadeIn delay={0.35}>
          <p style={{
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            color: "var(--gray)",
            lineHeight: 1.85,
            marginBottom: "2.5rem",
            maxWidth: 480,
          }}>
            WEBサイト制作からLINE・WEB予約システム・システム開発まで、<br />
            AIを活用した低コスト・高品質なデジタル支援を提供します。
          </p>
        </FadeIn>

        <FadeIn delay={0.5} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3.5rem" }}>
          <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
          <Link href="/services" className="btn btn-outline">サービスを見る</Link>
        </FadeIn>

        <FadeIn delay={0.65}>
          <p style={{
            fontSize: "clamp(0.8rem, 1.3vw, 0.9375rem)",
            color: "var(--gray)",
            lineHeight: 1.9,
            borderLeft: "2px solid var(--gold)",
            paddingLeft: "1rem",
            maxWidth: 420,
          }}>
            AIが反復を担い、人間が本質を設計する。<br />
            それがWeldexのコスト優位の源泉です。
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
