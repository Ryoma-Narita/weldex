import type { Metadata } from "next";
import Link from "next/link";
import { LINE_INITIAL, LINE_PLANS, fmtPrice, getPlanDisplay } from "@/data/pricing";

export const metadata: Metadata = {
  title: "LINE連携・アカウント作成代行 | Weldex",
  description:
    "LINE公式アカウントの開設代行からリッチメニュー制作・予約システム連携・自動メッセージ設定まで一社完結。LINEを使った顧客との接点づくりをまるごとお任せ。",
  alternates: { canonical: "https://weldex.jp/services/line" },
};

const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const GREEN  = "#06c755";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

const TECH_CARDS = [
  { icon: "📱", title: "開設代行",     value: "最短1週間",        note: "LINE公式アカウントの新規開設を全て代行" },
  { icon: "🎨", title: "リッチメニュー", value: "デザイン込み",    note: "ブランドに合わせたメニュー画像を制作" },
  { icon: "🔗", title: "システム連携", value: "予約・CRM連携",     note: "予約システム・顧客管理と自動連携" },
  { icon: "⚙️", title: "自動応答設定", value: "24時間対応",        note: "よくある質問・予約誘導を自動化" },
];

const COMPARE_ROWS = [
  { label: "アカウント開設",   other: "自分で設定（複雑）",     weldex: "Weldexが全て代行",       highlight: true,  weldexGreen: true  },
  { label: "リッチメニュー",   other: "画像・設定を自分で作成", weldex: "デザイン＋設定込みで納品", highlight: true,  weldexGreen: true  },
  { label: "自動応答",         other: "手動返信のみ",           weldex: "キーワード自動返信設定",  highlight: false, weldexGreen: false },
  { label: "予約システム連携", other: "別途対応が必要",         weldex: "WEB予約と自動連携",       highlight: true,  weldexGreen: true  },
  { label: "運用サポート",     other: "なし",                   weldex: "月額保守で継続対応",      highlight: false, weldexGreen: false },
  { label: "契約終了時",       other: "アカウント消滅リスク",   weldex: "所有権をクライアントへ",  highlight: false, weldexGreen: false },
  { label: "導入費用",         other: "制作会社に依頼 ¥200,000〜", weldex: "¥150,000〜",          highlight: true,  weldexGreen: true  },
];

