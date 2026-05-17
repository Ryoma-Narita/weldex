import Link from "next/link";
import FadeIn from "./FadeIn";

const cases = [
  {
    industry: "クリニック / LINE予約システム",
    title: "電話予約ゼロへ。患者満足度とスタッフ負担を同時に改善。",
    metrics: [{ val: "大幅増", lbl: "月間予約数" }, { val: "大幅減", lbl: "無断キャンセル率" }, { val: "削減", lbl: "スタッフ対応工数" }],
  },
  {
    industry: "士業事務所 / WEBリニューアル",
    title: "信頼感あるデザインとSEO強化で問い合わせ3倍超。",
    metrics: [{ val: "急増", lbl: "月間問い合わせ数" }, { val: "増加", lbl: "オーガニック流入" }, { val: "上位", lbl: "地域検索順位" }],
  },
  {
    industry: "建設会社 / サイト制作＋見積もりシステム",
    title: "スマホ最適化と導線改善で見積もり依頼が4倍に。",
    metrics: [{ val: "向上", lbl: "見積もり依頼CVR" }, { val: "大半", lbl: "スマホ流入比率" }, { val: "大幅減", lbl: "直帰率" }],
  },
  {
    industry: "クリニック / 予約システム開発",
    title: "ポータル依存を脱却。自社予約で手数料コストをゼロに。",
    metrics: [{ val: "急増", lbl: "自社予約件数" }, { val: "大幅減", lbl: "月次コスト" }, { val: "増加", lbl: "LINE友だち数" }],
  },
];

export default function Cases() {
  return (
    <section style={{ padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "3rem" }}>
          <div>
            <div className="sec-label">Case Studies</div>
            <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              数字で見る、改善の実績。
            </h2>
          </div>
          <Link href="/contact" className="btn btn-outline" style={{ fontSize: "0.8rem" }}>すべての事例を見る →</Link>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 2, background: "var(--border)" }}>
          {cases.map((c, i) => (
            <FadeIn key={c.industry} delay={0.1 + i * 0.1} style={{ background: "var(--white)", padding: "2rem 1.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--blue)", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{c.industry}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--navy)", lineHeight: 1.5, marginBottom: "1.75rem" }}>{c.title}</div>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {c.metrics.map((m) => (
                  <div key={m.lbl}>
                    <span style={{ display: "block", fontFamily: "var(--font-cormorant)", fontSize: "1.6rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{m.val}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--gray)", letterSpacing: "0.04em" }}>{m.lbl}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
