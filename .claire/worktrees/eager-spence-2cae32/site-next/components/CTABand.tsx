import Link from "next/link";
import FadeIn from "./FadeIn";

export default function CTABand() {
  return (
    <div className="cta-band">
      <FadeIn>
        <div className="sec-label" style={{ color: "var(--gold)", justifyContent: "center", marginBottom: "1.5rem" }}>
          Contact Us
        </div>
        <h2>まずは、話を聞いてみる。</h2>
        <p>
          費用・納期・進め方など、どんなことでも構いません。<br />
          返信は通常1営業日以内です。
        </p>
        <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
      </FadeIn>
    </div>
  );
}
