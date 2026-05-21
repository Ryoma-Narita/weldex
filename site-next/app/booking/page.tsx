"use client";
import { useState } from "react";
import Link from "next/link";

// ── データ ──────────────────────────────────────────

const MENUS = [
  { id: "m1", name: "初回カウンセリング", duration: "30分", price: "無料", desc: "現状のヒアリングとご要望の確認" },
  { id: "m2", name: "スタンダードプラン相談", duration: "45分", price: "無料", desc: "サービス内容・料金のご案内" },
  { id: "m3", name: "デモ体験セッション", duration: "60分", price: "無料", desc: "実際のシステムを操作しながらご確認" },
  { id: "m4", name: "継続サポート相談", duration: "30分", price: "無料", desc: "既存のお客様向けサポート相談" },
];

const TIMES = ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const UNAVAILABLE = new Set(["10:30", "13:30", "15:00"]);

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

// ── コンポーネント ────────────────────────────────────

export default function BookingDemo() {
  const today = new Date();
  const [step, setStep] = useState(1);
  const [menu, setMenu] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [date, setDate] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", kana: "", tel: "", email: "", note: "" });
  const [complete, setComplete] = useState(false);

  const selectedMenu = MENUS.find((m) => m.id === menu);
  const cells = buildCalendar(calYear, calMonth);

  const isDisabled = (d: number) => {
    const dt = new Date(calYear, calMonth, d);
    const dow = dt.getDay();
    return dt < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || dow === 0;
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setDate(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setDate(null);
  };

  const dateLabel = date
    ? `${calYear}年${MONTH_NAMES[calMonth]}${date}日（${WEEKDAYS[new Date(calYear, calMonth, date).getDay()]}）`
    : null;

  const canNext1 = !!menu;
  const canNext2 = !!date;
  const canNext3 = !!time;
  const canNext4 = form.name && form.kana && form.tel && form.email;

  const handleSubmit = () => setComplete(true);

  // ── スタイル定数 ──
  const s = {
    wrap: { minHeight: "100vh", background: "#f8f9fc", paddingTop: 80 } as React.CSSProperties,
    inner: { maxWidth: 640, margin: "0 auto", padding: "2.5rem 1.25rem 4rem" } as React.CSSProperties,
    card: { background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 24px rgba(12,26,53,0.07)", marginBottom: "1.5rem" } as React.CSSProperties,
    label: { fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#c9a84c", marginBottom: "0.5rem" },
    h1: { fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 900, color: "#0c1a35", marginBottom: "0.25rem" } as React.CSSProperties,
    sub: { fontSize: "0.82rem", color: "#64748b", marginBottom: "1.75rem" } as React.CSSProperties,
    btn: {
      display: "block", width: "100%", padding: "0.9rem",
      background: "#0c1a35", color: "#fff", border: "none",
      borderRadius: 10, fontSize: "0.9rem", fontWeight: 700,
      cursor: "pointer", textAlign: "center" as const, marginTop: "1.25rem",
    } as React.CSSProperties,
    btnDisabled: { opacity: 0.35, cursor: "not-allowed" } as React.CSSProperties,
    btnGold: { background: "#c9a84c", color: "#0c1a35" } as React.CSSProperties,
    back: { background: "none", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 10, padding: "0.7rem 1.25rem", fontSize: "0.82rem", cursor: "pointer", marginRight: 8 } as React.CSSProperties,
    row: { display: "flex", gap: 8, marginTop: "1.25rem", alignItems: "center" } as React.CSSProperties,
  };

  if (complete) {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <div style={{ ...s.card, textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={s.label}>予約完了</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0c1a35", marginBottom: "0.5rem" }}>ご予約が完了しました</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.8, marginBottom: "2rem" }}>
              ご登録のメールアドレスへ確認メールをお送りします。<br />
              当日は{dateLabel}の{time}にお越しください。
            </p>
            <div style={{ background: "#f8f9fc", borderRadius: 10, padding: "1.25rem", textAlign: "left", marginBottom: "2rem", fontSize: "0.82rem", lineHeight: 2, color: "#0c1a35" }}>
              <div><span style={{ color: "#64748b" }}>メニュー：</span>{selectedMenu?.name}</div>
              <div><span style={{ color: "#64748b" }}>日時：</span>{dateLabel} {time}</div>
              <div><span style={{ color: "#64748b" }}>お名前：</span>{form.name} 様</div>
              <div><span style={{ color: "#64748b" }}>メール：</span>{form.email}</div>
            </div>
            <Link href="/works" style={{ display: "inline-block", fontSize: "0.82rem", color: "#c9a84c", textDecoration: "none", fontWeight: 500 }}>
              ← デモ一覧に戻る
            </Link>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#94a3b8" }}>
            ※ これはデモページです。実際の予約は行われません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.inner}>

        {/* ヘッダー */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/works" style={{ fontSize: "0.78rem", color: "#94a3b8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "1.25rem" }}>
            ← デモ一覧に戻る
          </Link>
          <div style={s.label}>BOOKING DEMO</div>
          <h1 style={s.h1}>オンライン予約</h1>
          <p style={s.sub}>ご希望のメニューと日時をお選びください（デモ）</p>
        </div>

        {/* ステッパー */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem", gap: 0 }}>
          {["メニュー", "日付", "時間", "お客様情報", "確認"].map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 4 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", fontSize: "0.72rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#c9a84c" : active ? "#0c1a35" : "#e2e8f0",
                    color: done || active ? "#fff" : "#94a3b8",
                    flexShrink: 0,
                  }}>
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontSize: "0.58rem", color: active ? "#0c1a35" : "#94a3b8", fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
                {i < 4 && <div style={{ flex: 1, height: 1, background: done ? "#c9a84c" : "#e2e8f0", margin: "0 4px", marginBottom: 20 }} />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: メニュー ── */}
        {step === 1 && (
          <div style={s.card}>
            <div style={s.label}>Step 1</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0c1a35", marginBottom: "1.25rem" }}>メニューを選択</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MENUS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMenu(m.id)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "1rem 1.25rem", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: menu === m.id ? "2px solid #0c1a35" : "1.5px solid #e2e8f0",
                    background: menu === m.id ? "#f0f4fa" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0c1a35", marginBottom: 2 }}>{m.name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#64748b" }}>{m.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{m.duration}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#c9a84c" }}>{m.price}</div>
                  </div>
                </button>
              ))}
            </div>
            <button style={{ ...s.btn, ...(canNext1 ? {} : s.btnDisabled) }} onClick={() => canNext1 && setStep(2)} disabled={!canNext1}>
              次へ →
            </button>
          </div>
        )}

        {/* ── STEP 2: 日付 ── */}
        {step === 2 && (
          <div style={s.card}>
            <div style={s.label}>Step 2</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0c1a35", marginBottom: "1.25rem" }}>日付を選択</h2>
            {/* カレンダーヘッダー */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <button onClick={prevMonth} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 32, height: 32, cursor: "pointer", fontSize: "0.9rem" }}>‹</button>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0c1a35" }}>{calYear}年 {MONTH_NAMES[calMonth]}</span>
              <button onClick={nextMonth} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 32, height: 32, cursor: "pointer", fontSize: "0.9rem" }}>›</button>
            </div>
            {/* 曜日ヘッダー */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
              {WEEKDAYS.map((w, i) => (
                <div key={w} style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#94a3b8", paddingBottom: 4 }}>{w}</div>
              ))}
            </div>
            {/* 日付グリッド */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const disabled = isDisabled(d);
                const selected = date === d;
                const dow = new Date(calYear, calMonth, d).getDay();
                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => setDate(d)}
                    style={{
                      padding: "0.5rem 0", borderRadius: 8, border: "none",
                      background: selected ? "#0c1a35" : "transparent",
                      color: disabled ? "#d1d5db" : selected ? "#fff" : dow === 0 ? "#ef4444" : dow === 6 ? "#3b82f6" : "#0c1a35",
                      fontSize: "0.85rem", fontWeight: selected ? 700 : 400,
                      cursor: disabled ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            {date && (
              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "#f0f4fa", borderRadius: 8, fontSize: "0.82rem", color: "#0c1a35", fontWeight: 500 }}>
                選択中：{dateLabel}
              </div>
            )}
            <div style={s.row}>
              <button style={s.back} onClick={() => setStep(1)}>← 戻る</button>
              <button style={{ ...s.btn, flex: 1, marginTop: 0, ...(canNext2 ? {} : s.btnDisabled) }} onClick={() => canNext2 && setStep(3)} disabled={!canNext2}>
                次へ →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: 時間 ── */}
        {step === 3 && (
          <div style={s.card}>
            <div style={s.label}>Step 3</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0c1a35", marginBottom: "0.5rem" }}>時間を選択</h2>
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "1.25rem" }}>{dateLabel}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {TIMES.map((t) => {
                const unavail = UNAVAILABLE.has(t);
                return (
                  <button
                    key={t}
                    disabled={unavail}
                    onClick={() => setTime(t)}
                    style={{
                      padding: "0.6rem", borderRadius: 8,
                      border: time === t ? "2px solid #0c1a35" : "1.5px solid #e2e8f0",
                      background: unavail ? "#f8f9fc" : time === t ? "#0c1a35" : "#fff",
                      color: unavail ? "#d1d5db" : time === t ? "#fff" : "#0c1a35",
                      fontSize: "0.88rem", fontWeight: time === t ? 700 : 400,
                      cursor: unavail ? "not-allowed" : "pointer",
                      position: "relative",
                    }}
                  >
                    {t}
                    {unavail && <div style={{ position: "absolute", top: 2, right: 4, fontSize: "0.55rem", color: "#d1d5db" }}>×</div>}
                  </button>
                );
              })}
            </div>
            <div style={s.row}>
              <button style={s.back} onClick={() => setStep(2)}>← 戻る</button>
              <button style={{ ...s.btn, flex: 1, marginTop: 0, ...(canNext3 ? {} : s.btnDisabled) }} onClick={() => canNext3 && setStep(4)} disabled={!canNext3}>
                次へ →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: お客様情報 ── */}
        {step === 4 && (
          <div style={s.card}>
            <div style={s.label}>Step 4</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0c1a35", marginBottom: "1.25rem" }}>お客様情報</h2>
            {(["name", "kana", "tel", "email"] as const).map((key) => {
              const labels: Record<string, string> = { name: "お名前 *", kana: "フリガナ *", tel: "電話番号 *", email: "メールアドレス *" };
              const placeholders: Record<string, string> = { name: "山田 太郎", kana: "ヤマダ タロウ", tel: "090-0000-0000", email: "example@mail.com" };
              const types: Record<string, string> = { name: "text", kana: "text", tel: "tel", email: "email" };
              return (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0c1a35", display: "block", marginBottom: 4 }}>{labels[key]}</label>
                  <input
                    type={types[key]}
                    placeholder={placeholders[key]}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{
                      width: "100%", padding: "0.7rem 0.9rem", borderRadius: 8,
                      border: "1.5px solid #e2e8f0", fontSize: "0.88rem",
                      outline: "none", boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              );
            })}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0c1a35", display: "block", marginBottom: 4 }}>ご要望・備考</label>
              <textarea
                placeholder="ご質問やご要望があればお書きください"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                style={{
                  width: "100%", padding: "0.7rem 0.9rem", borderRadius: 8,
                  border: "1.5px solid #e2e8f0", fontSize: "0.88rem",
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={s.row}>
              <button style={s.back} onClick={() => setStep(3)}>← 戻る</button>
              <button style={{ ...s.btn, flex: 1, marginTop: 0, ...(canNext4 ? {} : s.btnDisabled) }} onClick={() => canNext4 && setStep(5)} disabled={!canNext4}>
                確認画面へ →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: 確認 ── */}
        {step === 5 && (
          <div style={s.card}>
            <div style={s.label}>Step 5</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0c1a35", marginBottom: "1.25rem" }}>予約内容の確認</h2>
            {[
              { label: "メニュー", value: selectedMenu?.name },
              { label: "所要時間", value: selectedMenu?.duration },
              { label: "日付", value: dateLabel },
              { label: "時間", value: time },
              { label: "お名前", value: `${form.name}（${form.kana}）` },
              { label: "電話番号", value: form.tel },
              { label: "メール", value: form.email },
              ...(form.note ? [{ label: "備考", value: form.note }] : []),
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", padding: "0.7rem 0",
                borderBottom: "1px solid #f1f5f9",
                fontSize: "0.85rem",
              }}>
                <span style={{ color: "#94a3b8", width: 96, flexShrink: 0 }}>{label}</span>
                <span style={{ color: "#0c1a35", fontWeight: 500, flex: 1 }}>{value}</span>
              </div>
            ))}
            <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "1rem", lineHeight: 1.7 }}>
              ※ これはデモページです。実際の予約は行われません。
            </p>
            <div style={s.row}>
              <button style={s.back} onClick={() => setStep(4)}>← 戻る</button>
              <button style={{ ...s.btn, ...s.btnGold, flex: 1, marginTop: 0 }} onClick={handleSubmit}>
                予約を確定する
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
