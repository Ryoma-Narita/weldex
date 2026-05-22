import type { Metadata } from "next";
import Link from "next/link";
import PainPoints from "@/components/PainPoints";

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
const GRAY   = "#6b7280";
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

const COMPARE_ROWS = [
  { label: "使用技術",   other: "WordPress",          weldex: "Next.js 15",      highlight: false, weldexBlue: false },
  { label: "表示速度",   other: "2〜5秒",              weldex: "0.5〜1秒",        highlight: true,  weldexBlue: true  },
  { label: "SEO評価",   other: "普通",                 weldex: "高速表示で有利",  highlight: true,  weldexBlue: true  },
  { label: "セキュリティ", other: "プラグイン脆弱性あり", weldex: "堅牢",          highlight: false, weldexBlue: false },
  { label: "保守安定性", other: "プラグイン競合リスク",  weldex: "安定",           highlight: false, weldexBlue: false },
  { label: "納期",       other: "1〜2ヶ月",            weldex: "最短4週間",       highlight: true,  weldexBlue: true  },
  { label: "予約システム", other: "プラグイン依存",      weldex: "自社完全実装",   highlight: false, weldexBlue: false },
  { label: "費用",       other: "¥280,000〜",          weldex: "¥280,000〜",      highlight: false, weldexBlue: false, weldexSub: "品質は別次元" },
];

const DELIVERABLES = [
  { icon: "🖥️", title: "スマートフォン対応HP",           desc: "5〜7ページ構成。スマホ・PC両対応。" },
  { icon: "⚡",  title: "高速表示（Lighthouse 90点以上）", desc: "Googleの評価基準を満たす高速サイト。" },
  { icon: "🔍", title: "SEO対策・構造化データ",           desc: "meta・OGP・Schema.org・sitemap設定込み。" },
  { icon: "📊", title: "Google Analytics / Search Console", desc: "アクセス解析を初期設定込みで導入。" },
  { icon: "🔒", title: "SSL・セキュリティ設定",           desc: "HTTPS対応・セキュリティヘッダー設定。" },
  { icon: "📝", title: "お知らせ・ブログ機能",            desc: "管理画面から自由に更新可能。" },
];

