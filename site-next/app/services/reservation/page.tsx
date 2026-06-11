import type { Metadata } from "next";
import Link from "next/link";
import RoiCalculator from "@/components/RoiCalculator";

export const metadata: Metadata = {
  title: "WEB予約システム | Weldex",
  description:
    "24時間自動受付・前日リマインド・顧客管理まで一式。歯科・クリニック・サロン向けのWEB予約システムを初期費用を抑えて導入できます。",
  alternates: { canonical: "https://weldex.jp/services/reservation" },
};

const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const BLUE   = "#2563eb";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

const TECH_CARDS = [
  { icon: "🕐", title: "受付時間",   value: "24時間 365日",       note: "営業時間外の予約取りこぼしをゼロに" },
  { icon: "📋", title: "管理画面",   value: "ブラウザから確認",    note: "スマホ・PCから予約・顧客を一元管理" },
  { icon: "📧", title: "自動通知",   value: "確認・リマインド",    note: "予約確認とリマインドメールを自動送信" },
  { icon: "📊", title: "顧客管理",   value: "CSV出力対応",         note: "来院履歴・顧客情報を安全に管理" },
];

const COMPARE_ROWS = [
  { label: "受付時間",       other: "営業時間内のみ",    weldex: "24時間365日",       highlight: true,  weldexBlue: true  },
  { label: "予約確認",       other: "電話・手書き台帳",  weldex: "管理画面で一覧",     highlight: false, weldexBlue: false },
  { label: "リマインド",     other: "なし / 手動連絡",   weldex: "前日に自動送信",     highlight: true,  weldexBlue: true  },
  { label: "キャンセル対応", other: "電話のみ",          weldex: "WEBから24時間対応",  highlight: false, weldexBlue: false },
  { label: "顧客管理",       other: "紙・Excel",         weldex: "DB管理・CSV出力",    highlight: false, weldexBlue: false },
  { label: "スタッフ工数",   other: "対応ごとに発生",    weldex: "大幅に削減",         highlight: true,  weldexBlue: true  },
  { label: "導入費用",       other: "¥300,000〜",        weldex: "¥200,000〜",         highlight: true,  weldexBlue: true  },
];

const DELIVERABLES = [
  { icon: "🖥️", title: "予約フォーム（WEB）",     desc: "スマホ・PC対応。カレンダーUIで直感的に選択できます。" },
  { icon: "📋", title: "管理画面",                 desc: "予約一覧・顧客情報・休診日設定をブラウザから操作。" },
  { icon: "📧", title: "自動確認メール",            desc: "予約完了時に患者・管理者両方へ自動送信。" },
  { icon: "⏰", title: "前日リマインドメール",      desc: "毎日18時に翌日予約の患者へ自動送信。無断キャンセルを削減。" },
  { icon: "👥", title: "顧客管理・CSV出力",         desc: "来院履歴・連絡先を管理。既存リストのインポートも対応。" },
  { icon: "🔒", title: "セキュリティ設定",          desc: "HTTPS・レートリミット・ハニーポットで堅牢に。" },
];

const PLANS = [
  {
    name: "Light", price: "¥200,000", monthly: "¥8,000/月",
    badge: null, dark: false,
    features: ["予約フォーム", "管理画面", "確認メール自動送信"],
  },
  {
    name: "Standard", price: "¥280,000", monthly: "¥12,000/月",
    badge: "人気", dark: true,
    features: ["Lightの全て", "前日リマインド", "顧客管理・CSV出力", "LINE通知オプション"],
  },
  {
    name: "Premium", price: "¥380,000", monthly: "¥18,000/月",
    badge: null, dark: false,
    features: ["Standardの全て", "LINE予約連携", "Push配信", "優先サポート"],
  },
];

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

