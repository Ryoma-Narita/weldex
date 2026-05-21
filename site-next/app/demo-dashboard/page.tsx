"use client";
import { useState } from "react";
import Link from "next/link";

// ── 型 ───────────────────────────────────────────────

type Reservation = {
  id: string; name: string; menu: string; date: string; time: string;
  status: "confirmed" | "pending" | "cancelled"; tel: string; email: string; note: string;
};

type Customer = {
  name: string; kana: string; tel: string; email: string;
  status: "active" | "new" | "vip" | "inactive";
  visits: number; last: string; dob: string; note: string;
  history: { date: string; menu: string; status: string }[];
};

// ── データ ────────────────────────────────────────────

const RESERVATIONS: Reservation[] = [
  { id: "R-1024", name: "田中 美咲",  menu: "スタンダードプラン相談", date: "2026/05/21", time: "10:00", status: "confirmed", tel: "090-1234-5678", email: "tanaka@example.com",  note: "初回は詳しくサービス内容を聞きたい" },
  { id: "R-1023", name: "山本 健太",  menu: "デモ体験セッション",      date: "2026/05/21", time: "11:30", status: "confirmed", tel: "080-2345-6789", email: "yamamoto@example.com", note: "" },
  { id: "R-1022", name: "佐藤 由美",  menu: "初回カウンセリング",       date: "2026/05/21", time: "13:00", status: "pending",   tel: "070-3456-7890", email: "sato@example.com",     note: "昼休みのため13時以降希望" },
  { id: "R-1021", name: "鈴木 大輔",  menu: "継続サポート相談",        date: "2026/05/22", time: "10:30", status: "confirmed", tel: "090-4567-8901", email: "suzuki@example.com",   note: "" },
  { id: "R-1020", name: "伊藤 花子",  menu: "スタンダードプラン相談", date: "2026/05/22", time: "14:00", status: "confirmed", tel: "080-5678-9012", email: "ito@example.com",       note: "2回目。前回の提案書を再確認したい" },
  { id: "R-1019", name: "渡辺 翔",    menu: "デモ体験セッション",      date: "2026/05/23", time: "15:00", status: "cancelled", tel: "070-6789-0123", email: "watanabe@example.com", note: "" },
  { id: "R-1018", name: "高橋 奈々",  menu: "初回カウンセリング",       date: "2026/05/23", time: "11:00", status: "confirmed", tel: "090-7890-1234", email: "takahashi@example.com",note: "SNS広告経由" },
  { id: "R-1017", name: "中村 誠",    menu: "継続サポート相談",        date: "2026/05/24", time: "13:30", status: "pending",   tel: "080-8901-2345", email: "nakamura@example.com", note: "請求書の件も確認したい" },
];

