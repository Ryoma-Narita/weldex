import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageHeader from "@/components/PageHeader";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | Weldex",
  description: "ホームページ制作・WEB予約・LINE予約に関するご相談はこちら。費用・納期・進め方など、なんでもお気軽にどうぞ。",
  alternates: { canonical: "https://weldex.jp/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        title="Contact"
        desc={<>費用・納期・進め方など、どんなことでも構いません。<br />返信は通常1営業日以内です。</>}
      />

      {/* ── Form + Info ── */}
      <section>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "6rem clamp(1.5rem,5vw,6rem) 6rem",
          display: "grid", gridTemplateColumns: "1fr 1.4fr",
          gap: "5rem", alignItems: "start",
        }} className="resp-2col">

          <FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { label: "Email",        value: "info@weldex.jp" },
                { label: "Hours",        value: "平日 9:00〜18:00" },
                { label: "Reply",        value: "通常1営業日以内" },
              ].map((item) => (
                <div key={item.label} style={{
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "1.25rem",
                }}>
                  <div style={{
                    fontSize: "0.65rem", color: "var(--gold)", fontWeight: 700,
                    letterSpacing: "0.12em", marginBottom: "0.4rem",
                    fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "1rem", color: "var(--navy)", fontWeight: 500 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ContactForm />
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
