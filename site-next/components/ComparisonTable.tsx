import type { CSSProperties } from "react";

const NAVY  = "#1a2540";
const GOLD  = "#b8960c";
const BLUE  = "#2563eb";
const GRAY  = "#6b7280";
const DM: CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

type Row = {
  label: string;
  a: string;
  b: string;
  weldex: string;
  star?: boolean;
  priceStar?: boolean;
};

const rows: Row[] = [
  { label: "技術",        a: "WordPress",   b: "Next.js",   weldex: "Next.js"   },
  { label: "品質",        a: "🔴 標準",      b: "🟢 高品質",  weldex: "🟢 高品質", star: true  },
  { label: "表示速度",    a: "🔴 遅い",      b: "🟢 高速",   weldex: "🟢 高速",   star: true  },
  { label: "費用",        a: "¥20万〜",      b: "¥80万〜",   weldex: "¥18万〜",   star: true, priceStar: true },
  { label: "納期",        a: "1〜2ヶ月",     b: "2〜3ヶ月",  weldex: "最短4週間",  star: true  },
  { label: "一社完結",    a: "🔴 なし",      b: "🔴 なし",   weldex: "🟢 あり",   star: true  },
  { label: "セキュリティ", a: "弱い",         b: "強い",      weldex: "強い"       },
];

const tdBase: CSSProperties = {
  padding: "0.85rem 1rem",
  fontSize: "0.82rem",
  borderBottom: "1px solid #f1f3f5",
  verticalAlign: "middle",
};

export default function ComparisonTable() {
  return (
    <section style={{ background: "#fff", padding: "5rem clamp(1.5rem,5vw,4rem)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* セクションヘッダー */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em",
            color: GOLD, marginBottom: "0.6rem", ...DM,
          }}>
            COMPARISON
          </div>
          <h2 style={{
            ...ZEN, fontWeight: 900,
            fontSize: "clamp(1.5rem,3vw,2rem)",
            color: NAVY, lineHeight: 1.3,
            marginBottom: "0.6rem",
          }}>
            3社の比較
          </h2>
          <p style={{ ...ZEN, fontSize: "0.875rem", color: GRAY, fontWeight: 400, lineHeight: 1.8 }}>
            品質とコストを同時に実現するのがWeldexです。
          </p>
        </div>

        {/* テーブルラッパー */}
        <div style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        }}>
          {/* SP横スクロール対応 */}
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{
              width: "100%",
              minWidth: 500,
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}>
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "24%" }} />
              </colgroup>

              {/* ヘッダー行 */}
              <thead>
                <tr style={{ background: NAVY }}>
                  <th style={{
                    ...tdBase, ...ZEN,
                    color: "rgba(255,255,255,0.55)", fontWeight: 500,
                    textAlign: "left", fontSize: "0.72rem", letterSpacing: "0.04em",
                    borderBottom: "none",
                  }}>
                    比較項目
                  </th>
                  {[
                    { label: "A社", sub: "WordPress系",   color: "rgba(255,255,255,0.75)" },
                    { label: "B社", sub: "大手制作会社",   color: "rgba(255,255,255,0.75)" },
                    { label: "Weldex", sub: "",            color: GOLD },
                  ].map(({ label, sub, color }) => (
                    <th key={label} style={{
                      ...tdBase, ...DM,
                      color, fontWeight: 700,
                      textAlign: "center", fontSize: "0.82rem",
                      borderBottom: "none",
                    }}>
                      {label}
                      {sub && (
                        <div style={{ fontSize: "0.65rem", fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: 2, ...ZEN }}>
                          {sub}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* データ行 */}
              <tbody>
                {rows.map((row, i) => {
                  const isEven = i % 2 === 1;
                  const rowBg  = isEven ? "#fafafa" : "#fff";

                  return (
                    <tr key={row.label} style={{ background: rowBg }}>
                      {/* 項目ラベル */}
                      <td style={{ ...tdBase, ...ZEN, color: NAVY, fontWeight: 500, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {row.label}
                      </td>

                      {/* A社 */}
                      <td style={{
                        ...tdBase, ...ZEN, color: GRAY, textAlign: "center", whiteSpace: "nowrap",
                        ...(row.priceStar ? { ...DM, fontSize: "0.94rem", fontWeight: 700 } : {}),
                      }}>
                        {row.a}
                      </td>

                      {/* B社 */}
                      <td style={{
                        ...tdBase, ...ZEN, color: GRAY, textAlign: "center", whiteSpace: "nowrap",
                        ...(row.priceStar ? { ...DM, fontSize: "0.94rem", fontWeight: 700 } : {}),
                      }}>
                        {row.b}
                      </td>

                      {/* Weldex */}
                      <td style={{
                        ...tdBase,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        background: row.star ? "#f0f7ff" : rowBg,
                        color:      row.star ? BLUE : GRAY,
                        fontWeight: row.star ? 700 : 400,
                        ...(row.priceStar
                          ? { ...DM, fontSize: "0.94rem", fontWeight: 900, color: BLUE }
                          : ZEN),
                      }}>
                        {row.weldex}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 注記 */}
        <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.875rem", ...ZEN }}>
          ※ 費用はWEB制作のみの目安です。
        </p>
      </div>
    </section>
  );
}
