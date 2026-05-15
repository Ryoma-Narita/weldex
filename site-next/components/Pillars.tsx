import FadeIn from "./FadeIn";

const pillars = [
  { num: "01", title: "WEBサイト制作", desc: "古いサイト・スマホ非対応・検索に出てこない。そんな課題をAIと人の目で解決。顧客・取引先に信頼される顔をつくります。" },
  { num: "02", title: "LINE予約・DX導入", desc: "電話予約の手間、予約漏れ、無断キャンセル。LINE一本で解決できる仕組みを、貴社の業務フローに合わせて設計・構築します。" },
  { num: "03", title: "システム開発", desc: "予約管理・顧客管理・業務自動化など、貴事業の業務に合わせたシステムをゼロから構築。「こんな機能がほしい」をAIで低コスト実現します。" },
  { num: "04", title: "保守・運用サポート", desc: "作って終わりにしません。公開後の更新・改善・トラブル対応まで、まるごとお任せいただけます。" },
];

export default function Pillars() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
      <FadeIn style={{ marginBottom: "3rem" }}>
        <div className="sec-label">What We Do</div>
        <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          4つの柱で、<br />デジタルをまるごと支える。
        </h2>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 2px", background: "var(--border)" }}>
        {pillars.map((p, i) => (
          <FadeIn key={p.num} delay={0.1 + i * 0.1} style={{ background: "var(--white)", padding: "2.5rem 2rem" }}>
            <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "3rem", fontWeight: 700, color: "var(--border)", lineHeight: 1, marginBottom: "1.5rem" }}>{p.num}</div>
            <div style={{ width: 28, height: 1, background: "var(--gold)", marginBottom: "1.25rem" }} />
            <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.75rem" }}>{p.title}</div>
            <div style={{ fontSize: "0.83rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.75 }}>{p.desc}</div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
