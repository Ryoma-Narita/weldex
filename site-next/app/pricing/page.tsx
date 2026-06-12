import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import {
  WEB_INITIAL, SEO_ITEMS, WEB_PLANS,
  LINE_INITIAL, LINE_PLANS,
  CRM_INITIAL, CRM_PLANS,
  RESERVATION_INITIAL, RESERVATION_PLANS,
  fmtPrice, getPlanDisplay,
  type Plan, type PriceItem,
} from "@/data/pricing";

export const metadata: Metadata = {
  title: "料金一覧 | Weldex",
  description:
    "WEB制作・LINE連携・CRM・予約システムの料金一覧。初期費用から月額保守プランまで全て掲載。",
  alternates: { canonical: "https://weldex.jp/pricing" },
};

const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

// ─── 初期費用テーブル ──────────────────────────────────────
function InitialTable({ items }: { items: PriceItem[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 560, fontSize: "0.875rem" }}>
      <tbody>
        {items.map((item, i) => (
          <tr key={item.name} style={{ background: i % 2 === 0 ? "#fff" : BG_L }}>
            <td style={{ ...ZEN, padding: "0.85rem 1.25rem", color: NAVY, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>
              {item.name}
              {item.note && (
                <span style={{ display: "block", fontSize: "0.68rem", color: GRAY, marginTop: "0.15rem" }}>
                  ※ {item.note}
                </span>
              )}
            </td>
            <td style={{ ...DM, padding: "0.85rem 1.25rem", color: item.price === null ? GRAY : NAVY, fontWeight: item.price === null ? 400 : 700, borderBottom: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>
              {fmtPrice(item.price)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── プランカード ─────────────────────────────────────────
function PlanCards({ plans, accentColor }: { plans: Plan[]; accentColor: string }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
      gap: "1px",
      background: BORDER,
      overflowX: "auto",
    }}
      className="plan-grid"
    >
      {plans.map((plan, idx) => {
        const { summary, features } = getPlanDisplay(plans, idx);
        const isRecommended = plan.recommended;
        const isDark = isRecommended;
        return (
          <div
            key={plan.name}
            style={{
              position: "relative",
              background: isDark ? NAVY : "#fff",
              padding: "2rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {isRecommended && (
              <span style={{
                position: "absolute", top: "-0.65rem", left: "50%",
                transform: "translateX(-50%)",
                background: GOLD, color: "#fff",
                fontSize: "0.6rem", fontWeight: 700,
                padding: "0.2rem 0.85rem", borderRadius: 100,
                letterSpacing: "0.08em", whiteSpace: "nowrap",
                ...DM,
              }}>
                おすすめ
              </span>
            )}

            <div style={{ ...DM, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", color: isDark ? "rgba(255,255,255,0.5)" : GRAY, marginBottom: "0.6rem" }}>
              {plan.name.toUpperCase()}
            </div>
            <div style={{ ...DM, fontSize: "clamp(1.5rem,3vw,1.9rem)", fontWeight: 900, color: isDark ? "#fff" : NAVY, lineHeight: 1, marginBottom: "0.2rem" }}>
              {fmtPrice(plan.price)}
            </div>
            <div style={{ ...DM, fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.45)" : GRAY, marginBottom: "1.5rem" }}>
              / 月（税抜）
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem", flex: 1 }}>
              {summary && (
                <li style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  fontSize: "0.75rem", fontStyle: "italic",
                  color: isDark ? "rgba(255,255,255,0.35)" : "#b0b8c4",
                  ...ZEN,
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 7l3 3 6-6" stroke={isDark ? "rgba(255,255,255,0.2)" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {summary}
                </li>
              )}
              {features.map((f, fi) => (
                <li key={fi} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.45rem",
                  fontSize: "0.82rem",
                  color: isDark ? "rgba(255,255,255,0.9)" : NAVY,
                  fontWeight: isDark ? 600 : 500,
                  ...ZEN,
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: "0.1rem" }}>
                    <circle cx="6.5" cy="6.5" r="6.5" fill={isDark ? "rgba(201,168,76,0.25)" : `${accentColor}18`} />
                    <path d="M3.5 6.5l2 2 4-4" stroke={isDark ? GOLD : accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ─── セクションヘッダー ────────────────────────────────────
function SvcHeader({ num, tag, title }: { num: string; tag: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem", marginBottom: "3rem" }}>
      <div style={{ ...DM, fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 900, color: BORDER, lineHeight: 1, letterSpacing: "-0.04em", userSelect: "none" }}>
        {num}
      </div>
      <div>
        <div style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GOLD, textTransform: "uppercase", marginBottom: "0.35rem" }}>
          {tag}
        </div>
        <h2 style={{ ...ZEN, fontSize: "clamp(1.3rem,2.5vw,1.9rem)", fontWeight: 900, color: NAVY, lineHeight: 1.2, letterSpacing: "-0.01em", margin: 0 }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

function SubLabel({ children }: { children: string }) {
  return (
    <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.16em", color: GRAY, textTransform: "uppercase", marginBottom: "1rem" }}>
      {children}
    </p>
  );
}

// ─── ページ ───────────────────────────────────────────────
export default function PricingPage() {
  return (
    <main>
      <style>{`
        .plan-grid { border-radius: 0; }
        @media (max-width: 640px) {
          .plan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <PageHeader
        title="Pricing"
        desc={<>初期費用と月額保守費の目安を全て掲載しています。<br />要件・規模により変動します。まずはお気軽にご相談ください。</>}
      />

      {/* ── 01 WEB制作・保守 ─────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="pricing-sec-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
          <FadeIn>
            <SvcHeader num="01" tag="HP / LP / EC" title="WEB制作・SEO・保守" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3.5rem" }} className="resp-2col">
              <div>
                <SubLabel>制作 初期費用</SubLabel>
                <InitialTable items={WEB_INITIAL} />
              </div>
              <div>
                <SubLabel>SEO</SubLabel>
                <InitialTable items={SEO_ITEMS} />
              </div>
            </div>

            <SubLabel>月額 Web保守プラン</SubLabel>
            <style>{`
              .web-plans { display: grid; grid-template-columns: repeat(5,1fr); gap: 1px; background: ${BORDER}; }
              @media (max-width: 900px) { .web-plans { grid-template-columns: repeat(2,1fr) !important; } }
              @media (max-width: 480px) { .web-plans { grid-template-columns: 1fr !important; } }
            `}</style>
            <div className="web-plans">
              {WEB_PLANS.map((plan, idx) => {
                const { summary, features } = getPlanDisplay(WEB_PLANS, idx);
                const isDark = plan.recommended;
                return (
                  <div key={plan.name} style={{ position: "relative", background: isDark ? NAVY : "#fff", padding: "1.75rem 1.25rem", display: "flex", flexDirection: "column" }}>
                    {plan.recommended && (
                      <span style={{ position: "absolute", top: "-0.6rem", left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", fontSize: "0.58rem", fontWeight: 700, padding: "0.18rem 0.7rem", borderRadius: 100, whiteSpace: "nowrap", letterSpacing: "0.06em", ...DM }}>
                        おすすめ
                      </span>
                    )}
                    <div style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: isDark ? "rgba(255,255,255,0.5)" : GRAY, marginBottom: "0.5rem" }}>{plan.name.toUpperCase()}</div>
                    <div style={{ ...DM, fontSize: "clamp(1.1rem,2vw,1.4rem)", fontWeight: 900, color: isDark ? "#fff" : NAVY, lineHeight: 1, marginBottom: "0.2rem" }}>{fmtPrice(plan.price)}</div>
                    <div style={{ ...DM, fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.4)" : GRAY, marginBottom: "1.25rem" }}>/ 月</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
                      {summary && (
                        <li style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", fontStyle: "italic", color: isDark ? "rgba(255,255,255,0.3)" : "#c4c8d0", ...ZEN }}>
                          <svg width="11" height="11" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M2 7l3 3 6-6" stroke={isDark ? "rgba(255,255,255,0.18)" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {summary}
                        </li>
                      )}
                      {features.map((f, fi) => (
                        <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.88)" : NAVY, fontWeight: 500, ...ZEN }}>
                          <svg width="11" height="11" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: "0.15rem" }}>
                            <circle cx="6.5" cy="6.5" r="6.5" fill={isDark ? "rgba(201,168,76,0.2)" : "#e0f2fe"} />
                            <path d="M3.5 6.5l2 2 4-4" stroke={isDark ? GOLD : "#0369a1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 02 LINE連携 ──────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: BG_L }}>
        <div className="pricing-sec-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
          <FadeIn>
            <SvcHeader num="02" tag="LINE / 代行 / 運用" title="LINE連携・アカウント作成代行" />

            <div style={{ marginBottom: "3.5rem" }}>
              <SubLabel>初期費用（一括）</SubLabel>
              <InitialTable items={LINE_INITIAL} />
            </div>

            <SubLabel>月額 運用プラン</SubLabel>
            <PlanCards plans={LINE_PLANS} accentColor="#06c755" />
          </FadeIn>
        </div>
      </section>

      {/* ── 03 CRM ───────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="pricing-sec-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
          <FadeIn>
            <SvcHeader num="03" tag="CRM / 顧客管理" title="顧客管理システム（CRM）" />

            <div style={{ marginBottom: "3.5rem" }}>
              <SubLabel>初期費用（一括）</SubLabel>
              <InitialTable items={CRM_INITIAL} />
            </div>

            <SubLabel>月額 保守プラン</SubLabel>
            <PlanCards plans={CRM_PLANS} accentColor="#7c3aed" />
          </FadeIn>
        </div>
      </section>

      {/* ── 04 予約システム ───────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: BG_L }}>
        <div className="pricing-sec-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
          <FadeIn>
            <SvcHeader num="04" tag="予約 / 管理" title="WEB予約システム" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }} className="resp-2col">
              <div>
                <SubLabel>初期費用（一括）</SubLabel>
                <InitialTable items={RESERVATION_INITIAL} />
              </div>

              <div>
                <SubLabel>月額 保守プラン</SubLabel>
                <div style={{ background: NAVY, padding: "2rem 1.75rem" }}>
                  <div style={{ ...DM, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: "0.6rem" }}>
                    {RESERVATION_PLANS[0].name.toUpperCase()}
                  </div>
                  <div style={{ ...DM, fontSize: "clamp(1.5rem,3vw,1.9rem)", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "0.2rem" }}>
                    {fmtPrice(RESERVATION_PLANS[0].price)}
                  </div>
                  <div style={{ ...DM, fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem" }}>/ 月（税抜）</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {RESERVATION_PLANS[0].newFeatures.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.88)", ...ZEN }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(201,168,76,0.2)" />
                          <path d="M3.5 6.5l2 2 4-4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 注意書き ─────────────────────────────────────── */}
      <FadeIn>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem clamp(1.5rem,5vw,6rem)" }}>
          <div style={{ padding: "1.5rem 2rem", background: "#fffbeb", borderLeft: "3px solid #fde68a" }}>
            <p style={{ ...ZEN, fontSize: "0.8125rem", color: "#92400e", lineHeight: 2.1, margin: 0 }}>
              ※ 表示価格はすべて税抜きの目安です。要件・規模・連携システムによって変動します。<br />
              ※ 複数サービスのセット導入は割引対応できる場合があります。まずはご相談ください。<br />
              ※ 保守なし（買い切り）のご相談も可能です。
            </p>
          </div>
        </div>
      </FadeIn>

      {/* ── CTA ─────────────────────────────────────────── */}
      <FadeIn style={{ textAlign: "center", padding: "3.5rem clamp(1.5rem,5vw,6rem) 5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/contact" className="btn btn-primary">無料相談・お見積もり</Link>
          <Link href="/services" className="btn btn-outline">サービス一覧を見る</Link>
        </div>
      </FadeIn>
    </main>
  );
}
