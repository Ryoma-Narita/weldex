"use client";
import { useState } from "react";

// ── 型 ───────────────────────────────────────────────

type Status = "confirmed" | "pending" | "cancelled";
type CustomerStatus = "active" | "new" | "vip" | "inactive";

type Reservation = {
  id: string; name: string; menu: string; date: string; time: string;
  status: Status; tel: string; email: string; note: string;
};

type Customer = {
  id: string; name: string; kana: string; tel: string; email: string;
  status: CustomerStatus; visits: number; last: string; dob: string; note: string;
  history: { date: string; menu: string; status: string }[];
};

type View = "dashboard" | "reservations" | "customers" | "settings";

// ── 初期データ ────────────────────────────────────────

const INIT_RESERVATIONS: Reservation[] = [
  { id: "R-1024", name: "田中 美咲",  menu: "スタンダードプラン相談", date: "2026/05/21", time: "10:00", status: "confirmed", tel: "090-1234-5678", email: "tanaka@example.com",     note: "初回は詳しくサービス内容を聞きたい" },
  { id: "R-1023", name: "山本 健太",  menu: "デモ体験セッション",      date: "2026/05/21", time: "11:30", status: "confirmed", tel: "080-2345-6789", email: "yamamoto@example.com",  note: "" },
  { id: "R-1022", name: "佐藤 由美",  menu: "初回カウンセリング",       date: "2026/05/21", time: "13:00", status: "pending",   tel: "070-3456-7890", email: "sato@example.com",      note: "昼休みのため13時以降希望" },
  { id: "R-1021", name: "鈴木 大輔",  menu: "継続サポート相談",        date: "2026/05/22", time: "10:30", status: "confirmed", tel: "090-4567-8901", email: "suzuki@example.com",    note: "" },
  { id: "R-1020", name: "伊藤 花子",  menu: "スタンダードプラン相談", date: "2026/05/22", time: "14:00", status: "confirmed", tel: "080-5678-9012", email: "ito@example.com",        note: "2回目。前回の提案書を再確認したい" },
  { id: "R-1019", name: "渡辺 翔",    menu: "デモ体験セッション",      date: "2026/05/23", time: "15:00", status: "cancelled", tel: "070-6789-0123", email: "watanabe@example.com",  note: "" },
  { id: "R-1018", name: "高橋 奈々",  menu: "初回カウンセリング",       date: "2026/05/23", time: "11:00", status: "confirmed", tel: "090-7890-1234", email: "takahashi@example.com", note: "SNS広告経由" },
  { id: "R-1017", name: "中村 誠",    menu: "継続サポート相談",        date: "2026/05/24", time: "13:30", status: "pending",   tel: "080-8901-2345", email: "nakamura@example.com",  note: "請求書の件も確認したい" },
];

