"use client";
import { useState } from "react";
import Link from "next/link";

// ── ダミーデータ ──────────────────────────────────────

const RESERVATIONS = [
  { id: "R-1024", name: "田中 美咲",  menu: "スタンダードプラン相談", date: "2026/05/21", time: "10:00", status: "confirmed" },
  { id: "R-1023", name: "山本 健太",  menu: "デモ体験セッション",      date: "2026/05/21", time: "11:30", status: "confirmed" },
  { id: "R-1022", name: "佐藤 由美",  menu: "初回カウンセリング",       date: "2026/05/21", time: "13:00", status: "pending"   },
  { id: "R-1021", name: "鈴木 大輔",  menu: "継続サポート相談",        date: "2026/05/22", time: "10:30", status: "confirmed" },
  { id: "R-1020", name: "伊藤 花子",  menu: "スタンダードプラン相談", date: "2026/05/22", time: "14:00", status: "confirmed" },
  { id: "R-1019", name: "渡辺 翔",    menu: "デモ体験セッション",      date: "2026/05/23", time: "15:00", status: "cancelled" },
  { id: "R-1018", name: "高橋 奈々",  menu: "初回カウンセリング",       date: "2026/05/23", time: "11:00", status: "confirmed" },
  { id: "R-1017", name: "中村 誠",    menu: "継続サポート相談",        date: "2026/05/24", time: "13:30", status: "pending"   },
];

const CUSTOMERS = [
  { name: "田中 美咲",  visits: 3,  last: "2026/05/21", status: "active"   },
  { name: "山本 健太",  visits: 1,  last: "2026/05/21", status: "new"      },
  { name: "佐藤 由美",  visits: 5,  last: "2026/05/18", status: "active"   },
  { name: "鈴木 大輔",  visits: 2,  last: "2026/05/10", status: "active"   },
  { name: "伊藤 花子",  visits: 8,  last: "2026/05/05", status: "vip"      },
  { name: "渡辺 翔",    visits: 1,  last: "2026/04/28", status: "inactive" },
  { name: "高橋 奈々",  visits: 4,  last: "2026/05/23", status: "active"   },
  { name: "中村 誠",    visits: 6,  last: "2026/05/01", status: "vip"      },
];

const TODAY_SLOTS = [
  { time: "10:00", name: "田中 美咲",  menu: "スタンダードプラン",    done: true  },
  { time: "11:30", name: "山本 健太",  menu: "デモ体験セッション",    done: false },
  { time: "13:00", name: "佐藤 由美",  menu: "初回カウンセリング",    done: false },
  { time: "14:30", name: "—",          menu: "空き",                  done: false },
  { time: "16:00", name: "—",          menu: "空き",                  done: false },
];

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  confirmed: { label: "確定",     bg: "#dcfce7", color: "#16a34a" },
  pending:   { label: "保留中",   bg: "#fef9c3", color: "#ca8a04" },
  cancelled: { label: "キャンセル", bg: "#fee2e2", color: "#dc2626" },
  active:    { label: "通常",     bg: "#e0f2fe", color: "#0284c7" },
  new:       { label: "新規",     bg: "#f0fdf4", color: "#16a34a" },
  vip:       { label: "VIP",      bg: "#fdf4ff", color: "#9333ea" },
  inactive:  { label: "休眠",     bg: "#f1f5f9", color: "#64748b" },
};

// ── UI パーツ ────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 12px rgba(12,26,53,0.06)", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{sub}</div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────

