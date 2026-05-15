"use client";
import { useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

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

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(
        `https://formspree.io/f/${endpoint}`,
        { method: "POST", body: data, headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        setStatus("done");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <label style={labelStyle}>お名前 <span style={{ color: "#c0392b" }}>*</span></label>
        <input name="name" type="text" required style={inputStyle} placeholder="山田 太郎" />
      </div>
      <div>
        <label style={labelStyle}>会社名・屋号</label>
        <input name="company" type="text" style={inputStyle} placeholder="株式会社○○" />
      </div>
      <div>
        <label style={labelStyle}>メールアドレス <span style={{ color: "#c0392b" }}>*</span></label>
        <input name="email" type="email" required style={inputStyle} placeholder="example@example.com" />
      </div>
      <div>
        <label style={labelStyle}>お問い合わせ内容 <span style={{ color: "#c0392b" }}>*</span></label>
        <textarea
          name="message" required rows={5}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="ご相談内容をお書きください"
        />
      </div>

      {status === "done" && (
        <p style={{ fontSize: "0.875rem", color: "#16a34a", fontWeight: 500 }}>
          送信が完了しました。1営業日以内にご連絡します。
        </p>
      )}
      {status === "error" && (
        <p style={{ fontSize: "0.875rem", color: "#c0392b" }}>
          送信に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || status === "done"}
        className="btn btn-primary"
        style={{ opacity: status === "sending" || status === "done" ? 0.5 : 1, cursor: status === "sending" ? "wait" : "pointer" }}
      >
        {status === "sending" ? "送信中…" : "送信する"}
      </button>
    </form>
  );
}
