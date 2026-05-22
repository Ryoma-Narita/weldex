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
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}>
        <Image
          src="/hero-tech.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center right" }}
          priority
          aria-hidden="true"
        />
        {/* 左から白へのグラデーションオーバーレイ：左=完全白、中央=うっすら、右=画像そのまま */}
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

        <FadeIn delay={0.65} style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
          {[
            { num: "低コスト", lbl: "大手比の価格" },
            { num: "多数", lbl: "制作実績" },
            { num: "高い", lbl: "顧客満足度" },
          ].map((s) => (
            <div key={s.lbl} style={{ borderLeft: "2px solid var(--gold)", paddingLeft: "0.85rem" }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(1.2rem, 4vw, 2rem)",
                fontWeight: 700,
                color: "var(--navy)",
                lineHeight: 1,
              }}>{s.num}</span>
              <span style={{
                fontSize: "0.68rem",
                color: "var(--gray)",
                letterSpacing: "0.06em",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {s.lbl}
              </span>
            </div>
          ))}
        </FadeIn>
      </div>
    </div>
  );
}
