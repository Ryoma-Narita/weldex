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
    <main>
      {/* ── Hero band ── */}
      <section style={{
        background: "var(--navy)",
        padding: "10rem clamp(1.5rem, 5vw, 6rem) 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div aria-hidden="true" style={{
          position: "absolute",
          top: "50%", right: "-3%",
          transform: "translateY(-50%)",
          fontSize: "clamp(7rem, 20vw, 16rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "rgba(201,168,76,0.04)",
          userSelect: "none",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
        }}>
          CONTACT
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="sec-label" style={{ color: "var(--gold)" }}>Contact</div>
          <h1 style={{
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            fontWeight: 900,
            color: "var(--white)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1rem",
          }}>
            まずは、<br />
            <em style={{ color: "var(--gold)", fontStyle: "normal" }}>話を聞いてみる。</em>
          </h1>
          <p style={{
            fontSize: "clamp(0.875rem, 1.4vw, 1rem)",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 2.0,
          }}>
            費用・納期・進め方など、どんなことでも構いません。返信は通常1営業日以内です。
          </p>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "6rem clamp(1.5rem,5vw,6rem) 6rem",
          display: "grid", gridTemplateColumns: "1fr 1.4fr",
          gap: "5rem", alignItems: "start",
        }} className="resp-2col">

          {/* 左：連絡先情報 */}
          <FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { label: "メール", value: "info@weldex.jp" },
                { label: "対応時間", value: "平日 9:00〜18:00" },
                { label: "返信目安", value: "通常1営業日以内" },
              ].map((item) => (
                <div key={item.label} style={{
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "1.25rem",
                }}>
                  <div style={{
                    fontSize: "0.68rem", color: "var(--gold)", fontWeight: 700,
                    letterSpacing: "0.1em", marginBottom: "0.4rem",
                    fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: "1rem", color: "var(--navy)", fontWeight: 500,
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* 右：フォーム */}
          <FadeIn delay={0.1}>
            <ContactForm />
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
