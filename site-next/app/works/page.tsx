import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "制作実績・デモ",
  description: "WEB予約システム・LINE予約・管理画面・デモサイトを公開しています。歯科・士業・建設・美容サロンなどあらゆる業種に対応可能です。",
  alternates: { canonical: "https://weldex.jp/works" },
};

const works = [
  {
    category: "WEB予約システム",
    title: "予約フォーム デモ",
    desc: "日付・時間・メニュー選択から確認画面まで、患者・顧客の目線で設計した予約フォームです。実際に操作してお試しください。",
    demoUrl: "https://weldex.jp/booking/",
    tag: "DEMO",
  },
  {
    category: "管理画面",
    title: "予約管理ダッシュボード デモ",
    desc: "予約一覧・顧客管理・統計ダッシュボード・CSV出力など、クリニック・サロンの管理業務をまとめて効率化します。",
    demoUrl: "https://weldex.jp/admin/",
    tag: "DEMO",
  },
  {
    category: "LINE予約システム",
    title: "LINE予約ボット デモ",
    desc: "LINEのトーク画面から日付・時間・メニューを選んで予約が完了します。前日リマインド・キャンセル対応も自動化。",
    demoUrl: null,
    tag: "準備中",
  },
];

const industries = [
  { name: "歯科・クリニック", href: "/services/dental" },
  { name: "士業・法律事務所", href: "/services/legal" },
  { name: "建設・工務店", href: "/services/construction" },
  { name: "美容・サロン", href: "/services/beauty" },
];

export default function WorksPage() {
  return (
    <main style={{ padding: "7rem clamp(1.5rem,5vw,6rem) 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 5rem" }}>

        <FadeIn>
          <div className="sec-label">Works & Demo</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem,4vw,3rem)",
            fontWeight: 700, color: "var(--navy)",
            lineHeight: 1.2, letterSpacing: "-0.01em",
            marginBottom: "0.75rem",
          }}>
            制作実績・デモ
          </h1>
          <p style={{
            fontSize: "0.9rem", color: "var(--gray)", fontWeight: 300,
            lineHeight: 1.85, marginBottom: "4rem", maxWidth: 480,
          }}>
            実際に動くデモをご用意しています。<br />
            気になる方はお気軽にお試しください。
          </p>
        </FadeIn>

        {/* デモカード */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "2px", background: "var(--border)" }}>
          {works.map((w, i) => (
            <FadeIn key={w.title} delay={i * 0.1} style={{ background: "var(--white)", padding: "2.5rem 2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--blue)", letterSpacing: "0.05em" }}>{w.category}</div>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
                  color: w.tag === "DEMO" ? "var(--gold)" : "var(--gray)",
                  border: `1px solid ${w.tag === "DEMO" ? "var(--gold)" : "var(--border)"}`,
                  padding: "0.2rem 0.5rem",
                }}>
                  {w.tag}
                </span>
              </div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>{w.title}</h2>
              <p style={{ fontSize: "0.83rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.75, marginBottom: "1.5rem" }}>{w.desc}</p>
              {w.demoUrl ? (
                <a href={w.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.78rem" }}>
                  デモを見る →
                </a>
              ) : (
                <span style={{ fontSize: "0.78rem", color: "var(--light)" }}>近日公開予定</span>
              )}
            </FadeIn>
          ))}
        </div>

        {/* 業種別LP誘導 */}
        <FadeIn delay={0.2} style={{ marginTop: "5rem" }}>
          <div className="sec-label">Industries</div>
          <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>
            業種別の導入事例
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.8, marginBottom: "2rem" }}>
            業種ごとの課題・解決策・よくあるご質問をまとめています。
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {industries.map((ind) => (
              <Link key={ind.name} href={ind.href} className="btn btn-outline" style={{ fontSize: "0.82rem" }}>
                {ind.name} →
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* CTA */}
      <div className="cta-band">
        <FadeIn>
          <div className="sec-label" style={{ color: "var(--gold)", justifyContent: "center", marginBottom: "1.5rem" }}>Contact Us</div>
          <h2>まずは、話を聞いてみる。</h2>
          <p>
            飲食店・不動産・サロンなどあらゆる業種に対応可能です。<br />
            費用・納期・進め方など、どんなことでも構いません。
          </p>
          <Link href="/contact" className="btn btn-primary">無料相談をする</Link>
        </FadeIn>
      </div>
    </main>
  );
}