const CUSTOMERS: Customer[] = [
  { name: "田中 美咲",  kana: "タナカ ミサキ",  tel: "090-1234-5678", email: "tanaka@example.com",     status: "active",   visits: 3,  last: "2026/05/21", dob: "1988/04/12", note: "丁寧な説明を好む。メール連絡希望。",
    history: [{ date: "2026/05/21", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/04/10", menu: "初回カウンセリング", status: "confirmed" }, { date: "2026/03/05", menu: "初回カウンセリング", status: "confirmed" }] },
  { name: "山本 健太",  kana: "ヤマモト ケンタ", tel: "080-2345-6789", email: "yamamoto@example.com",   status: "new",      visits: 1,  last: "2026/05/21", dob: "1995/11/30", note: "",
    history: [{ date: "2026/05/21", menu: "デモ体験セッション", status: "confirmed" }] },
  { name: "佐藤 由美",  kana: "サトウ ユミ",    tel: "070-3456-7890", email: "sato@example.com",        status: "active",   visits: 5,  last: "2026/05/18", dob: "1982/07/22", note: "昼休みのみ対応可。",
    history: [{ date: "2026/05/18", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/04/20", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/03/15", menu: "デモ体験セッション", status: "confirmed" }, { date: "2026/02/10", menu: "初回カウンセリング", status: "confirmed" }, { date: "2026/01/08", menu: "初回カウンセリング", status: "confirmed" }] },
  { name: "鈴木 大輔",  kana: "スズキ ダイスケ", tel: "090-4567-8901", email: "suzuki@example.com",     status: "active",   visits: 2,  last: "2026/05/10", dob: "1990/02/14", note: "",
    history: [{ date: "2026/05/10", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/04/01", menu: "初回カウンセリング", status: "confirmed" }] },
  { name: "伊藤 花子",  kana: "イトウ ハナコ",  tel: "080-5678-9012", email: "ito@example.com",         status: "vip",      visits: 8,  last: "2026/05/05", dob: "1975/09/03", note: "VIP顧客。最優先対応。提案書は必ず事前送付。",
    history: [{ date: "2026/05/05", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/04/12", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/03/08", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/02/15", menu: "デモ体験セッション", status: "confirmed" }, { date: "2026/01/20", menu: "スタンダードプラン相談", status: "confirmed" }] },
  { name: "渡辺 翔",    kana: "ワタナベ ショウ", tel: "070-6789-0123", email: "watanabe@example.com",   status: "inactive", visits: 1,  last: "2026/04/28", dob: "1998/06/18", note: "キャンセル歴あり。リマインド強化。",
    history: [{ date: "2026/05/23", menu: "デモ体験セッション", status: "cancelled" }, { date: "2026/04/28", menu: "初回カウンセリング", status: "confirmed" }] },
  { name: "高橋 奈々",  kana: "タカハシ ナナ",  tel: "090-7890-1234", email: "takahashi@example.com",  status: "active",   visits: 4,  last: "2026/05/23", dob: "1993/12/05", note: "SNS広告経由。InstagramのDMも可。",
    history: [{ date: "2026/05/23", menu: "初回カウンセリング", status: "confirmed" }, { date: "2026/04/30", menu: "デモ体験セッション", status: "confirmed" }, { date: "2026/04/05", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/03/20", menu: "初回カウンセリング", status: "confirmed" }] },
  { name: "中村 誠",    kana: "ナカムラ マコト", tel: "080-8901-2345", email: "nakamura@example.com",   status: "vip",      visits: 6,  last: "2026/05/01", dob: "1980/03/27", note: "VIP顧客。請求書は月末締め。",
    history: [{ date: "2026/05/01", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/04/08", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/03/12", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/02/18", menu: "デモ体験セッション", status: "confirmed" }, { date: "2026/01/15", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2025/12/10", menu: "初回カウンセリング", status: "confirmed" }] },
];

const TODAY_SLOTS = [
  { time: "10:00", name: "田中 美咲", menu: "スタンダードプラン相談", done: true  },
  { time: "11:30", name: "山本 健太", menu: "デモ体験セッション",      done: false },
  { time: "13:00", name: "佐藤 由美", menu: "初回カウンセリング",       done: false },
  { time: "14:30", name: "—",         menu: "空き",                    done: false },
  { time: "16:00", name: "—",         menu: "空き",                    done: false },
];

// ── ステータス定義 ─────────────────────────────────────

const S: Record<string, { label: string; bg: string; color: string }> = {
  confirmed: { label: "確定",      bg: "#dcfce7", color: "#16a34a" },
  pending:   { label: "保留中",    bg: "#fef9c3", color: "#ca8a04" },
  cancelled: { label: "キャンセル",bg: "#fee2e2", color: "#dc2626" },
  active:    { label: "通常",      bg: "#e0f2fe", color: "#0284c7" },
  new:       { label: "新規",      bg: "#f0fdf4", color: "#16a34a" },
  vip:       { label: "VIP",       bg: "#fdf4ff", color: "#9333ea" },
  inactive:  { label: "休眠",      bg: "#f1f5f9", color: "#64748b" },
};

function Badge({ status }: { status: string }) {
  const s = S[status] ?? { label: status, bg: "#f1f5f9", color: "#64748b" };
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 12px rgba(12,26,53,0.06)", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{sub}</div>
    </div>
  );
}

// ── 予約詳細モーダル ──────────────────────────────────

function ReservationModal({ r, onClose, onOpenCustomer }: { r: Reservation; onClose: () => void; onOpenCustomer: (name: string) => void }) {
  const [status, setStatus] = useState(r.status);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560, padding: "2rem", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* ハンドル */}
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 1.5rem" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 4 }}>{r.id}</div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0c1a35", margin: 0 }}>{r.date} {r.time}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "#94a3b8", padding: 4 }}>✕</button>
        </div>

        {/* 顧客情報 */}
        <div
          onClick={() => { onClose(); onOpenCustomer(r.name); }}
          style={{ background: "#f8fafc", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f8fafc")}
        >
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0c1a35", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontWeight: 700, flexShrink: 0 }}>
            {r.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#0c1a35", fontSize: "0.95rem" }}>{r.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.tel} · {r.email}</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#c9a84c", fontWeight: 600 }}>カルテを見る →</div>
        </div>

        {/* 予約詳細 */}
        {[
          { label: "メニュー", value: r.menu },
          { label: "日時",     value: `${r.date} ${r.time}` },
          ...(r.note ? [{ label: "備考", value: r.note }] : []),
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", padding: "0.6rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>
            <span style={{ color: "#94a3b8", width: 72, flexShrink: 0 }}>{label}</span>
            <span style={{ color: "#0c1a35", fontWeight: 500 }}>{value}</span>
          </div>
        ))}

        {/* ステータス変更 */}
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>ステータス変更</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["confirmed", "pending", "cancelled"] as const).map(st => (
              <button key={st} onClick={() => setStatus(st)} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: `2px solid ${status === st ? S[st].color : "#e2e8f0"}`, background: status === st ? S[st].bg : "#fff", color: S[st].color, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {S[st].label}
              </button>
            ))}
          </div>
        </div>

        <button style={{ width: "100%", marginTop: "1rem", padding: "0.85rem", background: "#0c1a35", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }} onClick={onClose}>
          保存して閉じる
        </button>
      </div>
    </div>
  );
}

// ── 顧客カルテ サイドパネル ───────────────────────────

function CustomerPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [note, setNote] = useState(customer.note);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: "#fff", width: "min(440px, 100vw)", height: "100%", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}
      >
        {/* ヘッダー */}
        <div style={{ background: "#0c1a35", padding: "2rem 1.5rem 1.5rem", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem", marginBottom: "1rem", padding: 0 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(201,168,76,0.2)", border: "2px solid #c9a84c", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
              {customer.name[0]}
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{customer.name}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{customer.kana}</div>
              <div style={{ marginTop: 6 }}><Badge status={customer.status} /></div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {/* 基本情報 */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>基本情報</div>
            {[
              { label: "電話", value: customer.tel },
              { label: "メール", value: customer.email },
              { label: "生年月日", value: customer.dob },
              { label: "来店回数", value: `${customer.visits}回` },
              { label: "最終来店", value: customer.last },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", padding: "0.55rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.82rem" }}>
                <span style={{ color: "#94a3b8", width: 72, flexShrink: 0 }}>{label}</span>
                <span style={{ color: "#0c1a35", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* 予約履歴 */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>予約履歴</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {customer.history.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.75rem", background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: S[h.status]?.color ?? "#94a3b8", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0c1a35" }}>{h.menu}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{h.date}</div>
                  </div>
                  <Badge status={h.status} />
                </div>
              ))}
            </div>
          </div>

          {/* メモ */}
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>スタッフメモ</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder="メモを入力..."
              style={{ width: "100%", padding: "0.75rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.82rem", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box", lineHeight: 1.7 }}
            />
            <button style={{ marginTop: 8, width: "100%", padding: "0.7rem", background: "#c9a84c", color: "#0c1a35", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              メモを保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── メインページ ─────────────────────────────────────

export default function DemoDashboard() {
  const [tab, setTab] = useState<"today" | "list" | "customers">("today");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerFilter, setCustomerFilter] = useState<"全て" | "vip" | "new" | "inactive">("全て");

  const openCustomer = (name: string) => {
    const c = CUSTOMERS.find(c => c.name === name);
    if (c) setSelectedCustomer(c);
  };

  const filteredCustomers = CUSTOMERS.filter(c =>
    customerFilter === "全て" ? true : c.status === customerFilter
  );

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

        {/* ヘッダー */}
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

        {/* KPI */}
        <div style={{ display: "flex", gap: 12, marginBottom: "1.75rem", flexWrap: "wrap" }}>
          <StatCard label="本日の予約"   value="3"    sub="残り 2件"         color="#0c1a35" />
          <StatCard label="今月の予約"   value="47"   sub="先月比 +12%"      color="#0284c7" />
          <StatCard label="顧客数"       value="128"  sub="新規 8名（今月）" color="#9333ea" />
          <StatCard label="キャンセル率" value="4.2%" sub="先月比 -1.1pt"    color="#16a34a" />
        </div>

        {/* タブ */}
        <div style={{ display: "flex", gap: 4, background: "#e8eaf0", borderRadius: 10, padding: 4, marginBottom: "1.5rem", width: "fit-content" }}>
          <button style={navStyle("today")}     onClick={() => setTab("today")}>本日のスケジュール</button>
          <button style={navStyle("list")}      onClick={() => setTab("list")}>予約一覧</button>
          <button style={navStyle("customers")} onClick={() => setTab("customers")}>顧客管理</button>
        </div>

        {/* ── 本日スケジュール ── */}
        {tab === "today" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 12px rgba(12,26,53,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c1a35", margin: 0 }}>5月21日（木）のタイムライン</h2>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>3件確定</span>
            </div>
            {TODAY_SLOTS.map((slot, i) => {
              const empty = slot.name === "—";
              const reservation = RESERVATIONS.find(r => r.name === slot.name && r.time === slot.time);
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (!empty && reservation) setSelectedReservation(reservation);
                    else if (!empty) openCustomer(slot.name);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "1.1rem 1.5rem",
                    background: slot.done ? "#fafafa" : "transparent",
                    borderLeft: `3px solid ${slot.done ? "#e2e8f0" : empty ? "#f1f5f9" : "#c9a84c"}`,
                    opacity: slot.done ? 0.55 : 1,
                    cursor: empty ? "default" : "pointer",
                    transition: "background 0.15s",
                    borderBottom: "1px solid #f8fafc",
                  }}
                  onMouseEnter={e => { if (!empty) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = slot.done ? "#fafafa" : "transparent"; }}
                >
                  <div style={{ width: 48, fontSize: "0.88rem", fontWeight: 700, color: slot.done ? "#94a3b8" : "#0c1a35", flexShrink: 0 }}>{slot.time}</div>
                  {empty ? (
                    <div style={{ fontSize: "0.8rem", color: "#d1d5db" }}>空き枠</div>
                  ) : (
                    <>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0c1a35", fontSize: "0.85rem", flexShrink: 0 }}>
                        {slot.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0c1a35" }}>{slot.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{slot.menu}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge status={slot.done ? "confirmed" : "pending"} />
                        <span style={{ fontSize: "0.72rem", color: "#c9a84c" }}>→</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── 予約一覧 ── */}
        {tab === "list" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 12px rgba(12,26,53,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c1a35", margin: 0 }}>予約一覧</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly placeholder="顧客名・ID で検索..." style={{ padding: "0.45rem 0.75rem", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: "0.78rem", width: 180, outline: "none", color: "#94a3b8" }} />
                <button style={{ padding: "0.45rem 1rem", background: "#0c1a35", color: "#fff", border: "none", borderRadius: 7, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>+ 新規予約</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["予約ID", "お名前", "メニュー", "日付", "時間", "ステータス", ""].map(h => (
                      <th key={h} style={{ padding: "0.7rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: "0.72rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESERVATIONS.map(r => (
                    <tr
                      key={r.id}
                      style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.12s" }}
                      onClick={() => setSelectedReservation(r)}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{r.id}</td>
                      <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                        <button
                          onClick={e => { e.stopPropagation(); openCustomer(r.name); }}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, color: "#0284c7", fontSize: "0.82rem", textDecoration: "underline", textDecorationColor: "rgba(2,132,199,0.3)" }}
                        >
                          {r.name}
                        </button>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.menu}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.date}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.time}</td>
                      <td style={{ padding: "0.85rem 1rem" }}><Badge status={r.status} /></td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#c9a84c", fontWeight: 600 }}>詳細 →</span>
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
                  <button key={i} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", background: p === "1" ? "#0c1a35" : "#fff", color: p === "1" ? "#fff" : "#64748b", fontSize: "0.75rem", cursor: "pointer" }}>{p}</button>
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
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["全て", "vip", "new", "inactive"] as const).map(f => (
                  <button key={f} onClick={() => setCustomerFilter(f)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.72rem", fontWeight: customerFilter === f ? 700 : 400, background: customerFilter === f ? "#0c1a35" : "transparent", color: customerFilter === f ? "#fff" : "#64748b", border: "1.5px solid " + (customerFilter === f ? "#0c1a35" : "#e2e8f0"), borderRadius: 99, cursor: "pointer" }}>
                    {f === "全て" ? "全て" : S[f].label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["顧客名", "ステータス", "来店回数", "最終来店", ""].map(h => (
                      <th key={h} style={{ padding: "0.7rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: "0.72rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.12s" }}
                      onClick={() => setSelectedCustomer(c)}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#0c1a35", flexShrink: 0 }}>
                            {c.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0284c7", textDecoration: "underline", textDecorationColor: "rgba(2,132,199,0.3)" }}>{c.name}</div>
                            <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{c.kana}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}><Badge status={c.status} /></td>
                      <td style={{ padding: "0.85rem 1rem", color: "#374151", fontWeight: 500 }}>{c.visits}回</td>
                      <td style={{ padding: "0.85rem 1rem", color: "#64748b", whiteSpace: "nowrap" }}>{c.last}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#c9a84c", fontWeight: 600 }}>カルテ →</span>
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

      {/* モーダル・パネル */}
      {selectedReservation && (
        <ReservationModal
          r={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onOpenCustomer={name => { setSelectedReservation(null); openCustomer(name); }}
        />
      )}
      {selectedCustomer && (
        <CustomerPanel customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}
