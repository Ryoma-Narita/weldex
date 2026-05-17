"use client";
import { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqendgdb";

type Status = "idle" | "sending" | "done" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
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

  if (status === "done") {
    return (
      <div style={{
        padding: "3rem 2rem", background: "var(--off)",
        border: "1px solid var(--border)", textAlign: "center",
      }}>
        <div style={{ fontSize: "1.5rem", color: "var(--navy)", marginBottom: "0.75rem" }}>送信完了</div>
        <p style={{ fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.8 }}>
          お問い合わせありがとうございます。<br />
          通常1営業日以内にご返信いたします。
        </p>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "0.875rem 1rem",
    border: "1px solid var(--border)", background: "var(--white)",
    fontSize: "0.9rem", color: "var(--navy)", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
          お名前 <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input name="name" type="text" required placeholder="山田 太郎" style={fieldStyle} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
          会社名・屋号
        </label>
        <input name="company" type="text" placeholder="〇〇クリニック" style={fieldStyle} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
          メールアドレス <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <input name="email" type="email" required placeholder="info@example.com" style={fieldStyle} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
          ご相談内容 <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <textarea
          name="message" required rows={6}
          placeholder="ご相談内容・ご要望をご記入ください"
          style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.7 }}
        />
      </div>
      {status === "error" && (
        <p style={{ fontSize: "0.85rem", color: "#c0392b" }}>
          送信に失敗しました。時間をおいて再度お試しください。
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary"
        style={{ alignSelf: "flex-start", opacity: status === "sending" ? 0.7 : 1 }}
      >
        {status === "sending" ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
