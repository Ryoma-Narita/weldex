import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import CTABand from "@/components/CTABand";

export const metadata: Metadata = {
  title: "サービス一覧 | Weldex",
  description:
    "ホームページ制作・WEB予約システム・LINE予約システムの3サービスを一社完結で提供。費用・納期の目安もご確認いただけます。",
  alternates: { canonical: "https://weldex.jp/services" },
};

const services = [
  {
    num: "01",
    title: "ホームページ制作",
    price: "150,000円〜",
    tag: "HP / LP",
    desc: "集客・信頼・問い合わせ増加を目的とした、業種特化のWebサイトを制作します。SEO対応・スマホ最適化・お問い合わせフォームまで含みます。",
    features: ["業種特化デザイン", "SEO対応", "スマホ最適化", "Formspreeフォーム設置", "公開後1ヶ月サポート"],
    detailHref: "/services/web",
  },
  {
    num: "02",
    title: "WEB予約システム",
    price: "200,000円〜",
    tag: "予約 / 管理",
    desc: "24時間自動で予約を受け付ける管理画面付きの予約システムです。歯科・クリニック・サロンなど幅広い業種に対応します。",
    features: ["24時間自動受付", "管理画面付き", "メール自動返信", "顧客管理・CSV出力", "前日リマインド"],
    detailHref: "/services/reservation",
  },
  {
    num: "03",
    title: "LINE予約システム",
    price: "150,000円〜",
    tag: "LINE / Bot",
    desc: "LINEのトーク画面から予約できるシステムです。前日リマインド・キャンセル対応も自動化。既存のLINE公式アカウントに連携できます。",
    features: ["LINEから予約完結", "前日リマインド自動送信", "キャンセル自動対応", "既存LINE公式に連携", "管理画面連携"],
    detailHref: "/services/line",
  },
];

export default function ServicesPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,6rem) 5rem" }}>
        <FadeIn>
          <div className="sec-label">Services</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(30px,4vw,52px)",
            fontWeight: 900, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}>
            サービス一覧
          </h1>
          <p style={{
            fontSize: "0.9375rem", color: "var(--gray)",
            lineHeight: 2.0, marginBottom: "4rem", maxWidth: 480,
          }}>
            制作から運用まで一社完結。<br />
            業種・規模に合わせてご提案します。
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "var(--border)" }}>
          {services.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.1} style={{ background: "var(--white)", padding: "3rem clamp(1.5rem,4vw,3rem)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant)", fontSize: "2.5rem",
                    fontWeight: 700, color: "var(--border)", lineHeight: 1,
                  }}>{s.num}</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 500, letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{s.tag}</div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--navy)", lineHeight: 1.3 }}>{s.title}</h2>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.9rem", fontWeight: 500, color: "var(--navy)",
                  borderBottom: "1px solid var(--gold)", paddingBottom: 2,
                }}>
                  {s.price}
                </span>
              </div>

              <p style={{ fontSize: "0.9375rem", color: "var(--gray)", lineHeight: 2.0, marginBottom: "1.5rem", maxWidth: 640 }}>
                {s.desc}
              </p>

              <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", listStyle: "none", padding: 0, margin: 0 }}>
                {s.features.map((f) => (
                  <li key={f} style={{
                    fontSize: "0.75rem", border: "1px solid var(--border)",
                    color: "var(--gray)", padding: "0.3rem 0.75rem",
                  }}>
                    {f}
                  </li>
                ))}
              </ul>
              {"detailHref" in s && (
                <div style={{ marginTop: "1.5rem" }}>
                  <Link href={(s as typeof s & { detailHref: string }).detailHref} style={{
                    fontSize: "0.8rem", fontWeight: 500, color: "var(--navy)",
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                    borderBottom: "1px solid var(--navy)", paddingBottom: 2,
                    transition: "opacity 0.15s",
                  }}>
                    詳細・料金を見る →
                  </Link>
                </div>
              )}
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
        </FadeIn>
      </div>

      <CTABand />
    </main>
  );
}
