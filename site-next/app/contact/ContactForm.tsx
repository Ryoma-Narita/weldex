"use client";
import { useState } from "react";

/**
 * ステップ式お問い合わせフォーム
 *
 * 1問ずつ表示する対話形式。選択肢系の質問（相談内容・業種）は
 * プルダウンではなくボタンで回答できる。
 * 見た目は従来フォームのスタイル（角丸なし・navy/gold）を継承する。
 * 送信先は従来どおり Formspree。
 */

type Status = "idle" | "sending" | "done" | "error";

const SERVICES = ["ホームページ制作", "WEB予約システム", "LINE連携", "顧客管理（CRM）", "その他・未定"];

const TOTAL_STEPS = 5;

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid var(--border)",
  padding: "0.875rem 1rem", fontSize: "0.875rem",
  color: "var(--navy)", outline: "none", background: "var(--white)",
  fontFamily: "var(--font-dm-sans), sans-serif",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.72rem", fontWeight: 500,
  color: "var(--gray)", letterSpacing: "0.05em",
  textTransform: "uppercase", marginBottom: "0.5rem",
};

const choiceBtn = (selected: boolean): React.CSSProperties => ({
  padding: "0.75rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: selected ? 700 : 400,
  cursor: "pointer",
  border: selected ? "1px solid var(--navy)" : "1px solid var(--border)",
  background: selected ? "var(--navy)" : "var(--white)",
  color: selected ? "#fff" : "var(--gray)",
  transition: "all 0.15s",
});

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [touched, setTouched] = useState(false);
  const [a, setA] = useState({
    service: "", industry: "", name: "", company: "", email: "", message: "",
  });
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  const set = (key: keyof typeof a, value: string) => setA((p) => ({ ...p, [key]: value }));

  /** 現在のステップの入力が有効か */
  function stepValid(): boolean {
    if (step === 0) return a.service !== "";
    if (step === 1) return a.industry !== "";
    if (step === 2) return a.name.trim() !== "";
    if (step === 3) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email);
    if (step === 4) return a.message.trim() !== "";
    return false;
  }

  function next() {
    setTouched(true);
    if (!stepValid()) return;
    setTouched(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  /** 選択肢ボタンは選んだ瞬間に次のステップへ進む */
  function choose(key: "service", value: string) {
    set(key, value);
    setTouched(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  async function handleSubmit() {
    setTouched(true);
    if (!stepValid()) return;
    setStatus("sending");
    const data = new FormData();
    data.append("ご相談内容", a.service);
    data.append("業種", a.industry);
    data.append("name", a.name);
    data.append("company", a.company);
    data.append("email", a.email);
    data.append("message", a.message);

    try {
      const res = await fetch(
        `https://formspree.io/f/${endpoint}`,
        { method: "POST", body: data, headers: { Accept: "application/json" } }
      );
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p style={{ fontSize: "0.9rem", color: "#16a34a", fontWeight: 500, lineHeight: 2 }}>
        送信が完了しました。1営業日以内にご連絡します。
      </p>
    );
  }

  // 回答済みステップのサマリー（クリックで戻れる）
  const answered: { label: string; value: string; goto: number }[] = [];
  if (step > 0 && a.service) answered.push({ label: "ご相談内容", value: a.service, goto: 0 });
  if (step > 1 && a.industry) answered.push({ label: "業種", value: a.industry, goto: 1 });
  if (step > 2 && a.name) answered.push({ label: "お名前", value: a.company ? `${a.name}（${a.company}）` : a.name, goto: 2 });
  if (step > 3 && a.email) answered.push({ label: "メール", value: a.email, goto: 3 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 進捗バー */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--light)", letterSpacing: "0.08em" }}>
            STEP {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
        <div style={{ height: 2, background: "var(--border)" }}>
          <div style={{
            height: 2, background: "var(--gold)",
            width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* 回答済みサマリー */}
      {answered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {answered.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { setStep(item.goto); setTouched(false); }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                width: "100%", padding: "0.6rem 1rem",
                border: "1px solid var(--border)", background: "#f8f9fc",
                fontSize: "0.8rem", color: "var(--gray)", cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>
                <span style={{ fontWeight: 500, marginRight: "0.75rem" }}>{item.label}</span>
                <span style={{ color: "var(--navy)" }}>{item.value}</span>
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--light)" }}>変更</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 1: ご相談内容（ボタン選択） */}
      {step === 0 && (
        <div>
          <label style={labelStyle}>ご相談内容 <span style={{ color: "#c0392b" }}>*</span></label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {SERVICES.map((s) => (
              <button key={s} type="button" onClick={() => choose("service", s)} style={choiceBtn(a.service === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: 業種（フリーテキスト） */}
      {step === 1 && (
        <div>
          <label style={labelStyle}>業種 <span style={{ color: "#c0392b" }}>*</span></label>
          <input
            type="text" value={a.industry} required autoFocus
            onChange={(e) => set("industry", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && next()}
            style={inputStyle} placeholder="例：歯科医院、税理士事務所、工務店..."
          />
          {touched && !stepValid() && (
            <p style={{ fontSize: "0.75rem", color: "#c0392b", marginTop: "0.4rem" }}>業種を入力してください</p>
          )}
        </div>
      )}

      {/* STEP 3: お名前・会社名 */}
      {step === 2 && (
        <>
          <div>
            <label style={labelStyle}>お名前 <span style={{ color: "#c0392b" }}>*</span></label>
            <input
              type="text" value={a.name} required autoFocus
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
              style={inputStyle} placeholder="山田 太郎"
            />
            {touched && !stepValid() && (
              <p style={{ fontSize: "0.75rem", color: "#c0392b", marginTop: "0.4rem" }}>お名前を入力してください</p>
            )}
          </div>
          <div>
            <label style={labelStyle}>会社名・屋号（任意）</label>
            <input
              type="text" value={a.company}
              onChange={(e) => set("company", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
              style={inputStyle} placeholder="株式会社○○"
            />
          </div>
        </>
      )}

      {/* STEP 4: メールアドレス */}
      {step === 3 && (
        <div>
          <label style={labelStyle}>メールアドレス <span style={{ color: "#c0392b" }}>*</span></label>
          <input
            type="email" value={a.email} required autoFocus
            onChange={(e) => set("email", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && next()}
            style={inputStyle} placeholder="example@example.com"
          />
          {touched && !stepValid() && (
            <p style={{ fontSize: "0.75rem", color: "#c0392b", marginTop: "0.4rem" }}>正しいメールアドレスを入力してください</p>
          )}
        </div>
      )}

      {/* STEP 5: 内容 */}
      {step === 4 && (
        <div>
          <label style={labelStyle}>お問い合わせ内容 <span style={{ color: "#c0392b" }}>*</span></label>
          <textarea
            value={a.message} required rows={5} autoFocus
            onChange={(e) => set("message", e.target.value)}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="ご相談内容をお書きください"
          />
          {touched && !stepValid() && (
            <p style={{ fontSize: "0.75rem", color: "#c0392b", marginTop: "0.4rem" }}>内容を入力してください</p>
          )}
        </div>
      )}

      {status === "error" && (
        <p style={{ fontSize: "0.875rem", color: "#c0392b" }}>
          送信に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {/* 操作ボタン（step0はボタン自動遷移なので非表示、step1以降は表示） */}
      {step >= 1 && (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {step < TOTAL_STEPS - 1 ? (
            <button type="button" onClick={next} className="btn btn-primary">
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "sending"}
              className="btn btn-primary"
              style={{ opacity: status === "sending" ? 0.5 : 1, cursor: status === "sending" ? "wait" : "pointer" }}
            >
              {status === "sending" ? "送信中…" : "送信する"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
