import type { Metadata } from "next";
import Link from "next/link";
import ComparisonTable from "@/components/ComparisonTable";
import ServiceHero from "@/components/ServiceHero";
import { WEB_INITIAL, SEO_ITEMS, WEB_PLANS, fmtPrice, getPlanDisplay } from "@/data/pricing";

export const metadata: Metadata = {
  title: "WEBサイト制作 | Weldex",
  description:
    "Next.js × AIで制作。大手の1/3以下のコストで、WordPress超えの高速・高品質なWEBサイトを提供します。SEO対策・スマホ対応・予約システム一体化まで一社完結。",
  alternates: { canonical: "https://weldex.jp/services/web" },
};

// ─── 定数 ───────────────────────────────────────
const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const BLUE   = "#2563eb";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM: React.CSSProperties  = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

// ─── データ ──────────────────────────────────────
const TECH_CARDS = [
  { icon: "⚡", title: "表示速度", value: "0.5〜1秒",          note: "WordPressの平均3〜5秒と比較" },
  { icon: "🔍", title: "SEO評価", value: "Lighthouse 90点以上", note: "Googleの評価基準を標準装備" },
  { icon: "🛡️", title: "セキュリティ", value: "プラグインなし",  note: "脆弱性リスクを構造的に排除" },
  { icon: "🔗", title: "システム連携", value: "完全自社実装",    note: "予約・LINE・管理画面を一体化" },
];

const DELIVERABLES = [
  { icon: "🖥️", title: "スマートフォン対応HP",           desc: "5〜7ページ構成。スマホ・PC両対応。" },
  { icon: "⚡",  title: "高速表示（Lighthouse 90点以上）", desc: "Googleの評価基準を満たす高速サイト。" },
  { icon: "🔍", title: "SEO対策・構造化データ",           desc: "meta・OGP・Schema.org・sitemap設定込み。" },
  { icon: "📊", title: "Google Analytics / Search Console", desc: "アクセス解析を初期設定込みで導入。" },
  { icon: "🔒", title: "SSL・セキュリティ設定",           desc: "HTTPS対応・セキュリティヘッダー設定。" },
  { icon: "📝", title: "お知らせ・ブログ機能",            desc: "管理画面から自由に更新可能。" },
];


// ─── 共通コンポーネント ───────────────────────────
function SecLabel({ children }: { children: string }) {
  return (
    <p style={{ ...DM, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: "0.65rem" }}>
      {children}
    </p>
  );
}

