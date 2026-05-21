import FadeIn from "./FadeIn";

const steps = [
  { num: "01", title: "無料相談", desc: "現状・課題・ご要望をヒアリング。費用・納期の目安をご提示します。", days: "Day 1" },
  { num: "02", title: "ご提案・お見積もり", desc: "ヒアリング内容をもとに提案書と見積書を作成。ご確認いただきます。", days: "Day 2〜5" },
  { num: "03", title: "契約・着手", desc: "契約締結後、着手金50%のご入金確認で制作を開始します。", days: "Week 1" },
  { num: "04", title: "デザイン・制作", desc: "デザイン確認→コーディング→テストの順で進めます。中間報告でフィードバックをします。", days: "Week 2" },
  { num: "05", title: "初稿・フィードバック期間", desc: "ここで初稿が出来上がり、お客様のフィードバック期間とします。ご要望に合わせた修正をいたします。", days: "Week 3〜4" },
  { num: "06", title: "公開・引き渡し", desc: "最終確認後に公開。残金50%のご請求と同時に1ヶ月間の無料サポートが始まります。", days: "Week 4〜" },
];

export default function Process() {
  return (
    <section style={{ padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 3.5rem" }}>
          <div className="sec-label" style={{ justifyContent: "center" }}>Process</div>
          <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
            制作の流れ
          </h2>
          <p className="sec-desc" style={{ margin: "0 auto" }}>お問い合わせから公開まで、最短4週間で対応します。</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "0 2px", background: "var(--border)" }}>
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={0.1 + i * 0.08} style={{ background: "var(--white)", padding: "2rem 1.5rem" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem",
              }}>
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "0.95rem", fontWeight: 700, color: "var(--navy)" }}>{s.num}</span>
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.6rem" }}>{s.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.7, marginBottom: "1rem" }}>{s.desc}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 500, letterSpacing: "0.05em" }}>{s.days}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
