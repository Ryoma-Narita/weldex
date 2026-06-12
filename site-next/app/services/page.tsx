import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import { SERVICES, fmtYen } from "@/data/services";

export const metadata: Metadata = {
  title: "サービス一覧 | Weldex",
  description:
    "ホームページ制作・WEB予約システム・LINE連携代行・顧客管理システムの4サービスを一社完結で提供。費用・納期の目安もご確認いただけます。",
  alternates: { canonical: "https://weldex.jp/services" },
};

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        title="Service"
        desc={<>制作から運用まで一社完結。<br />業種・規模に合わせてご提案します。</>}
      />

      {/* ── サービス一覧 ── */}
      <section style={{ background: "var(--white)" }}>
        {SERVICES.map((s, i) => (
          <FadeIn key={s.num}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "clamp(2rem, 5vw, 5rem)",
              padding: "5rem clamp(1.5rem, 5vw, 6rem)",
              borderBottom: i < SERVICES.length - 1 ? "1px solid var(--border)" : "none",
              maxWidth: 1200,
              margin: "0 auto",
              alignItems: "start",
            }}>
              {/* 大きな番号 */}
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(4rem, 8vw, 8rem)",
                fontWeight: 900,
                color: "var(--border)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                paddingTop: "0.1em",
                userSelect: "none",
              }}>
                {s.num}
              </div>

              {/* コンテンツ */}
              <div>
                <div style={{
                  fontSize: "0.68rem", color: "var(--gold)", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  marginBottom: "0.75rem", fontFamily: "'DM Sans', sans-serif",
                }}>
                  {s.tag}
                </div>

                <h2 style={{
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 900,
                  color: "var(--navy)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.25rem",
                }}>
                  {s.title}
                </h2>

                <p style={{
                  fontSize: "0.9375rem",
                  color: "var(--gray)",
                  lineHeight: 2.2,
                  marginBottom: "1.75rem",
                  maxWidth: 600,
                }}>
                  {s.desc}
                </p>

                <ul style={{
                  display: "flex", flexWrap: "wrap", gap: "0.5rem",
                  listStyle: "none", padding: 0, margin: "0 0 2rem",
                }}>
                  {s.features.map((f) => (
                    <li key={f} style={{
                      fontSize: "0.75rem",
                      border: "1px solid var(--border)",
                      color: "var(--gray)",
                      padding: "0.3rem 0.85rem",
                      letterSpacing: "0.02em",
                    }}>
                      {f}
                    </li>
                  ))}
                </ul>

                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
                }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                    fontWeight: 700,
                    color: "var(--navy)",
                    letterSpacing: "-0.01em",
                  }}>
                    ¥{fmtYen(s.priceFrom)}<span style={{ fontSize: "0.75em", fontWeight: 400, marginLeft: 2 }}>円〜</span>
                  </span>

                  <Link href={s.href} style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--navy)", paddingBottom: 2,
                    letterSpacing: "0.04em", transition: "opacity 0.15s",
                  }}>
                    詳細・料金を見る →
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </section>

      <FadeIn style={{ textAlign: "center", padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
        <Link href="/contact" className="btn btn-primary" style={{ fontSize: "1rem" }}>
          無料相談をする
        </Link>
      </FadeIn>

    </main>
  );
}
