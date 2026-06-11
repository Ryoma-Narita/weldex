import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CTABand from "@/components/CTABand";
import { SERVICES, fmtYen } from "@/data/services";

export const metadata: Metadata = {
  title: "サービス一覧 | Weldex",
  description:
    "ホームページ制作・WEB予約システム・LINE連携代行・顧客管理システムの4サービスを一社完結で提供。費用・納期の目安もご確認いただけます。",
  alternates: { canonical: "https://weldex.jp/services" },
};

export default function ServicesPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,6rem) 5rem" }}>
        <FadeIn>
          <div className="sec-label">Services</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(30px,4vw,52px)",
            fontWeight: 900, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}>
            サービス一覧
          </h1>
          <p style={{
            fontSize: "0.9375rem", color: "var(--gray)",
            lineHeight: 2.0, marginBottom: "4rem", maxWidth: 480,
          }}>
            制作から運用まで一社完結。<br />
            業種・規模に合わせてご提案します。
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "var(--border)" }}>
          {SERVICES.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.1} style={{ background: "var(--white)", padding: "3rem clamp(1.5rem,4vw,3rem)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant)", fontSize: "2.5rem",
                    fontWeight: 700, color: "var(--border)", lineHeight: 1,
                  }}>{s.num}</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 500, letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{s.tag}</div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.3 }}>{s.title}</h2>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.9rem", fontWeight: 500, color: "var(--navy)",
                  borderBottom: "1px solid var(--gold)", paddingBottom: 2,
                }}>
                  {fmtYen(s.priceFrom)}円〜
                </span>
              </div>

              <p style={{ fontSize: "0.9375rem", color: "#1f2937", lineHeight: 2.0, marginBottom: "1.5rem", maxWidth: 640, fontFamily: "'Noto Sans JP', sans-serif" }}>
                {s.desc}
              </p>

              <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0 }}>
                {s.features.map((f) => (
                  <li key={f} style={{
                    fontSize: "0.75rem", border: "1px solid var(--border)",
                    color: "var(--gray)", padding: "0.3rem 0.75rem",
                  }}>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "1.5rem" }}>
                <Link href={s.href} style={{
                  fontSize: "0.8rem", fontWeight: 500, color: "var(--navy)",
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                  borderBottom: "1px solid var(--navy)", paddingBottom: 2,
                  transition: "opacity 0.15s",
                }}>
                  詳細・料金を見る →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
        </FadeIn>
      </div>

      <CTABand />
    </main>
  );
}
