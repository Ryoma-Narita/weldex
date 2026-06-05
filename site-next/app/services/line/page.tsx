import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LINE予約システム | Weldex",
  description:
    "LINEのトーク画面から予約・変更・キャンセルまで完結。前日リマインド自動送信で無断キャンセルを削減。既存LINE公式アカウントへの連携も対応。",
  alternates: { canonical: "https://weldex.jp/services/line" },
};

const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const BLUE   = "#2563eb";
const GREEN  = "#06b6d4";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

const TECH_CARDS = [
  { icon: "💬", title: "LINE完結",     value: "アプリ切替不要",    note: "普段使いのLINEだけで予約が完結" },
  { icon: "⏰", title: "リマインド",   value: "前日に自動送信",    note: "無断キャンセル率を大幅に削減" },
  { icon: "🔄", title: "自動対応",     value: "キャンセル・変更",  note: "24時間スタッフ不在でも自動応答" },
  { icon: "🔗", title: "既存LINE連携", value: "新規開設も代行",    note: "既存のLINE公式アカウントにそのまま導入" },
];

const COMPARE_ROWS = [
  { label: "予約手段",       other: "電話 / WEBフォーム", weldex: "LINEトークから完結",  highlight: true,  weldexBlue: true  },
  { label: "リマインド",     other: "なし / 手動連絡",    weldex: "前日に自動Push送信",  highlight: true,  weldexBlue: true  },
  { label: "キャンセル対応", other: "電話のみ",           weldex: "LINE上で自動処理",    highlight: false, weldexBlue: false },
  { label: "予約変更",       other: "電話のみ",           weldex: "LINEから24時間対応",  highlight: false, weldexBlue: false },
  { label: "管理画面",       other: "なし",               weldex: "一元管理・CSV出力",   highlight: false, weldexBlue: false },
  { label: "患者の手間",     other: "電話・フォーム切替", weldex: "LINEを開くだけ",      highlight: true,  weldexBlue: true  },
  { label: "導入費用",       other: "¥200,000〜",         weldex: "¥150,000〜",          highlight: true,  weldexBlue: true  },
];

const DELIVERABLES = [
  { icon: "💬", title: "LINE予約フロー",          desc: "日付・時間・メニューをLINEのトーク上で選択して予約完結。" },
  { icon: "⏰", title: "前日リマインド自動送信",   desc: "毎日18時に翌日予約の方へLINE Pushを自動送信。" },
  { icon: "🔄", title: "キャンセル・変更対応",     desc: "キーワードで自動応答。WEB予約フォームへ誘導して処理。" },
  { icon: "📋", title: "管理画面連携",             desc: "LINE予約もWEB予約も同一の管理画面で一元管理。" },
  { icon: "🔗", title: "既存LINE公式アカウント連携", desc: "すでにLINE公式アカウントをお持ちの場合もそのまま導入可能。" },
  { icon: "👥", title: "ウェルカムメッセージ設定",  desc: "友だち追加時に自動でご挨拶・予約案内を送信。" },
];

