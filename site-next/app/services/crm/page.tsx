import type { Metadata } from "next";
import Link from "next/link";
import { CRM_INITIAL, CRM_PLANS, fmtPrice, getPlanDisplay } from "@/data/pricing";

export const metadata: Metadata = {
  title: "顧客管理システム（CRM）| Weldex",
  description:
    "顧客情報・来院履歴・コミュニケーション履歴を一元管理。予約システムと連携し、リピート率向上・離脱防止につながる顧客DXを実現します。",
  alternates: { canonical: "https://weldex.jp/services/crm" },
};

const NAVY   = "#1a2540";
const GOLD   = "#b8960c";
const PURPLE = "#7c3aed";
const GRAY   = "#4b5563";
const BORDER = "#f1f3f5";
const BG_L   = "#fafbfc";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

const TECH_CARDS = [
  { icon: "👥", title: "顧客管理",     value: "一元管理・即検索",  note: "名前・電話・来院履歴をDBで一元管理" },
  { icon: "📊", title: "分析・レポート", value: "リピート率・LTV",  note: "来院頻度・売上貢献度を可視化" },
  { icon: "🔄", title: "自動フォロー",  value: "離脱防止メール",   note: "一定期間来院なしの顧客に自動フォロー" },
  { icon: "🔗", title: "システム連携",  value: "予約・LINE統合",   note: "WEB/LINE予約と顧客データが自動連携" },
];

const COMPARE_ROWS = [
  { label: "顧客情報管理",   other: "Excel・紙カルテ",        weldex: "DBで一元管理・即検索",     highlight: true,  weldexPurple: true  },
  { label: "来院履歴",       other: "手動記録・紙台帳",       weldex: "予約完了で自動蓄積",        highlight: true,  weldexPurple: true  },
  { label: "リピート分析",   other: "なし / 勘頼り",          weldex: "来院頻度・LTVを可視化",     highlight: true,  weldexPurple: true  },
  { label: "離脱検知",       other: "気づかない",             weldex: "自動フォローメール送信",     highlight: false, weldexPurple: false },
  { label: "CSV入出力",      other: "Excelのみ",              weldex: "インポート・エクスポート対応", highlight: false, weldexPurple: false },
  { label: "セキュリティ",   other: "ファイル漏洩リスク",     weldex: "DB管理・アクセス制限",       highlight: false, weldexPurple: false },
  { label: "導入費用",       other: "既製SaaS ¥5,000〜/月",   weldex: "¥300,000〜（買い切り）",    highlight: true,  weldexPurple: true  },
];

