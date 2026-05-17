import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "サービス一覧",
  description: "WEBサイト制作（¥150,000〜）・LINE予約システム（¥80,000〜）・システム開発・保守運用。AIを活用した大手比1/3以下のコストで中小企業のデジタル支援を提供します。",
  alternates: { canonical: "https://weldex.jp/services" },
};

const services = [
  {
    num: "01",
    title: "WEBサイト制作",
    price: "¥150,000〜",
    desc: "古いサイト・スマホ非対応・検索に出てこない。そんな課題をAIと人の目で解決します。医療・士業・建設など業種特化のデザインで、顧客・取引先に信頼される顔をつくります。",
    points: ["スマホ完全対応", "SEO基本対策込み", "公開後1ヶ月無料サポート", "最短2〜3週間納品"],
  },
  {
    num: "02",
    title: "LINE・WEB予約システム",
    price: "¥80,000〜",
    desc: "電話予約の手間、予約漏れ、無断キャンセル。LINE一本で解決できる仕組みを、貴社の業務フローに合わせて設計・構築します。WEB予約フォームとの併用も可能です。",
    points: ["LINEから24時間予約受付", "自動リマインド送信", "管理画面で予約一元管理", "キャンセル対応フロー込み"],
  },
  {
    num: "03",
    title: "システム開発",
    price: "要お見積もり",
    desc: "予約管理・顧客管理・業務自動化など、貴事業の業務に合わせたシステムをゼロから構築します。「こんな機能がほしい」をAIで低コスト実現します。",
    points: ["業務フローに合わせた設計", "既存ツールとの連携", "AIによる高速開発", "保守・運用サポート対応"],
  },
  {
    num: "04",
    title: "保守・運用サポート",
    price: "¥5,000/月〜",
    desc: "作って終わりにしません。公開後の更新・改善・トラブル対応まで、まるごとお任せいただけます。サイトの鮮度を保ち、集客力を維持します。",
    points: ["コンテンツ更新代行", "SEO改善・レポート", "トラブル対応", "月次レポート"],
  },
];

export default function ServicesPage() {
  return (
    <main style={{ padding: "7rem clamp(1.5rem, 5vw, 6rem) 5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="sec-label">Services</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.01em",
            marginBottom: "0.75rem",
          }}>
            サービス一覧
          </h1>
          <p style={{
            fontSize: "0.9rem", color: "var(--gray)", fontWeight: 300,
            lineHeight: 1.85, marginBottom: "4rem", maxWidth: 540,
          }}>
            WEBサイト制作からLINE予約システム・システム開発・保守運用まで、
            デジタルをまるごと支援します。
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px", background: "var(--border)" }}>
          {services.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.1} style={{ background: "var(--white)", padding: "3rem clamp(1.5rem, 4vw, 3rem)" }}>
              <div className="resp-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "3rem", alignItems: "start" }}>
                <div>
                  <div style={{
                    fontFamily: "var(--font-cormorant)", fontSize: "3.5rem",
                    fontWeight: 700, color: "var(--border)", lineHeight: 1, marginBottom: "1rem",
                  }}>{s.num}</div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>{s.title}</h2>
                  <div style={{ fontSize: "0.85rem", color: "var(--gold)", fontWeight: 500, letterSpacing: "0.03em" }}>{s.price}</div>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.85, marginBottom: "1.5rem" }}>{s.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {s.points.map((p) => (
                      <li key={p} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.83rem", color: "var(--navy)" }}>
                        <span style={{ width: 16, height: 1, background: "var(--gold)", flexShrink: 0, display: "block" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} style={{ marginTop: "4rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--gray)", fontWeight: 300, marginBottom: "1.5rem" }}>
            ご予算・ご要望に合わせてカスタマイズも可能です。まずはお気軽にご相談ください。
          </p>
          <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
        </FadeIn>
      </div>
    </main>
  );
}
