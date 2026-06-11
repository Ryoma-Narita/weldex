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
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,6rem) 5rem" }}>
        <FadeIn>
          <div className="sec-label">Pricing</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(30px,4vw,52px)",
            fontWeight: 900, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}>
            料金
          </h1>
          <p style={{
            fontSize: "0.9375rem", color: "var(--gray)",
            lineHeight: 2.0, marginBottom: "4rem", maxWidth: 520,
          }}>
            初期費用と月額保守費の目安です。<br />
            規模・要件によって変動します。詳細は各サービスページ、またはお気軽にご相談ください。
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "var(--border)" }}>
          {SERVICES.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.08} style={{ background: "var(--white)", padding: "2.5rem clamp(1.5rem,4vw,3rem)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
                {/* 左：番号・タイトル */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant)", fontSize: "2.25rem",
                    fontWeight: 700, color: "var(--border)", lineHeight: 1,
                  }}>{s.num}</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 500, letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{s.tag}</div>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.3 }}>{s.title}</h2>
                  </div>
                </div>

                {/* 右：料金 */}
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--gray)", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>初期費用</div>
                    <div style={{
                      fontFamily: "var(--font-cormorant)", fontSize: "1.5rem",
                      fontWeight: 700, color: "var(--navy)", lineHeight: 1,
                      borderBottom: "1px solid var(--gold)", paddingBottom: 2,
                    }}>¥{fmtYen(s.priceFrom)}〜</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--gray)", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>月額保守</div>
                    <div style={{
                      fontFamily: "var(--font-cormorant)", fontSize: "1.5rem",
                      fontWeight: 700, color: "var(--navy)", lineHeight: 1,
                      borderBottom: "1px solid var(--border)", paddingBottom: 2,
                    }}>¥{fmtYen(s.monthlyFrom)}〜 / 月</div>
                  </div>
                </div>
              </div>

              {/* ポイント */}
              <ul style={{ margin: "1.25rem 0 1.25rem 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {s.points.map((p) => (
                  <li key={p} style={{ fontSize: "0.875rem", color: "var(--gray)", display: "flex", alignItems: "flex-start", gap: "0.5rem", lineHeight: 1.7 }}>
                    <span style={{ color: "var(--gold)", marginTop: "0.15rem", flexShrink: 0 }}>—</span>
                    {p}
                  </li>
                ))}
              </ul>

              <Link href={s.href} style={{
                fontSize: "0.8rem", fontWeight: 500, color: "var(--navy)",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                borderBottom: "1px solid var(--navy)", paddingBottom: 2,
              }}>
                詳細・納品物を見る →
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* 注記 */}
        <FadeIn delay={0.1} style={{ marginTop: "2.5rem", padding: "1.5rem 2rem", background: "#f8f9fa", borderLeft: "3px solid var(--gold)" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray)", lineHeight: 2.0, margin: 0 }}>
            ※ 表示価格はすべて税抜きの目安です。要件・規模・連携システムによって変動します。<br />
            ※ 月額保守には障害対応・機能改善・サポートを含みます。保守なし（買い切り）のご相談も可能です。<br />
            ※ 複数サービスのセット導入は割引対応できる場合があります。まずはご相談ください。
          </p>
        </FadeIn>

        <FadeIn delay={0.15} style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/contact" className="btn btn-primary">無料相談・お見積もり</Link>
          <Link href="/services" className="btn btn-outline">サービス一覧を見る</Link>
        </FadeIn>
      </div>

      <CTABand />
    </main>
  );
}