const INIT_CUSTOMERS: Customer[] = [
  { id: "C-001", name: "田中 美咲",  kana: "タナカ ミサキ",  tel: "090-1234-5678", email: "tanaka@example.com",     status: "active",   visits: 3, last: "2026/05/21", dob: "1988/04/12", note: "丁寧な説明を好む。メール連絡希望。",   history: [{ date: "2026/05/21", menu: "スタンダードプラン相談", status: "confirmed" }, { date: "2026/04/10", menu: "初回カウンセリング", status: "confirmed" }] },
  { id: "C-002", name: "山本 健太",  kana: "ヤマモト ケンタ",tel: "080-2345-6789", email: "yamamoto@example.com",   status: "new",      visits: 1, last: "2026/05/21", dob: "1995/11/30", note: "",                                     history: [{ date: "2026/05/21", menu: "デモ体験セッション", status: "confirmed" }] },
  { id: "C-003", name: "佐藤 由美",  kana: "サトウ ユミ",   tel: "070-3456-7890", email: "sato@example.com",        status: "active",   visits: 5, last: "2026/05/18", dob: "1982/07/22", note: "昼休みのみ対応可。",                   history: [{ date: "2026/05/18", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/04/20", menu: "スタンダードプラン相談", status: "confirmed" }] },
  { id: "C-004", name: "伊藤 花子",  kana: "イトウ ハナコ", tel: "080-5678-9012", email: "ito@example.com",         status: "vip",      visits: 8, last: "2026/05/05", dob: "1975/09/03", note: "VIP顧客。最優先対応。提案書は必ず事前送付。", history: [{ date: "2026/05/05", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/04/12", menu: "スタンダードプラン相談", status: "confirmed" }] },
  { id: "C-005", name: "渡辺 翔",    kana: "ワタナベ ショウ",tel: "070-6789-0123", email: "watanabe@example.com",   status: "inactive", visits: 1, last: "2026/04/28", dob: "1998/06/18", note: "キャンセル歴あり。リマインド強化。",   history: [{ date: "2026/05/23", menu: "デモ体験セッション", status: "cancelled" }] },
  { id: "C-006", name: "中村 誠",    kana: "ナカムラ マコト",tel: "080-8901-2345", email: "nakamura@example.com",   status: "vip",      visits: 6, last: "2026/05/01", dob: "1980/03/27", note: "VIP顧客。請求書は月末締め。",          history: [{ date: "2026/05/01", menu: "継続サポート相談", status: "confirmed" }, { date: "2026/04/08", menu: "スタンダードプラン相談", status: "confirmed" }] },
];

const MENUS = ["初回カウンセリング", "スタンダードプラン相談", "デモ体験セッション", "継続サポート相談"];
const TIMES = ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  confirmed: { label: "確定",      bg: "#dcfce7", color: "#16a34a" },
  pending:   { label: "保留中",    bg: "#fef9c3", color: "#ca8a04" },
  cancelled: { label: "キャンセル",bg: "#fee2e2", color: "#dc2626" },
  active:    { label: "通常",      bg: "#e0f2fe", color: "#0284c7" },
  new:       { label: "新規",      bg: "#f0fdf4", color: "#16a34a" },
  vip:       { label: "VIP",       bg: "#fdf4ff", color: "#9333ea" },
  inactive:  { label: "休眠",      bg: "#f1f5f9", color: "#64748b" },
};

function Badge({ s }: { s: string }) {
  const b = BADGE[s] ?? { label: s, bg: "#f1f5f9", color: "#64748b" };
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: b.bg, color: b.color, whiteSpace: "nowrap" }}>{b.label}</span>;
}

// ── ログイン画面 ──────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const handle = () => {
    if (pw === "weldex2026") { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f7", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2.5rem 2rem", maxWidth: 360, width: "100%", boxShadow: "0 4px 32px rgba(12,26,53,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" }}>
          <div style={{ width: 36, height: 36, background: "#0c1a35", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontWeight: 700 }}>W</div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#0c1a35" }}>Weldex</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>予約管理システム</div>
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0c1a35", display: "block", marginBottom: 6 }}>パスワード</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="パスワードを入力"
            style={{ width: "100%", padding: "0.75rem", borderRadius: 8, border: `1.5px solid ${err ? "#dc2626" : "#e2e8f0"}`, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border 0.15s" }}
          />
          {err && <p style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 6 }}>パスワードが正しくありません</p>}
        </div>
        <button onClick={handle} style={{ width: "100%", padding: "0.85rem", background: "#0c1a35", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
          ログイン
        </button>
        <p style={{ fontSize: "0.68rem", color: "#94a3b8", textAlign: "center", marginTop: "1rem" }}>デモ用パスワード: weldex2026</p>
      </div>
    </div>
  );
}

// ── 予約フォームモーダル ──────────────────────────────

function ReservationForm({ initial, onSave, onClose }: {
  initial?: Partial<Reservation>;
  onSave: (r: Reservation) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState<Reservation>({
    id: initial?.id ?? `R-${Date.now()}`,
    name: initial?.name ?? "", menu: initial?.menu ?? MENUS[0],
    date: initial?.date ?? "", time: initial?.time ?? TIMES[0],
    status: initial?.status ?? "pending", tel: initial?.tel ?? "",
    email: initial?.email ?? "", note: initial?.note ?? "",
  });
  const isEdit = !!initial?.id;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 900, color: "#0c1a35", margin: 0 }}>{isEdit ? "予約を編集" : "新規予約を追加"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.2rem" }}>✕</button>
        </div>
        {[
          { label: "お名前 *", key: "name", type: "text", placeholder: "山田 太郎" },
          { label: "電話番号 *", key: "tel", type: "tel", placeholder: "090-0000-0000" },
          { label: "メールアドレス", key: "email", type: "email", placeholder: "example@mail.com" },
          { label: "日付 *", key: "date", type: "text", placeholder: "2026/05/25" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: "0.9rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0c1a35", display: "block", marginBottom: 4 }}>{label}</label>
            <input type={type} placeholder={placeholder} value={(f as Record<string, string>)[key]} onChange={e => setF({ ...f, [key]: e.target.value })}
              style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        ))}
        {[
          { label: "メニュー", key: "menu", options: MENUS },
          { label: "時間", key: "time", options: TIMES },
          { label: "ステータス", key: "status", options: ["pending", "confirmed", "cancelled"] },
        ].map(({ label, key, options }) => (
          <div key={key} style={{ marginBottom: "0.9rem" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0c1a35", display: "block", marginBottom: 4 }}>{label}</label>
            <select value={(f as Record<string, string>)[key]} onChange={e => setF({ ...f, [key]: e.target.value })}
              style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }}>
              {options.map(o => <option key={o} value={o}>{BADGE[o]?.label ?? o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0c1a35", display: "block", marginBottom: 4 }}>備考</label>
          <textarea value={f.note} onChange={e => setF({ ...f, note: e.target.value })} rows={3}
            style={{ width: "100%", padding: "0.65rem 0.9rem", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", background: "#fff", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>キャンセル</button>
          <button onClick={() => { if (f.name && f.date && f.tel) { onSave(f); onClose(); } }}
            style={{ flex: 2, padding: "0.75rem", background: "#0c1a35", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            {isEdit ? "更新する" : "追加する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 顧客カルテ パネル ─────────────────────────────────

function CustomerPanel({ c, onClose, onSave }: { c: Customer; onClose: () => void; onSave: (c: Customer) => void }) {
  const [note, setNote] = useState(c.note);
  const [status, setStatus] = useState(c.status);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", width: "min(460px, 100vw)", height: "100%", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#0c1a35", padding: "2rem 1.5rem 1.5rem", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem", marginBottom: "1rem", padding: 0 }}>✕ 閉じる</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(201,168,76,0.2)", border: "2px solid #c9a84c", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: "1.3rem", fontWeight: 700, flexShrink: 0 }}>
              {c.name[0]}
            </div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{c.name}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{c.kana} · {c.id}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["active", "new", "vip", "inactive"] as CustomerStatus[]).map(st => (
                  <button key={st} onClick={() => setStatus(st)} style={{ padding: "2px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", border: `1.5px solid ${status === st ? BADGE[st].color : "rgba(255,255,255,0.2)"}`, background: status === st ? BADGE[st].bg : "transparent", color: status === st ? BADGE[st].color : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}>
                    {BADGE[st].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>基本情報</div>
            {[{ label: "電話", value: c.tel }, { label: "メール", value: c.email }, { label: "生年月日", value: c.dob }, { label: "来店回数", value: `${c.visits}回` }, { label: "最終来店", value: c.last }].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", padding: "0.55rem 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.82rem" }}>
                <span style={{ color: "#94a3b8", width: 80, flexShrink: 0 }}>{label}</span>
                <span style={{ color: "#0c1a35", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>予約・来店履歴</div>
            {c.history.length === 0 ? <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>履歴なし</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {c.history.map((h, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.75rem", background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: BADGE[h.status]?.color ?? "#94a3b8", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0c1a35" }}>{h.menu}</div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{h.date}</div>
                    </div>
                    <Badge s={h.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>スタッフメモ</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="メモを入力..."
              style={{ width: "100%", padding: "0.75rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: "0.82rem", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box", lineHeight: 1.7 }} />
            <button onClick={() => { onSave({ ...c, note, status }); onClose(); }}
              style={{ marginTop: 8, width: "100%", padding: "0.7rem", background: "#c9a84c", color: "#0c1a35", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              保存して閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── メインページ ─────────────────────────────────────

export default function AdminReservations() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [reservations, setReservations] = useState<Reservation[]>(INIT_RESERVATIONS);
  const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const saveReservation = (r: Reservation) => {
    setReservations(prev => prev.find(x => x.id === r.id) ? prev.map(x => x.id === r.id ? r : x) : [r, ...prev]);
    showToast(reservations.find(x => x.id === r.id) ? "予約を更新しました" : "予約を追加しました");
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    setDeleteTarget(null);
    showToast("予約を削除しました");
  };

  const saveCustomer = (c: Customer) => {
    setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
    showToast("顧客情報を保存しました");
  };

  const filteredReservations = reservations.filter(r =>
    r.name.includes(search) || r.id.includes(search) || r.menu.includes(search)
  );

  const NAV: { key: View; label: string; icon: string }[] = [
    { key: "dashboard",    label: "ダッシュボード", icon: "▦" },
    { key: "reservations", label: "予約管理",        icon: "◷" },
    { key: "customers",    label: "顧客管理",        icon: "◎" },
    { key: "settings",     label: "設定",            icon: "⚙" },
  ];

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f7", display: "flex" }}>

      {/* ── サイドバー ── */}
      <>
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.4)" }} onClick={() => setSidebarOpen(false)} className="md:hidden" />}
        <aside style={{
          position: "fixed", top: 0, left: sidebarOpen ? 0 : "-240px", bottom: 0,
          width: 220, background: "#0c1a35", zIndex: 100,
          display: "flex", flexDirection: "column", paddingTop: "1.5rem",
          transition: "left 0.25s ease",
        }} className="md:left-0">
          <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, background: "#c9a84c", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0c1a35", fontSize: "0.9rem" }}>W</div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>Weldex</div>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)" }}>予約管理システム</div>
              </div>
            </div>
          </div>
          <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
            {NAV.map(n => (
              <button key={n.key} onClick={() => { setView(n.key); setSidebarOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "0.7rem 0.75rem", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, textAlign: "left", background: view === n.key ? "rgba(201,168,76,0.15)" : "transparent", color: view === n.key ? "#c9a84c" : "rgba(255,255,255,0.55)", fontWeight: view === n.key ? 700 : 400, fontSize: "0.85rem", transition: "all 0.15s" }}>
                <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => setAuthed(false)} style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "none", borderRadius: 8, fontSize: "0.78rem", cursor: "pointer" }}>
              ログアウト
            </button>
          </div>
        </aside>
      </>

      {/* ── メインコンテンツ ── */}
      <div style={{ flex: 1, marginLeft: 0, minHeight: "100vh", display: "flex", flexDirection: "column" }} className="md:ml-[220px]">

        {/* トップバー */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#64748b", fontSize: "1.2rem" }} className="md:hidden">☰</button>
            <h1 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0c1a35", margin: 0 }}>
              {NAV.find(n => n.key === view)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0c1a35", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontWeight: 700, fontSize: "0.8rem" }}>管</div>
          </div>
        </div>

        <div style={{ padding: "1.5rem", flex: 1 }}>

          {/* ── ダッシュボード ── */}
          {view === "dashboard" && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "本日の予約",   value: reservations.filter(r => r.date === "2026/05/21").length.toString(), sub: "確定・保留含む",  color: "#0c1a35" },
                  { label: "今月の予約",   value: reservations.length.toString(),  sub: "全件数",          color: "#0284c7" },
                  { label: "顧客数",       value: customers.length.toString(),      sub: `VIP ${customers.filter(c => c.status === "vip").length}名`, color: "#9333ea" },
                  { label: "キャンセル",   value: reservations.filter(r => r.status === "cancelled").length.toString(), sub: "今月",  color: "#dc2626" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 8px rgba(12,26,53,0.06)", flex: 1, minWidth: 130 }}>
                    <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(12,26,53,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0c1a35" }}>直近の予約</span>
                  <button onClick={() => setView("reservations")} style={{ fontSize: "0.75rem", color: "#c9a84c", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>すべて見る →</button>
                </div>
                {reservations.slice(0, 5).map(r => (
                  <div key={r.id} onClick={() => setEditingReservation(r)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.85rem 1.25rem", borderBottom: "1px solid #f8fafc", cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0c1a35" }}>{r.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{r.date} {r.time} · {r.menu}</div>
                    </div>
                    <Badge s={r.status} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── 予約管理 ── */}
          {view === "reservations" && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(12,26,53,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="名前・ID・メニューで検索"
                  style={{ flex: 1, minWidth: 180, padding: "0.5rem 0.8rem", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: "0.82rem", outline: "none" }} />
                <button onClick={() => setEditingReservation("new")}
                  style={{ padding: "0.5rem 1.1rem", background: "#0c1a35", color: "#fff", border: "none", borderRadius: 7, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ＋ 新規追加
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["予約ID", "お名前", "メニュー", "日付", "時間", "ステータス", "操作"].map(h => (
                        <th key={h} style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: "0.7rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map(r => (
                      <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "0.8rem 1rem", color: "#94a3b8", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{r.id}</td>
                        <td style={{ padding: "0.8rem 1rem", whiteSpace: "nowrap" }}>
                          <button onClick={() => setSelectedCustomer(customers.find(c => c.name === r.name) ?? null)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, color: "#0284c7", fontSize: "0.82rem", textDecoration: "underline", textDecorationColor: "rgba(2,132,199,0.3)" }}>
                            {r.name}
                          </button>
                        </td>
                        <td style={{ padding: "0.8rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.menu}</td>
                        <td style={{ padding: "0.8rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>{r.date}</td>
                        <td style={{ padding: "0.8rem 1rem", color: "#374151" }}>{r.time}</td>
                        <td style={{ padding: "0.8rem 1rem" }}><Badge s={r.status} /></td>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setEditingReservation(r)} style={{ fontSize: "0.72rem", padding: "3px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#374151" }}>編集</button>
                            <button onClick={() => setDeleteTarget(r.id)} style={{ fontSize: "0.72rem", padding: "3px 10px", border: "1px solid #fee2e2", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#dc2626" }}>削除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredReservations.length === 0 && (
                  <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>該当する予約が見つかりません</div>
                )}
              </div>
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #f1f5f9", fontSize: "0.72rem", color: "#94a3b8" }}>
                {filteredReservations.length}件表示
              </div>
            </div>
          )}

          {/* ── 顧客管理 ── */}
          {view === "customers" && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(12,26,53,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0c1a35" }}>顧客一覧 — {customers.length}名</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["顧客名", "ステータス", "来店回数", "最終来店", "メール", ""].map(h => (
                        <th key={h} style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: "0.7rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.12s" }}
                        onClick={() => setSelectedCustomer(c)}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0c1a35", fontSize: "0.75rem", flexShrink: 0 }}>{c.name[0]}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#0c1a35" }}>{c.name}</div>
                              <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{c.kana}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.8rem 1rem" }}><Badge s={c.status} /></td>
                        <td style={{ padding: "0.8rem 1rem", color: "#374151", fontWeight: 500 }}>{c.visits}回</td>
                        <td style={{ padding: "0.8rem 1rem", color: "#64748b", whiteSpace: "nowrap" }}>{c.last}</td>
                        <td style={{ padding: "0.8rem 1rem", color: "#64748b", fontSize: "0.78rem" }}>{c.email}</td>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <span style={{ fontSize: "0.75rem", color: "#c9a84c", fontWeight: 600 }}>カルテ →</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 設定 ── */}
          {view === "settings" && (
            <div style={{ maxWidth: 560 }}>
              {[
                { title: "基本設定", items: [{ label: "事業者名", value: "Weldex" }, { label: "代表メール", value: "info@weldex.jp" }, { label: "予約受付時間", value: "10:00 〜 17:00" }] },
                { title: "通知設定", items: [{ label: "予約確定メール", value: "有効" }, { label: "リマインドメール", value: "前日 18:00" }, { label: "キャンセル通知", value: "有効" }] },
              ].map(({ title, items }) => (
                <div key={title} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(12,26,53,0.06)", marginBottom: "1.25rem", overflow: "hidden" }}>
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0c1a35" }}>{title}</span>
                  </div>
                  {items.map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f8fafc", fontSize: "0.85rem" }}>
                      <span style={{ color: "#374151" }}>{label}</span>
                      <span style={{ color: "#0c1a35", fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
              <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                ※ バックエンド接続後に編集機能が有効になります
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── モーダル類 ── */}
      {editingReservation && (
        <ReservationForm
          initial={editingReservation === "new" ? undefined : editingReservation}
          onSave={saveReservation}
          onClose={() => setEditingReservation(null)}
        />
      )}
      {selectedCustomer && (
        <CustomerPanel c={selectedCustomer} onClose={() => setSelectedCustomer(null)} onSave={saveCustomer} />
      )}

      {/* 削除確認 */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setDeleteTarget(null)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 14, padding: "2rem", maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.2rem" }}>⚠</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0c1a35", marginBottom: "0.5rem" }}>予約を削除しますか？</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1.5rem" }}>この操作は取り消せません。</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "0.7rem", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: "0.85rem", cursor: "pointer", color: "#64748b" }}>キャンセル</button>
              <button onClick={() => deleteReservation(deleteTarget)} style={{ flex: 1, padding: "0.7rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>削除する</button>
            </div>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", background: "#0c1a35", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: 99, fontSize: "0.82rem", fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 900, whiteSpace: "nowrap" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
