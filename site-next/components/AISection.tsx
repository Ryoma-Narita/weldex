import FadeIn from "./FadeIn";

const cards = [
  { num: "01", title: "文章・コピー生成", desc: "業種に最適化されたキャッチコピーや説明文をAIが生成。ライター費用を大幅削減。" },
  { num: "02", title: "デザイン補助", desc: "レイアウト・配色・画像選定をAIがアシスト。デザイナーの判断・調整に集中できる。" },
  { num: "03", title: "SEO分析・最適化", desc: "競合調査からキーワード設計・内部対策までAIが分析。継続的な上位表示を支援。" },
  { num: "04", title: "コード品質チェック", desc: "Core Web Vitals・アクセシビリティ・セキュリティをAIが自動検出。確かな品質を担保。" },
];

export default function AISection() {
  return (
    <section style={{ background: "var(--navy)", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
      <div className="resp-2col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "5rem", alignItems: "start" }}>
        <FadeIn>
          <div className="sec-label" style={{ color: "var(--gold)" }}>Why Weldex</div>
          <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--white)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "1.25rem" }}>
            大手に頼む必要はない。<br />AIで、本質だけを届ける。
          </h2>
          <p style={{ fontSize: "0.925rem", color: "rgba(255,255,255,0.6)", fontWeight: 300, lineHeight: 1.85, marginBottom: "2.5rem" }}>
            Weldexがこの価格を実現できるのは、AIを制作プロセスの中核に置いているからです。文章・デザイン・コード・SEO分析をAIが高速処理し、人間はその品質チェックと戦略判断に集中します。
          </p>
          <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
            {[{ val: "低コスト", lbl: "大手比の圧倒的な価格" }, { val: "100%", lbl: "人による品質チェック" }, { val: "最短", lbl: "スピード納品対応" }].map((m) => (
              <div key={m.lbl}>
                <span style={{ display: "block", fontFamily: "var(--font-cormorant)", fontSize: "2rem", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{m.val}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>{m.lbl}</span>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.15} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "rgba(255,255,255,0.08)" }}>
          {cards.map((c) => (
            <div key={c.num} style={{ background: "rgba(255,255,255,0.04)", padding: "1.75rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 700, color: "rgba(255,255,255,0.15)", marginBottom: "0.75rem" }}>{c.num}</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--white)", marginBottom: "0.5rem" }}>{c.title}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontWeight: 300, lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
