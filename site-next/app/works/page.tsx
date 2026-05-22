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
            気になる方はお気軽にお試しください。
          </p>
        </FadeIn>

        {/* カルーセル */}
        <FadeIn delay={0.1}>
          <WorksCarousel />
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