export default function ReservationServicePage() {
  return (
    <>
      <style>{`
        .rs-section { border-bottom: 1px solid ${BORDER}; }
        .rs-inner   { max-width: 1080px; margin: 0 auto; padding: 5rem clamp(1.5rem,5vw,5rem); }
        .rs-tech-layout { display: flex; gap: 4rem; align-items: flex-start; }
        .rs-tech-cards  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
        .rs-tech-text   { flex: 1; }
        .rs-del-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .rs-plans-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 860px; }
        @media (max-width: 768px) {
          .rs-inner       { padding: 3rem 20px; }
          .rs-tech-layout { flex-direction: column; gap: 2rem; }
          .rs-tech-text   { flex: none; width: 100%; }
          .rs-tech-cards  { grid-template-columns: 1fr 1fr; }
          .rs-del-grid    { grid-template-columns: 1fr; }
          .rs-plans-grid  { grid-template-columns: 1fr; max-width: 400px; }
        }
      `}</style>

      <main>
        {/* ─── ヒーロー ─── */}
        <section className="rs-section" style={{ paddingTop: "6rem", background: "transparent" }}>
          <div className="rs-inner" style={{ paddingTop: "1.5rem" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: GRAY, marginBottom: "2.5rem", ...DM }}>
              <Link href="/"         style={{ color: GRAY, textDecoration: "none" }}>ホーム</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <Link href="/services" style={{ color: GRAY, textDecoration: "none" }}>サービス</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <span style={{ color: NAVY, fontWeight: 500 }}>WEB予約システム</span>
            </nav>

            <span style={{ display: "inline-block", background: "#0ea5e9", color: "#fff", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.9rem", borderRadius: 100, marginBottom: "1.5rem", letterSpacing: "0.04em", ...DM }}>
              WEB予約システム
            </span>

            <h1 style={{ ...ZEN, fontSize: "clamp(2.4rem,5.5vw,4rem)", fontWeight: 900, color: NAVY, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              予約の取りこぼしを、<br />
              <em style={{ color: GOLD, fontStyle: "normal" }}>なくす。</em>
            </h1>

            <p style={{ ...ZEN, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: GRAY, lineHeight: 1.9, fontWeight: 400, marginBottom: "2.5rem", maxWidth: 520 }}>
              24時間自動受付・前日リマインド・顧客管理まで一式。<br />
              電話対応の工数を削減しながら、<br />
              患者・顧客の利便性を大幅に向上します。
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/contact" style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "0.85rem 2rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", ...DM }}>
                無料相談をする
              </Link>
              <Link href="/services" style={{ display: "inline-block", border: `1.5px solid ${NAVY}`, color: NAVY, padding: "0.85rem 2rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", background: "transparent", ...DM }}>
                サービス一覧へ
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 技術・特長 ─── */}
        <section className="rs-section" style={{ background: BG_L }}>
          <div className="rs-inner">
            <SecLabel>Features</SecLabel>
            <H2>WEB予約システムの特長</H2>

            <div className="rs-tech-layout" style={{ marginTop: "2.5rem" }}>
              <div className="rs-tech-text">
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95 }}>
                  多くの医療・サービス業で予約は「電話のみ」です。
                  しかし電話予約には、営業時間外の取りこぼし・
                  スタッフの工数・無断キャンセルという
                  構造的な課題があります。
                </p>
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, marginTop: "1.25rem" }}>
                  WeldexのWEB予約システムは、FastAPIとPostgreSQLで
                  構築した堅牢なシステムです。前日リマインドの
                  自動送信により無断キャンセル率を削減し、
                  管理者の工数を大幅に減らします。
                </p>
              </div>

              <div className="rs-tech-cards">
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

        {/* ─── 比較表 ─── */}
        <section className="rs-section" style={{ background: "#fff" }}>
          <div className="rs-inner">
            <SecLabel>Comparison</SecLabel>
            <H2>電話予約との比較</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              同じ費用帯でも、システム導入の差がこれだけあります。
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem", letterSpacing: "0.04em" }}>比較項目</th>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem" }}>電話予約のみ</th>
                    <th style={{ ...DM,  padding: "0.85rem 1.25rem", color: GOLD, fontWeight: 700, textAlign: "left", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Weldex WEB予約</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background: row.highlight ? "#f0f7ff" : (i % 2 === 0 ? "#fff" : BG_L) }}>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{row.label}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: GRAY, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem" }}>{row.other}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", fontWeight: row.highlight ? 700 : 600, color: row.weldexBlue ? BLUE : NAVY }}>{row.weldex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── 納品物 ─── */}
        <section className="rs-section" style={{ background: BG_L }}>
          <div className="rs-inner">
            <SecLabel>Deliverables</SecLabel>
            <H2>納品物一覧</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              Standardプランの納品物です。全て込みの価格です。
            </p>

            <div className="rs-del-grid">
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

        {/* ─── 損失シミュレーター ─── */}
        <RoiCalculator />

        {/* ─── 料金 ─── */}
        <section className="rs-section" style={{ background: "#fff" }}>
          <div className="rs-inner">
            <SecLabel>Pricing</SecLabel>
            <H2>料金</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2.5rem" }}>
              現在モニター価格にて受付中です。
            </p>

            <div className="rs-plans-grid">
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

            <div style={{ marginTop: "1.75rem", background: "#fffbeb", border: "1px solid #fde68a", padding: "0.9rem 1.25rem", maxWidth: 860 }}>
              <p style={{ ...ZEN, fontSize: "0.8rem", color: "#92400e", lineHeight: 1.75 }}>
                現在モニター価格にて受付中。受注5社以降は料金改定予定です。
              </p>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section style={{ background: "#f8f9fb", padding: "6rem clamp(1.5rem,5vw,5rem)", textAlign: "center" }}>
          <p style={{ ...DM, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>Contact</p>
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
