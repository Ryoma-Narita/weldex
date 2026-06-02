"use client";
import Image from "next/image";
import { useState } from "react";
import FadeIn from "./FadeIn";

const pillars = [
  {
    num: "01", title: "WEBサイト制作",
    desc: "古いサイト・スマホ非対応・検索に出てこない。そんな課題をAIと人の目で解決。顧客・取引先に信頼されるサイトをつくります。",
    img: "/pillars/web.jpg",
  },
  {
    num: "02", title: "LINE予約・DX導入",
    desc: "電話予約の手間、予約漏れ、無断キャンセル。LINE一本で解決できる仕組みを、貴社の業務フローに合わせて設計・構築します。",
    img: "/pillars/line.jpg",
  },
  {
    num: "03", title: "システム開発",
    desc: "予約管理・顧客管理・業務自動化など、貴事業の業務に合わせたシステムをゼロから構築。「こんな機能がほしい」をAIで低コスト実現します。",
    img: "/pillars/system.jpg",
  },
  {
    num: "04", title: "保守・運用サポート",
    desc: "作って終わりにしません。公開後の更新・改善・トラブル対応まで、まるごとお任せいただけます。",
    img: "/pillars/support.jpg",
  },
];

// 画像エリア：ファイルがない間はネイビーグラデーションの placeholder を表示
function PillarImage({ src, alt, num }: { src: string; alt: string; num: string }) {
  const [error, setError] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", overflow: "hidden", flexShrink: 0,
      background: "linear-gradient(135deg, #0c1a35 0%, #162645 60%, #1e3a5f 100%)" }}>
      {!error && (
        <Image
          src={src} alt={alt} fill
          style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
          onError={() => setError(true)}
        />
      )}
      {/* placeholder テキスト（画像なし時のみ） */}
      {error && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(201,168,76,0.5)", textTransform: "uppercase" }}>
            Image coming soon
          </span>
        </div>
      )}
      {/* 番号オーバーレイ（常に表示） */}
      <div style={{
        position: "absolute", bottom: "0.75rem", left: "0.9rem",
        fontFamily: "var(--font-cormorant)", fontSize: "2rem", fontWeight: 700,
        color: error ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.75)",
        lineHeight: 1, textShadow: error ? "none" : "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        {num}
      </div>
    </div>
  );
}

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
          <FadeIn key={p.num} delay={0.1 + i * 0.1} style={{ background: "var(--white)", display: "flex", flexDirection: "column" }}>
            <PillarImage src={p.img} alt={p.title} num={p.num} />
            <div style={{ padding: "1.75rem 2rem 2rem" }}>
              <div style={{ width: 28, height: 1, background: "var(--gold)", marginBottom: "1rem" }} />
              <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--navy)", marginBottom: "0.65rem" }}>{p.title}</div>
              <div style={{ fontSize: "0.83rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.75 }}>{p.desc}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
