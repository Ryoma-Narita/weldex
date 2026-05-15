import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | Weldex",
  description: "ホームページ制作・WEB予約・LINE予約に関するご相談はこちら。費用・納期・進め方など、なんでもお気軽にどうぞ。",
  alternates: { canonical: "https://weldex.jp/contact" },
};

export default function ContactPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,6rem) 6rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }} className="resp-2col">

          {/* 左：説明 */}
          <FadeIn>
            <div className="sec-label">Contact</div>
            <h1 style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2rem,4vw,3rem)",
              fontWeight: 700, color: "var(--navy)",
              lineHeight: 1.2, letterSpacing: "-0.01em",
              marginBottom: "1.5rem",
            }}>
              まずは、<br />話を聞いてみる。
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.85, marginBottom: "3rem" }}>
              費用・納期・進め方など、どんなことでも構いません。<br />
              返信は通常1営業日以内です。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { label: "メール", value: "info@weldex.jp" },
                { label: "対応時間", value: "平日 9:00〜18:00" },
                { label: "返信目安", value: "通常1営業日以内" },
              ].map((item) => (
                <div key={item.label} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 500, letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--navy)", fontWeight: 400 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* 右：フォーム */}
          <FadeIn delay={0.15}>
            <ContactForm />
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
