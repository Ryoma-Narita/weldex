import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import industries, { getIndustryBySlug } from "@/data/industries";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: `${industry.name}向け${industry.keyword.replace(industry.name.split("・")[0], "").trim() || "WEBサイト制作"}`,
    description: industry.subText,
    alternates: { canonical: `https://weldex.jp/services/${slug}` },
  };
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": industry.schemaType,
    name: "Weldex",
    description: industry.subText,
    url: `https://weldex.jp/services/${slug}`,
    areaServed: "JP",
  });

  const faqSchemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchemaJson }} />
      <main>
        {/* ヒーロー */}
        <div style={{
          background: "var(--navy)", padding: "8rem clamp(1.5rem,5vw,6rem) 5rem",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <div className="sec-label" style={{ color: "var(--gold)" }}>{industry.name}</div>
              <h1 style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(2.2rem,5vw,4rem)",
                fontWeight: 700, color: "var(--white)",
                lineHeight: 1.2, letterSpacing: "-0.02em",
                marginBottom: "1.5rem", whiteSpace: "pre-line",
              }}>
                {industry.heroText}
              </h1>
              <p style={{
                fontSize: "clamp(0.875rem,1.5vw,1rem)",
                color: "rgba(255,255,255,0.7)", fontWeight: 300,
                lineHeight: 1.85, maxWidth: 560, marginBottom: "2.5rem",
              }}>
                {industry.subText}
              </p>
              <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
            </FadeIn>
          </div>
        </div>

        {/* 課題 → 解決 */}
        <section style={{ padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
          <div className="resp-2col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
            <FadeIn>
              <div className="sec-label">Before</div>
              <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 700, color: "var(--navy)", marginBottom: "2rem" }}>
                こんなお悩みはありませんか？
              </h2>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {industry.painPoints.map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem", color: "var(--gray)", lineHeight: 1.7 }}>
                    <span style={{ color: "#c0392b", fontWeight: 700, flexShrink: 0 }}>✕</span>
                    {p}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="sec-label">After</div>
              <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 700, color: "var(--navy)", marginBottom: "2rem" }}>
                Weldexで解決できること
              </h2>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {industry.solutions.map((s, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem", color: "var(--navy)", lineHeight: 1.7 }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: "var(--off)", borderTop: "1px solid var(--border)", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <FadeIn>
              <div className="sec-label">FAQ</div>
              <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 700, color: "var(--navy)", marginBottom: "2.5rem" }}>
                よくあるご質問
              </h2>
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {industry.faq.map((f, i) => (
                <FadeIn key={i} delay={i * 0.08} style={{ borderBottom: "1px solid var(--border)", padding: "1.5rem 0" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.6rem" }}>{f.q}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.8 }}>{f.a}</div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta-band">
          <FadeIn>
            <div className="sec-label" style={{ color: "var(--gold)", justifyContent: "center", marginBottom: "1.5rem" }}>Contact Us</div>
            <h2>まずは、話を聞いてみる。</h2>
            <p>費用・納期・進め方など、どんなことでも構いません。<br />返信は通常1営業日以内です。</p>
            <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
          </FadeIn>
        </div>
      </main>
    </>
  );
}
