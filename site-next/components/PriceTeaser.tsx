import Link from "next/link";
import FadeIn from "./FadeIn";
import { SERVICES, MAINTENANCE_FROM, fmtYen } from "@/data/services";

const items = [
  ...SERVICES.filter((s) => s.slug !== "crm").map((s) => ({
    title: s.slug === "line" ? "LINE予約連携" : s.title,
    price: fmtYen(s.priceFrom),
    unit: "〜",
    note: s.teaserNote,
  })),
  { title: "月額保守・運用", price: fmtYen(MAINTENANCE_FROM), unit: "〜 / 月", note: "更新・改善・障害対応" },
];

export default function PriceTeaser() {
  return (
    <section style={{ background: "var(--off)", padding: "5rem clamp(1.5rem,5vw,3rem)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div className="sec-label" style={{ justifyContent: "center" }}>Pricing</div>
          <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
            料金の目安
          </h2>
          <p className="sec-desc" style={{ margin: "0 auto" }}>
            大手の1/3以下のコストから。ご予算に合わせて柔軟にご提案します。
          </p>
        </FadeIn>

        <div className="price-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}>
          {items.map((it, i) => (
            <FadeIn key={it.title} delay={0.08 + i * 0.08}>
              <div style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "1.5rem 1.25rem",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--navy)", letterSpacing: "0.01em" }}>
                  {it.title}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.15rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--gray)" }}>¥</span>
                  <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.9rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>
                    {it.price}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 700 }}>{it.unit}</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--gray)", lineHeight: 1.6 }}>
                  {it.note}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--light)", marginBottom: "1.25rem" }}>
            ※ 価格はすべて税別・目安です。要件により変動します。
          </p>
          <Link href="/services" className="btn btn-outline">
            料金・サービスの詳細を見る →
          </Link>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 900px) { .price-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .price-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
