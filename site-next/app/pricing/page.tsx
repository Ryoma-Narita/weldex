import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CTABand from "@/components/CTABand";
import { SERVICES, fmtYen } from "@/data/services";

export const metadata: Metadata = {
  title: "料金 | Weldex",
  description:
    "Weldexのサービス料金一覧。ホームページ制作・WEB予約システム・LINE連携・顧客管理システムの費用感をご確認いただけます。",
  alternates: { canonical: "https://weldex.jp/pricing" },
};

export default function PricingPage() {
  return (
    <main>
      {/* ── Page Header ── */}
      <section style={{
        padding: "10rem clamp(1.5rem, 5vw, 6rem) 5rem",
        borderBottom: "1px solid var(--border)",
      }}>
        <FadeIn>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            fontWeight: 900,
            color: "var(--navy)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginBottom: "2rem",
          }}>
            Pricing
          </p>
          <p style={{
            fontSize: "0.9375rem", color: "var(--gray)",
            lineHeight: 2.0, maxWidth: 520,
          }}>
            初期費用と月額保守費の目安です。<br />
            規模・要件によって変動します。詳細はお気軽にご相談ください。
          </p>
        </FadeIn>
      </section>

      {/* ── 料金テーブル ── */}
      <section style={{ background: "var(--white)" }}>
        {SERVICES.map((s, i) => (
          <FadeIn key={s.num}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "clamp(2rem, 5vw, 5rem)",
              padding: "4.5rem clamp(1.5rem, 5vw, 6rem)",
              borderBottom: i < SERVICES.length - 1 ? "1px solid var(--border)" : "none",
              maxWidth: 1100,
              margin: "0 auto",
              alignItems: "start",
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(3.5rem, 7vw, 7rem)",
                fontWeight: 900,
                color: "var(--border)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                paddingTop: "0.05em",
                userSelect: "none",
              }}>
                {s.num}
              </div>

              <div>
                <div style={{
                  fontSize: "0.68rem", color: "var(--gold)", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  marginBottom: "0.6rem", fontFamily: "'DM Sans', sans-serif",
                }}>
                  {s.tag}
                </div>
                <h2 style={{
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
                  fontWeight: 900,
                  color: "var(--navy)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: "2rem",
                }}>
                  {s.title}
                </h2>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1px",
                  background: "var(--border)",
                  marginBottom: "1.75rem",
                  maxWidth: 480,
                }}>
                  {[
                    { label: "初期費用", value: `¥${fmtYen(s.priceFrom)}〜` },
                    { label: "月額保守", value: `¥${fmtYen(s.monthlyFrom)}〜 / 月` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "var(--white)", padding: "1.25rem 1.5rem" }}>
                      <div style={{
                        fontSize: "0.65rem", color: "var(--gray)",
                        letterSpacing: "0.08em", marginBottom: "0.5rem",
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                        fontWeight: 700,
                        color: "var(--navy)",
                        lineHeight: 1,
                      }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <ul style={{
                  margin: 0, padding: 0, listStyle: "none",
                  display: "flex", flexDirection: "column", gap: "0.4rem",
                  marginBottom: "1.75rem",
                }}>
                  {s.points.map((p) => (
                    <li key={p} style={{
                      fontSize: "0.875rem", color: "var(--gray)",
                      display: "flex", alignItems: "flex-start",
                      gap: "0.5rem", lineHeight: 1.8,
                    }}>
                      <span style={{ color: "var(--gold)", marginTop: "0.1rem", flexShrink: 0 }}>—</span>
                      {p}
                    </li>
                  ))}
                </ul>

                <Link href={s.href} style={{
                  fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)",
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                  borderBottom: "1px solid var(--navy)", paddingBottom: 2,
                  letterSpacing: "0.03em",
                }}>
                  詳細・納品物を見る →
                </Link>
              </div>
            </div>
          </FadeIn>
        ))}
      </section>

      <FadeIn>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 clamp(1.5rem,5vw,6rem) 3rem",
        }}>
          <div style={{
            padding: "1.5rem 2rem",
            background: "var(--off)",
            borderLeft: "3px solid var(--gold)",
          }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--gray)", lineHeight: 2.2, margin: 0 }}>
              ※ 表示価格はすべて税抜きの目安です。要件・規模・連携システムによって変動します。<br />
              ※ 月額保守には障害対応・機能改善・サポートを含みます。保守なし（買い切り）のご相談も可能です。<br />
              ※ 複数サービスのセット導入は割引対応できる場合があります。まずはご相談ください。
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn style={{ textAlign: "center", padding: "3rem clamp(1.5rem,5vw,6rem) 5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/contact" className="btn btn-primary">無料相談・お見積もり</Link>
          <Link href="/services" className="btn btn-outline">サービス一覧を見る</Link>
        </div>
      </FadeIn>

      <CTABand />
    </main>
  );
}