function H2({ children }: { children: string }) {
  return (
    <h2 style={{ ...ZEN, fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: NAVY, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
      {children}
    </h2>
  );
}

// ─── ページ ──────────────────────────────────────
export default function WebServicePage() {
  return (
    <>
      <style>{`
        .ws-section { border-bottom: 1px solid ${BORDER}; }
        .ws-inner   { max-width: 1080px; margin: 0 auto; padding: 5rem clamp(1.5rem,5vw,5rem); }
        .ws-tech-layout { display: flex; gap: 4rem; align-items: flex-start; }
        .ws-tech-cards  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
        .ws-tech-text   { flex: 1; }
        .ws-del-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .ws-plans-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 860px; }
        @media (max-width: 768px) {
          .ws-inner       { padding: 3rem 20px; }
          .ws-tech-layout { flex-direction: column; gap: 2rem; }
          .ws-tech-text   { flex: none; width: 100%; }
          .ws-tech-cards  { grid-template-columns: 1fr 1fr; }
          .ws-del-grid    { grid-template-columns: 1fr; }
          .ws-plans-grid  { grid-template-columns: 1fr; max-width: 400px; }
        }
      `}</style>

      <main>
        {/* ─── パンくず + ヒーロー ─── */}
        <ServiceHero
          crumb="WEBサイト制作"
          tag="WEBサイト制作"
          accent="#2563eb"
          image="/images/services/web.png"
          imageAlt="WEBサイト制作のイメージ"
          title={<>Weldexがつなぐ。<br /><em style={{ color: GOLD, fontStyle: "normal" }}>全てのサービスを。</em></>}
          desc={<>制作・システム・LINE・保守まで、同一担当者が一社完結で対応。最新の技術基盤で、貴社のデジタル戦略を支えます。</>}
        />


        {/* ─── ② 技術 ─── */}
        <section className="ws-section" style={{ background: BG_L }}>
          <div className="ws-inner">
            <SecLabel>Technology</SecLabel>
            <H2>Weldexが提供する技術</H2>

            <div className="ws-tech-layout" style={{ marginTop: "2.5rem" }}>
              {/* 左：本文 */}
              <div className="ws-tech-text">
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, fontWeight: 400 }}>
                  一般的なWEB制作会社がWordPressを選ぶ理由は
                  「構築が速いから」です。しかしWordPressには、
                  表示速度の遅さ・セキュリティの脆弱性・
                  プラグインの競合トラブルという構造的な問題があります。
                </p>
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, fontWeight: 400, marginTop: "1.25rem" }}>
                  Weldexは、AIを熟知したエンジニアがNext.jsで
                  制作を行うことで、WordPressと同じ納期でありながら、
                  技術的に上位のサイトを提供できる体制を
                  実現しました。
                </p>
              </div>

              {/* 右：カード */}
              <div className="ws-tech-cards">
                {TECH_CARDS.map(c => (
                  <div key={c.title} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "1.25rem 1rem" }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{c.icon}</div>
                    <div style={{ ...DM, fontSize: "0.68rem", color: GRAY, fontWeight: 500, letterSpacing: "0.04em", marginBottom: "0.2rem" }}>{c.title}</div>
                    <div style={{ ...ZEN, fontSize: "0.95rem", fontWeight: 700, color: NAVY, marginBottom: "0.35rem" }}>{c.value}</div>
                    <div style={{ ...ZEN, fontSize: "0.72rem", color: GRAY, lineHeight: 1.5 }}>{c.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── ComparisonTable ─── */}
        <ComparisonTable />

        {/* ─── ④ 納品物 ─── */}
        <section className="ws-section" style={{ background: BG_L }}>
          <div className="ws-inner">
            <SecLabel>Deliverables</SecLabel>
            <H2>納品物一覧</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              Standardプランの納品物です。全て込みの価格です。
            </p>

            <div className="ws-del-grid">
              {DELIVERABLES.map(d => (
                <div key={d.title} style={{ background: "#fff", border: `1px solid ${BORDER}`, padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0, lineHeight: 1 }}>{d.icon}</span>
                  <div>
                    <div style={{ ...ZEN, fontSize: "0.88rem", fontWeight: 700, color: NAVY, marginBottom: "0.3rem" }}>{d.title}</div>
                    <div style={{ ...ZEN, fontSize: "0.78rem", color: GRAY, lineHeight: 1.7 }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ⑤ 料金 ─── */}
        <section className="ws-section" style={{ background: "#fff" }}>
          <div className="ws-inner">
            <SecLabel>Pricing</SecLabel>
            <H2>料金</H2>

            {/* 月額保守プラン（5段階・累積） */}
            <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem" }}>月額 保守プラン</p>
            <style>{`
              .ws-plans-new { display: grid; grid-template-columns: repeat(5,1fr); gap: 1px; background: ${BORDER}; }
              @media (max-width: 900px) { .ws-plans-new { grid-template-columns: repeat(2,1fr) !important; } }
              @media (max-width: 480px) { .ws-plans-new { grid-template-columns: 1fr !important; } }
            `}</style>
            <div style={{ paddingTop: "0.75rem" }}>
            <div className="ws-plans-new">
              {WEB_PLANS.map((plan, idx) => {
                const { summary, features } = getPlanDisplay(WEB_PLANS, idx);
                const isDark = plan.recommended;
                return (
                  <div key={plan.name} style={{ position: "relative", background: isDark ? NAVY : "#fff", padding: "1.75rem 1.25rem", display: "flex", flexDirection: "column" }}>
                    {plan.recommended && (
                      <span style={{ position: "absolute", top: "-0.6rem", left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", fontSize: "0.58rem", fontWeight: 700, padding: "0.18rem 0.7rem", borderRadius: 100, whiteSpace: "nowrap", letterSpacing: "0.06em", ...DM }}>おすすめ</span>
                    )}
                    <div style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: isDark ? "rgba(255,255,255,0.5)" : GRAY, marginBottom: "0.5rem" }}>{plan.name.toUpperCase()}</div>
                    <div style={{ ...DM, fontSize: "clamp(1.05rem,1.8vw,1.35rem)", fontWeight: 900, color: isDark ? "#fff" : NAVY, lineHeight: 1, marginBottom: "0.2rem" }}>{fmtPrice(plan.price)}</div>
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
                            <path d="M3.5 6.5l2 2 4-4" stroke={isDark ? GOLD : BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            </div>

            {/* 初期費用 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginTop: "3rem" }} className="resp-2col">
              <div>
                <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem" }}>制作 初期費用</p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <tbody>
                    {WEB_INITIAL.map((item, i) => (
                      <tr key={item.name} style={{ background: i % 2 === 0 ? "#fff" : BG_L }}>
                        <td style={{ ...ZEN, padding: "0.75rem 1rem", color: NAVY, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>
                          {item.name}
                          {item.note && <span style={{ display: "block", fontSize: "0.65rem", color: GRAY, marginTop: "0.1rem" }}>※ {item.note}</span>}
                        </td>
                        <td style={{ ...DM, padding: "0.75rem 1rem", fontWeight: item.price === null ? 400 : 700, color: item.price === null ? GRAY : NAVY, borderBottom: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>
                          {fmtPrice(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem" }}>SEO</p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <tbody>
                    {SEO_ITEMS.map((item, i) => (
                      <tr key={item.name} style={{ background: i % 2 === 0 ? "#fff" : BG_L }}>
                        <td style={{ ...ZEN, padding: "0.75rem 1rem", color: NAVY, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>{item.name}</td>
                        <td style={{ ...DM, padding: "0.75rem 1rem", fontWeight: item.price === null ? 400 : 700, color: item.price === null ? GRAY : NAVY, borderBottom: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>
                          {fmtPrice(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", background: BG_L, borderLeft: `3px solid ${BORDER}`, padding: "0.9rem 1.25rem" }}>
              <p style={{ ...ZEN, fontSize: "0.8rem", color: GRAY, lineHeight: 1.75 }}>※ 表示価格はすべて税抜き目安です。要件・規模により変動します。</p>
            </div>
          </div>
        </section>

        {/* ─── ⑥ CTA ─── */}
        <section className="svc-cta" style={{ background: "#f8f9fb", padding: "6rem clamp(1.5rem,5vw,5rem)", textAlign: "center" }}>
          <p style={{ ...DM, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>
            Contact
          </p>
          <h2 style={{ ...ZEN, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: NAVY, marginBottom: "1.25rem", letterSpacing: "-0.01em" }}>
            まずは、話を聞いてみる。
          </h2>
          <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.85, marginBottom: "2.5rem" }}>
            費用・納期・進め方など、どんなことでも構いません。<br />
            相談・お見積もりは完全無料です。
          </p>
          <Link href="/contact" style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.04em", ...DM }}>
            無料相談をする
          </Link>
        </section>
      </main>
    </>
  );
}