const DELIVERABLES = [
  { icon: "📱", title: "LINE公式アカウント開設・設定",   desc: "事業者情報・プロフィール・基本設定を全て代行で完了。" },
  { icon: "🎨", title: "リッチメニューデザイン・設定",   desc: "ブランドカラーに合わせたメニュー画像を制作し、アクション設定まで完了。" },
  { icon: "💬", title: "自動応答・ウェルカムメッセージ", desc: "友だち追加時のウェルカムメッセージと主要キーワードの自動返信を設定。" },
  { icon: "🔗", title: "WEB予約システム連携",            desc: "WEB予約URLをLINEから案内。予約完了通知もLINEで受け取れるように設定。" },
  { icon: "📊", title: "LINE公式アカウント引き渡し",     desc: "契約終了時はWeldexが管理権限から退出。クライアント単独での運用が可能。" },
  { icon: "⚙️", title: "運用マニュアル",                 desc: "管理画面の操作方法・メッセージ配信手順をPDFマニュアルで提供。" },
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
              <span style={{ color: NAVY, fontWeight: 500 }}>LINE連携・アカウント作成代行</span>
            </nav>

            <span style={{ display: "inline-block", background: GREEN, color: "#fff", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.9rem", borderRadius: 100, marginBottom: "1.5rem", letterSpacing: "0.04em", ...DM }}>
              LINE連携・アカウント作成代行
            </span>

            <h1 style={{ ...ZEN, fontSize: "clamp(2.4rem,5.5vw,4rem)", fontWeight: 900, color: NAVY, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              LINEの設定、<br />
              <em style={{ color: GOLD, fontStyle: "normal" }}>全部お任せください。</em>
            </h1>

            <p style={{ ...ZEN, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: GRAY, lineHeight: 1.9, fontWeight: 400, marginBottom: "2.5rem", maxWidth: 520 }}>
              LINE公式アカウントの開設から、リッチメニュー制作・<br />
              自動応答設定・予約システム連携まで一社完結。<br />
              難しい設定作業をWeldexが全て代行します。
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
            <H2>LINE代行サービスの特長</H2>

            <div className="ls-tech-layout" style={{ marginTop: "2.5rem" }}>
              <div className="ls-tech-text">
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95 }}>
                  「LINE公式アカウントを作りたいが、
                  設定が複雑で手が出せない」という事業者様が
                  非常に多くいらっしゃいます。
                  リッチメニューの画像制作・Webhook設定・
                  予約システムとの連携は、専門知識がなければ
                  対応困難です。
                </p>
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, marginTop: "1.25rem" }}>
                  Weldexは開設から運用開始まで全工程を代行。
                  契約終了時にはアカウントの所有権をクライアントへ
                  完全移管するため、Weldexへの依存リスクが
                  ありません。
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
            <H2>自社対応との比較</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              専門家に任せることで、ここまで差が出ます。
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem", letterSpacing: "0.04em" }}>比較項目</th>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem" }}>自社で対応</th>
                    <th style={{ ...DM,  padding: "0.85rem 1.25rem", color: GOLD, fontWeight: 700, textAlign: "left", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Weldex代行</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background: row.highlight ? "#f0fff4" : (i % 2 === 0 ? "#fff" : BG_L) }}>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{row.label}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: GRAY, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{row.other}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", fontWeight: row.highlight ? 700 : 600, color: row.weldexGreen ? GREEN : NAVY, whiteSpace: "nowrap" }}>{row.weldex}</td>
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

            {/* 月額プラン */}
            <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem" }}>月額 運用プラン</p>
            <div style={{ paddingTop: "0.75rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: BORDER, maxWidth: 860 }} className="ls-plan-grid">
              <style>{`.ls-plan-grid { } @media (max-width: 640px) { .ls-plan-grid { grid-template-columns: 1fr !important; } }`}</style>
              {LINE_PLANS.map((plan, idx) => {
                const { summary, features } = getPlanDisplay(LINE_PLANS, idx);
                const isDark = plan.recommended;
                return (
                  <div key={plan.name} style={{ position: "relative", background: isDark ? NAVY : "#fff", padding: "2rem 1.5rem", display: "flex", flexDirection: "column" }}>
                    {plan.recommended && (
                      <span style={{ position: "absolute", top: "-0.6rem", left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.75rem", borderRadius: 100, whiteSpace: "nowrap", letterSpacing: "0.06em", ...DM }}>おすすめ</span>
                    )}
                    <div style={{ ...DM, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", color: isDark ? "rgba(255,255,255,0.5)" : GRAY, marginBottom: "0.6rem" }}>{plan.name.toUpperCase()}</div>
                    <div style={{ ...DM, fontSize: "clamp(1.3rem,2.5vw,1.75rem)", fontWeight: 900, color: isDark ? "#fff" : NAVY, lineHeight: 1, marginBottom: "0.2rem" }}>{fmtPrice(plan.price)}</div>
                    <div style={{ ...DM, fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.45)" : GRAY, marginBottom: "1.5rem" }}>/ 月</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem", flex: 1 }}>
                      {summary && (
                        <li style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.74rem", fontStyle: "italic", color: isDark ? "rgba(255,255,255,0.3)" : "#c4c8d0", ...ZEN }}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M2 7l3 3 6-6" stroke={isDark ? "rgba(255,255,255,0.18)" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {summary}
                        </li>
                      )}
                      {features.map((f, fi) => (
                        <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.9)" : NAVY, fontWeight: 500, ...ZEN }}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: "0.1rem" }}>
                            <circle cx="6.5" cy="6.5" r="6.5" fill={isDark ? "rgba(201,168,76,0.25)" : "#f0fff4"} />
                            <path d="M3.5 6.5l2 2 4-4" stroke={isDark ? GOLD : GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem", marginTop: "3rem" }}>初期費用（一括）</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", maxWidth: 520 }}>
              <tbody>
                {LINE_INITIAL.map((item, i) => (
                  <tr key={item.name} style={{ background: i % 2 === 0 ? "#fff" : BG_L }}>
                    <td style={{ ...ZEN, padding: "0.75rem 1rem", color: NAVY, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>{item.name}</td>
                    <td style={{ ...DM, padding: "0.75rem 1rem", fontWeight: item.price === null ? 400 : 700, color: item.price === null ? GRAY : NAVY, borderBottom: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>{fmtPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "1.5rem", background: BG_L, borderLeft: `3px solid ${BORDER}`, padding: "0.9rem 1.25rem", maxWidth: 860 }}>
              <p style={{ ...ZEN, fontSize: "0.8rem", color: GRAY, lineHeight: 1.75 }}>※ 表示価格はすべて税抜き目安です。要件・規模により変動します。</p>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="svc-cta" style={{ background: "#f8f9fb", padding: "6rem clamp(1.5rem,5vw,5rem)", textAlign: "center" }}>
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
