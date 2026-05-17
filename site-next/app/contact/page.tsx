import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "無料相談・お問い合わせ",
  description: "WEBサイト制作・LINE予約システム・システム開発についてお気軽にご相談ください。費用・納期の目安を無料でご提示します。返信は通常1営業日以内です。",
  alternates: { canonical: "https://weldex.jp/contact" },
};

export default function ContactPage() {
  return (
    <main style={{ padding: "7rem clamp(1.5rem, 5vw, 6rem) 5rem" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="sec-label">Contact</div>
        <h1 style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 700, color: "var(--navy)",
          lineHeight: 1.2, letterSpacing: "-0.01em",
          marginBottom: "0.75rem",
        }}>
          無料相談・お問い合わせ
        </h1>
        <p style={{
          fontSize: "0.9rem", color: "var(--gray)", fontWeight: 300,
          lineHeight: 1.85, marginBottom: "3rem",
        }}>
          費用・納期・進め方など、どんなことでも構いません。<br />
          返信は通常1営業日以内です。
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