export default function DashboardDemo() {
  const [tab, setTab] = useState<"today" | "list" | "customers">("today");

  const navStyle = (t: typeof tab): React.CSSProperties => ({
    padding: "0.55rem 1.1rem", fontSize: "0.82rem", fontWeight: 600,
    border: "none", borderRadius: 8, cursor: "pointer",
    background: tab === t ? "#0c1a35" : "transparent",
    color: tab === t ? "#fff" : "#64748b",
    transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f7", paddingTop: 80 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* ── ヘッダー ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/works" style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              ← デモ一覧に戻る
            </Link>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0c1a35", margin: 0 }}>予約管理ダッシュボード</h1>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "2px 0 0" }}>DEMO — 2026年5月21日（木）</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0c1a35", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontWeight: 700, fontSize: "0.85rem" }}>管</div>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0c1a35" }}>管理者</div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>admin</div>
            </div>
          </div>
        </div>

        {/* ── KPI カード ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: "1.75rem", flexWrap: "wrap" }}>
          <StatCard label="本日の予約"    value="3"    sub="残り 2件"         color="#0c1a35" />
          <StatCard label="今月の予約"    value="47"   sub="先月比 +12%"      color="#0284c7" />
          <StatCard label="顧客数"        value="128"  sub="新規 8名（今月）" color="#9333ea" />
          <StatCard label="キャンセル率"  value="4.2%" sub="先月比 -1.1pt"    color="#16a34a" />
        </div>

        {/* ── タブ ── */}
        <div style={{ display: "flex", gap: 4, background: "#e8eaf0", borderRadius: 10, padding: 4, marginBottom: "1.5rem", width: "fit-content" }}>
          <button style={navStyle("today")}     onClick={() => setTab("today")}>本日のスケジュール</button>
          <button style={navStyle("list")}      onClick={() => setTab("list")}>予約一覧</button>
          <button style={navStyle("customers")} onClick={() => setTab("customers")}>顧客管理</button>
        </div>

        {/* ── 本日のスケジュール ── */}
        {tab === "today" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 12px rgba(12,26,53,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c1a35", margin: 0 }}>5月21日（木）のタイムライン</h2>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>3件確定</span>
            </div>
            <div style={{ padding: "0.5rem 0" }}>
              {TODAY_SLOTS.map((s, i) => {
                const empty = s.name === "—";
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "1rem 1.5rem",
                    background: s.done ? "#fafafa" : "transparent",
                    borderLeft: `3px solid ${s.done ? "#e2e8f0" : empty ? "#e2e8f0" : "#c9a84c"}`,
                    marginLeft: 0,
                    opacity: s.done ? 0.5 : 1,
                  }}>
                    <div style={{ width: 48, fontSize: "0.88rem", fontWeight: 700, color: s.done ? "#94a3b8" : "#0c1a35", flexShrink: 0 }}>{s.time}</div>
                    {empty ? (
                      <div style={{ fontSize: "0.82rem", color: "#d1d5db" }}>空き枠</div>
                    ) : (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0c1a35" }}>{s.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{s.menu}</div>
                        </div>
                        {s.done && <Badge status="confirmed" />}
                        {!s.done && <Badge status="pending" />}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 予約一覧 ── */}
        {tab === "list" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 12px rgba(12,26,53,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c1a35", margin: 0 }}>予約一覧</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  readOnly
                  placeholder="顧客名・ID で検索..."
                  style={{ padding: "0.45rem 0.75rem", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: "0.78rem", width: 180, outline: "none", color: "#94a3b8" }}
                />
                <button style={{ padding: "0.45rem 1rem", background: "#0c1a35", color: "#fff", border: "none", borderRadius: 7, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                  + 新規予約
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["予約ID", "お名前", "メニュー", "日付", "時間", "ステータス", ""].map((h) => (
                      <th key={h} style={{ padding: "0.7rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: "0.72rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESERVATIONS.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{r.id}</td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#0c1a35", whiteSpace: "nowrap" }}>{r.name}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.menu}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.date}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.time}</td>
                      <td style={{ padding: "0.85rem 1rem" }}><Badge status={r.status} /></td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <button style={{ fontSize: "0.72rem", color: "#64748b", background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "0.85rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>全 8件 表示中</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["<", "1", "2", "3", ">"].map((p, i) => (
                  <button key={i} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", background: p === "1" ? "#0c1a35" : "#fff", color: p === "1" ? "#fff" : "#64748b", fontSize: "0.75rem", cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 顧客管理 ── */}
        {tab === "customers" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 12px rgba(12,26,53,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c1a35", margin: 0 }}>顧客管理</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {["全て", "VIP", "新規", "休眠"].map((f) => (
                  <button key={f} style={{ padding: "0.35rem 0.75rem", fontSize: "0.72rem", fontWeight: f === "全て" ? 700 : 400, background: f === "全て" ? "#0c1a35" : "transparent", color: f === "全て" ? "#fff" : "#64748b", border: "1.5px solid " + (f === "全て" ? "#0c1a35" : "#e2e8f0"), borderRadius: 99, cursor: "pointer" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["顧客名", "ステータス", "来店回数", "最終来店", ""].map((h) => (
                      <th key={h} style={{ padding: "0.7rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: "0.72rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CUSTOMERS.map((c, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#0c1a35", flexShrink: 0 }}>
                            {c.name[0]}
                          </div>
                          <span style={{ fontWeight: 700, color: "#0c1a35", whiteSpace: "nowrap" }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}><Badge status={c.status} /></td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", fontWeight: 500 }}>{c.visits}回</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#64748b", whiteSpace: "nowrap" }}>{c.last}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <button style={{ fontSize: "0.72rem", color: "#64748b", background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#94a3b8", marginTop: "2rem" }}>
          ※ これはデモページです。表示されているデータはすべてサンプルです。
        </p>
      </div>
    </div>
  );
}