const PLANS = [
  {
    name: "Light", price: "¥180,000", monthly: "¥10,000/月",
    badge: null, dark: false,
    features: ["HP制作（5〜7P）", "SEO・GA設定", "スマホ対応"],
  },
  {
    name: "Standard", price: "¥280,000", monthly: "¥15,000/月",
    badge: "人気", dark: true,
    features: ["HP制作", "WEB予約システム", "管理画面", "LINE通知"],
  },
  {
    name: "Premium", price: "¥420,000", monthly: "¥20,000/月",
    badge: null, dark: false,
    features: ["Standardの全て", "LINE完全連携", "Push配信", "優先サポート"],
  },
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
        .ws-compare-wrap { overflow-x: auto; }
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
        <section className="ws-section" style={{ paddingTop: "6rem", background: "#fff" }}>
          <div className="ws-inner" style={{ paddingTop: "1.5rem" }}>

            {/* パンくず */}
            <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: GRAY, marginBottom: "2.5rem", ...DM }}>
              <Link href="/"        style={{ color: GRAY, textDecoration: "none" }}>ホーム</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <Link href="/services" style={{ color: GRAY, textDecoration: "none" }}>サービス</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <span style={{ color: NAVY, fontWeight: 500 }}>WEBサイト制作</span>
            </nav>

            {/* タグ */}
            <span style={{ display: "inline-block", background: "#2563eb", color: "#fff", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.9rem", borderRadius: 100, marginBottom: "1.5rem", letterSpacing: "0.04em", ...DM }}>
              WEBサイト制作
            </span>

            {/* 見出し */}
            <h1 style={{ ...ZEN, fontSize: "clamp(2.4rem,5.5vw,4rem)", fontWeight: 900, color: NAVY, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Weldexがつなぐ。<br />
              <em style={{ color: GOLD, fontStyle: "normal" }}>全てのサービスを。</em>
            </h1>

            {/* サブテキスト */}
            <p style={{ ...ZEN, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: GRAY, lineHeight: 1.9, fontWeight: 400, marginBottom: "2.5rem", maxWidth: 520 }}>
              制作・システム・LINE・保守まで、同一担当者が<br />
              一社完結で対応。最新の技術基盤で、<br />
              貴社のデジタル戦略を支えます。
            </p>

            {/* ボタン */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "0.85rem 2rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", ...DM }}>
                無料相談をする
              </Link>
              <Link href="/pricing" style={{ display: "inline-block", border: `1.5px solid ${NAVY}`, color: NAVY, padding: "0.85rem 2rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", background: "transparent", ...DM }}>
                料金を見る
              </Link>
            </div>
          </div>
        </section>

        {/* ─── お悩みセクション ─── */}
        <PainPoints />

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

        {/* ─── ③ 比較表 ─── */}
        <section className="ws-section" style={{ background: "#fff" }}>
          <div className="ws-inner">
            <SecLabel>Comparison</SecLabel>
            <H2>他社との比較</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              同じ費用でも、技術の差がこれだけあります。
            </p>

            <div className="ws-compare-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem", letterSpacing: "0.04em" }}>比較項目</th>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem" }}>一般的なWEB制作</th>
                    <th style={{ ...DM,  padding: "0.85rem 1.25rem", color: GOLD, fontWeight: 700, textAlign: "left", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Weldex</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background: row.highlight ? "#f0f7ff" : (i % 2 === 0 ? "#fff" : BG_L) }}>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {row.label}
                      </td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: GRAY, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem" }}>
                        {row.other}
                      </td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", fontWeight: row.highlight ? 700 : 600, color: row.weldexBlue ? BLUE : NAVY }}>
                        {row.weldex}
                        {row.weldexSub && (
                          <span style={{ display: "block", fontSize: "0.68rem", color: GOLD, fontWeight: 500, marginTop: "0.15rem", ...DM }}>
                            {row.weldexSub}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ ...ZEN, fontSize: "0.75rem", color: GRAY, lineHeight: 1.75, marginTop: "1.25rem", padding: "0.85rem 1rem", background: BG_L, borderLeft: `3px solid #e2e8f0` }}>
              ※ 表示速度の差はGoogle検索順位に直接影響します。
              Googleはページ表示速度をSEOの評価基準のひとつとしており、
              遅いサイトは検索結果で不利になります。
            </p>
          </div>
        </section>

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
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2.5rem" }}>
              現在モニター価格にて受付中です。
            </p>

            <div className="ws-plans-grid">
              {PLANS.map(plan => (
                <div key={plan.name} style={{
                  position: "relative",
                  background: plan.dark ? NAVY : "#fff",
                  border: plan.dark ? "none" : `1px solid ${BORDER}`,
                  padding: "2rem 1.5rem",
                  display: "flex", flexDirection: "column",
                }}>
                  {plan.badge && (
                    <span style={{ position: "absolute", top: "-0.6rem", left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", fontSize: "0.62rem", fontWeight: 700, padding: "0.2rem 0.75rem", borderRadius: 100, letterSpacing: "0.06em", whiteSpace: "nowrap", ...DM }}>
                      {plan.badge}
                    </span>
                  )}

                  <div style={{ ...DM, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", color: plan.dark ? "rgba(255,255,255,0.55)" : GRAY, marginBottom: "0.75rem" }}>
                    {plan.name.toUpperCase()}
                  </div>

                  <div style={{ ...ZEN, fontSize: "1.75rem", fontWeight: 900, color: plan.dark ? "#fff" : NAVY, lineHeight: 1, marginBottom: "0.25rem" }}>
                    {plan.price}
                  </div>
                  <div style={{ ...DM, fontSize: "0.78rem", color: plan.dark ? "rgba(255,255,255,0.5)" : GRAY, marginBottom: "1.5rem" }}>
                    {plan.monthly}
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", ...ZEN, color: plan.dark ? "rgba(255,255,255,0.85)" : GRAY }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <circle cx="6.5" cy="6.5" r="6.5" fill={plan.dark ? "rgba(255,255,255,0.15)" : "#f0f7ff"} />
                          <path d="M3.5 6.5l2 2 4-4" stroke={plan.dark ? GOLD : BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* 注意書き */}
            <div style={{ marginTop: "1.75rem", background: "#fffbeb", border: "1px solid #fde68a", padding: "0.9rem 1.25rem", maxWidth: 860 }}>
              <p style={{ ...ZEN, fontSize: "0.8rem", color: "#92400e", lineHeight: 1.75 }}>
                現在モニター価格にて受付中。<br />
                受注5社以降は料金改定予定です。
              </p>
            </div>
          </div>
        </section>

        {/* ─── ⑥ CTA ─── */}
        <section style={{ background: "#f8f9fb", padding: "6rem clamp(1.5rem,5vw,5rem)", textAlign: "center" }}>
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