const DELIVERABLES = [
  { icon: "👥", title: "顧客管理画面",           desc: "名前・電話・メール・来院履歴を一覧管理。氏名・電話番号で即検索。" },
  { icon: "📅", title: "予約システム自動連携",   desc: "WEB/LINE予約が完了すると顧客DBに自動登録・来院履歴を蓄積。" },
  { icon: "📊", title: "ダッシュボード・分析",   desc: "今月の来院数・リピート率・新規vs既存比率をグラフで可視化。" },
  { icon: "🔄", title: "自動フォローアップ",     desc: "3ヶ月以上来院なしの顧客へ自動でフォローメールを送信。" },
  { icon: "📁", title: "CSVインポート・エクスポート", desc: "既存の顧客リスト（Excel・Shift-JIS対応）を一括取込。" },
  { icon: "🔒", title: "セキュリティ・個人情報管理", desc: "HTTPS・レートリミット・一定期間経過後の個人情報自動削除に対応。" },
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

export default function CrmServicePage() {
  return (
    <>
      <style>{`
        .crm-section { border-bottom: 1px solid ${BORDER}; }
        .crm-inner   { max-width: 1080px; margin: 0 auto; padding: 5rem clamp(1.5rem,5vw,5rem); }
        .crm-tech-layout { display: flex; gap: 4rem; align-items: flex-start; }
        .crm-tech-cards  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; }
        .crm-tech-text   { flex: 1; }
        .crm-del-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .crm-plans-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 860px; }
        @media (max-width: 768px) {
          .crm-inner       { padding: 3rem 20px; }
          .crm-tech-layout { flex-direction: column; gap: 2rem; }
          .crm-tech-text   { flex: none; width: 100%; }
          .crm-tech-cards  { grid-template-columns: 1fr 1fr; }
          .crm-del-grid    { grid-template-columns: 1fr; }
          .crm-plans-grid  { grid-template-columns: 1fr; max-width: 400px; }
        }
      `}</style>

      <main>
        {/* ─── ヒーロー ─── */}
        <section className="crm-section" style={{ paddingTop: "6rem", background: "#fff" }}>
          <div className="crm-inner" style={{ paddingTop: "1.5rem" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: GRAY, marginBottom: "2.5rem", ...DM }}>
              <Link href="/"         style={{ color: GRAY, textDecoration: "none" }}>ホーム</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <Link href="/services" style={{ color: GRAY, textDecoration: "none" }}>サービス</Link>
              <span style={{ color: "#cbd5e1" }}>›</span>
              <span style={{ color: NAVY, fontWeight: 500 }}>顧客管理システム（CRM）</span>
            </nav>

            <span style={{ display: "inline-block", background: PURPLE, color: "#fff", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.9rem", borderRadius: 100, marginBottom: "1.5rem", letterSpacing: "0.04em", ...DM }}>
              顧客管理システム（CRM）
            </span>

            <h1 style={{ ...ZEN, fontSize: "clamp(2.4rem,5.5vw,4rem)", fontWeight: 900, color: NAVY, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              顧客との関係を、<br />
              <em style={{ color: GOLD, fontStyle: "normal" }}>データで深める。</em>
            </h1>

            <p style={{ ...ZEN, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: GRAY, lineHeight: 1.9, fontWeight: 400, marginBottom: "2.5rem", maxWidth: 520 }}>
              顧客情報・来院履歴・コミュニケーション履歴を一元管理。<br />
              予約システムとシームレスに連携し、リピート率向上・<br />
              離脱防止につながる顧客DXを実現します。
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
        <section className="crm-section" style={{ background: BG_L }}>
          <div className="crm-inner">
            <SecLabel>Features</SecLabel>
            <H2>顧客管理システムの特長</H2>

            <div className="crm-tech-layout" style={{ marginTop: "2.5rem" }}>
              <div className="crm-tech-text">
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95 }}>
                  「患者の情報がExcelと紙カルテに分散している」
                  「常連客が離れたことに気づかなかった」
                  こうした課題は、顧客情報が一元化されていないことが原因です。
                </p>
                <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, lineHeight: 1.95, marginTop: "1.25rem" }}>
                  WeldexのCRMは、WEB予約・LINE予約と完全連携した
                  カスタムシステムです。既製SaaSと異なり、
                  業種・業務フローに合わせてゼロから設計するため、
                  使わない機能に費用を払う必要がありません。
                </p>
              </div>

              <div className="crm-tech-cards">
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
        <section className="crm-section" style={{ background: "#fff" }}>
          <div className="crm-inner">
            <SecLabel>Comparison</SecLabel>
            <H2>Excel・紙管理との比較</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              システム化でここまで変わります。
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem", letterSpacing: "0.04em" }}>比較項目</th>
                    <th style={{ ...ZEN, padding: "0.85rem 1.25rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "left", fontSize: "0.75rem" }}>Excel・紙管理</th>
                    <th style={{ ...DM,  padding: "0.85rem 1.25rem", color: GOLD, fontWeight: 700, textAlign: "left", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Weldex CRM</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.label} style={{ background: row.highlight ? "#f5f3ff" : (i % 2 === 0 ? "#fff" : BG_L) }}>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", whiteSpace: "nowrap" }}>{row.label}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", color: GRAY, borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem" }}>{row.other}</td>
                      <td style={{ ...ZEN, padding: "0.8rem 1.25rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.82rem", fontWeight: row.highlight ? 700 : 600, color: row.weldexPurple ? PURPLE : NAVY }}>{row.weldex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── 納品物 ─── */}
        <section className="crm-section" style={{ background: BG_L }}>
          <div className="crm-inner">
            <SecLabel>Deliverables</SecLabel>
            <H2>納品物一覧</H2>
            <p style={{ ...ZEN, fontSize: "0.9rem", color: GRAY, marginBottom: "2rem" }}>
              Standardプランの納品物です。全て込みの価格です。
            </p>

            <div className="crm-del-grid">
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
        <section className="crm-section" style={{ background: "#fff" }}>
          <div className="crm-inner">
            <SecLabel>Pricing</SecLabel>
            <H2>料金</H2>

            {/* 初期費用 */}
            <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem" }}>初期費用（一括）</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", maxWidth: 560, marginBottom: "3rem" }}>
              <tbody>
                {CRM_INITIAL.map((item, i) => (
                  <tr key={item.name} style={{ background: i % 2 === 0 ? "#fff" : BG_L }}>
                    <td style={{ ...ZEN, padding: "0.75rem 1rem", color: NAVY, fontWeight: 500, borderBottom: `1px solid ${BORDER}` }}>{item.name}</td>
                    <td style={{ ...DM, padding: "0.75rem 1rem", fontWeight: item.price === null ? 400 : 700, color: item.price === null ? GRAY : NAVY, borderBottom: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>{fmtPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 月額プラン */}
            <p style={{ ...DM, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: GRAY, textTransform: "uppercase", marginBottom: "0.75rem" }}>月額 保守プラン</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: BORDER, maxWidth: 860 }} className="crm-plan-grid">
              <style>{`@media (max-width: 640px) { .crm-plan-grid { grid-template-columns: 1fr !important; } }`}</style>
              {CRM_PLANS.map((plan, idx) => {
                const { summary, features } = getPlanDisplay(CRM_PLANS, idx);
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
                            <circle cx="6.5" cy="6.5" r="6.5" fill={isDark ? "rgba(201,168,76,0.25)" : "#f5f3ff"} />
                            <path d="M3.5 6.5l2 2 4-4" stroke={isDark ? GOLD : PURPLE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

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