const PLANS = [
  {
    name: "Light", price: "¥150,000", monthly: "¥8,000/月",
    badge: null, dark: false,
    features: ["LINE予約フロー", "前日リマインド", "キャンセル自動対応"],
  },
  {
    name: "Standard", price: "¥230,000", monthly: "¥12,000/月",
    badge: "人気", dark: true,
    features: ["Lightの全て", "管理画面連携", "顧客管理・CSV出力", "WEB予約との併用"],
  },
  {
    name: "Premium", price: "¥350,000", monthly: "¥18,000/月",
    badge: null, dark: false,
    features: ["Standardの全て", "Push配信機能", "リッチメニュー制作", "優先サポート"],
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

export default function LineServicePage() {
  return (
    <>
      <style>{`
        .ls-section { border-bottom: 1px solid ${BORDER}; }
        .ls-inner   { max-width: 1080px; margin: 0 auto; padding: 5rem clamp(1.5rem,5vw,5rem); }
        .ls-tech-layout { display: flex; gap: 4rem; align-items: flex-start; }
        .ls-tech-cards  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
        .ls-tech-text   { flex: 1; }
        .ls-del-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .ls-plans-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 860px; }
        @media (max-width: 768px) {
          .ls-inner       { padding: 3rem 20px; }
          .ls-tech-layout { flex-direction: column; gap: 2rem; }
          .ls-tech-text   { flex: none; width: 100%; }
          .ls-tech-cards  { grid-template-columns: 1fr 1fr; }
          .ls-del-grid    { grid-template-columns: 1fr; }
          .ls-plans-grid  { grid-template-columns: 1fr; max-width: 400px; }
        }
      `}</style>

      <main>
        {/* ─── ヒーロー ─── */}
        <section className="ls-section" style={{ paddingTop: "6rem", background: "#fff" }}>
          <div className="ls-inner" style={{ paddingTop: "1.5rem" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: GRAY, marginBottom: "2.5rem", ...DM }}>
              <Link href="/"         style={{ color: GRAY, textDecoration: "none" }}>ホーム</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <Link href="/services" style={{ color: GRAY, textDecoration: "none" }}>サービス</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <span style={{ color: NAVY, fontWeight: 500 }}>LINE予約システム</span>
            </nav>

            <span style={{ display: "inline-block", background: "#06c755", color: "#fff", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.9rem", borderRadius: 100, marginBottom: "1.5rem", letterSpacing: "0.04em", ...DM }}>
              LINE予約システム
            </span>

            <h1 style={{ ...ZEN, fontSize: "clamp(2.4rem,5.5vw,4rem)", fontWeight: 900, color: NAVY, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              LINEで完結する、<br />
              <em style={{ color: GOLD, fontStyle: "normal" }}>スマート予約体験。</em>
            </h1>

            <p style={{ ...ZEN, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: GRAY, lineHeight: 1.9, fontWeight: 400, marginBottom: "2.5rem", maxWidth: 520 }}>
              患者・顧客が普段使いのLINEから予約・変更・<br />
              キャンセルまで完結。前日リマインドの<br />
              自動送信で無断キャンセルを削減します。
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

        {/* ─── 特長 ─── */}
        <section className="ls-section" style={{ background: BG_L }}>
          <div className="ls-inner">
            <SecLabel>Features</SecLabel>
            <H2>LINE予約システムの特長</H2>

            <div className="ls-tech-layout" style={{ marginTop: "2.5rem" }}>
              <div className="ls-tech-text">
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95 }}>
                  日本のLINEユーザーは9,600万人以上。
                  患者・顧客の多くがすでに日常的に使っているLINEを
                  そのまま予約窓口にできることが、
                  WEB予約との最大の差別化ポイントです。
                </p>
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, marginTop: "1.25rem" }}>
                  WeldexのLINE予約システムはLINE公式アカウントの
                  Webhookと連携し、トーク画面上でのやり取りを
                  完全に自動化します。スタッフの手を借りずに
                  予約・リマインド・キャンセルを処理できます。
                </p>
              </div>

              <div className="ls-tech-cards">
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
        <section className="ls-section" style={{ background: "#fff" }}>
          <div className="ls-inner">
            <SecLabel>Comparison</SecLabel>
            <H2>従来のLINE運用との比較</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              手動対応からシステム化に切り替えるとここまで変わります。
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem", letterSpacing: "0.04em" }}>比較項目</th>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem" }}>LINE手動対応</th>
                    <th style={{ ...DM,  padding: "0.85rem 1.25rem", color: GOLD, fontWeight: 700, textAlign: "left", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Weldex LINE予約</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background: row.highlight ? "#f0fff4" : (i % 2 === 0 ? "#fff" : BG_L) }}>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{row.label}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: GRAY, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem" }}>{row.other}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", fontWeight: row.highlight ? 700 : 600, color: row.weldexBlue ? GREEN : NAVY }}>{row.weldex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── 納品物 ─── */}
        <section className="ls-section" style={{ background: BG_L }}>
          <div className="ls-inner">
            <SecLabel>Deliverables</SecLabel>
            <H2>納品物一覧</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              Standardプランの納品物です。全て込みの価格です。
            </p>

            <div className="ls-del-grid">
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

        {/* ─── 料金 ─── */}
        <section className="ls-section" style={{ background: "#fff" }}>
          <div className="ls-inner">
            <SecLabel>Pricing</SecLabel>
            <H2>料金</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2.5rem" }}>
              現在モニター価格にて受付中です。
            </p>

            <div className="ls-plans-grid">
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
                          <circle cx="6.5" cy="6.5" r="6.5" fill={plan.dark ? "rgba(255,255,255,0.15)" : "#f0fff4"} />
                          <path d="M3.5 6.5l2 2 4-4" stroke={plan.dark ? GOLD : GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
