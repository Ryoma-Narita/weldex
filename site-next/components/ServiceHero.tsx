import Link from "next/link";
import Image from "next/image";

const NAVY = "#1a2540";
const GOLD = "#b8960c";
const GRAY = "#4b5563";
const DM:  React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };
const ZEN: React.CSSProperties = { fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif" };

type Props = {
  /** パンくずの現在地ラベル */
  crumb: string;
  /** タグ（ピル）の文言 */
  tag: string;
  /** タグ・装飾のアクセントカラー */
  accent: string;
  /** 見出し（JSX可） */
  title: React.ReactNode;
  /** サブテキスト（JSX可） */
  desc: React.ReactNode;
  /** 右側の画像パス */
  image: string;
  imageAlt: string;
  /** 第1CTA（省略時は無料相談） */
  primaryHref?: string;
  primaryLabel?: string;
  /** 第2CTA（省略時はサービス一覧へ） */
  secondaryHref?: string;
  secondaryLabel?: string;
};

/**
 * サービスページ共通のヒーロー。
 * 左にテキスト・右に画像を配置し、背景にアクセントブロックと
 * ゴールドのコーナーラインを重ねた上品なレイアウトを描画する。
 */
export default function ServiceHero({
  crumb,
  tag,
  accent,
  title,
  desc,
  image,
  imageAlt,
  primaryHref = "/contact",
  primaryLabel = "無料相談をする",
  secondaryHref = "/services",
  secondaryLabel = "サービス一覧へ",
}: Props) {
  return (
    <section className="svc-hero" style={{ paddingTop: "7.5rem", background: "#fff", borderBottom: "1px solid #f1f3f5", overflow: "hidden" }}>
      <div className="svc-hero-inner">
        {/* パンくず */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: GRAY, marginBottom: "2.25rem", ...DM }}>
          <Link href="/"         style={{ color: GRAY, textDecoration: "none" }}>ホーム</Link>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <Link href="/services" style={{ color: GRAY, textDecoration: "none" }}>サービス</Link>
          <span style={{ color: "#cbd5e1" }}>›</span>
          <span style={{ color: NAVY, fontWeight: 500 }}>{crumb}</span>
        </nav>

        <div className="svc-hero-grid">
          {/* ── 左：テキスト ── */}
          <div className="svc-hero-text">
            <span style={{ display: "inline-block", background: accent, color: "#fff", fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.9rem", borderRadius: 100, marginBottom: "1.5rem", letterSpacing: "0.04em", ...DM }}>
              {tag}
            </span>

            <h1 style={{ ...ZEN, fontSize: "clamp(2.2rem,4.6vw,3.6rem)", fontWeight: 900, color: NAVY, lineHeight: 1.18, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              {title}
            </h1>

            <p style={{ ...ZEN, fontSize: "clamp(0.9rem,1.5vw,1.05rem)", color: GRAY, lineHeight: 1.95, fontWeight: 400, marginBottom: "2.25rem", maxWidth: 520 }}>
              {desc}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href={primaryHref} style={{ display: "inline-block", background: NAVY, color: "#fff", padding: "0.85rem 2rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", ...DM }}>
                {primaryLabel}
              </Link>
              <Link href={secondaryHref} style={{ display: "inline-block", border: `1.5px solid ${NAVY}`, color: NAVY, padding: "0.85rem 2rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.03em", background: "transparent", ...DM }}>
                {secondaryLabel}
              </Link>
            </div>
          </div>

          {/* ── 右：画像（アクセントブロック＋ゴールドコーナー） ── */}
          <div className="svc-hero-figure">
            {/* 背面アクセントブロック */}
            <span aria-hidden="true" className="svc-hero-accent" style={{ background: accent }} />
            {/* 画像フレーム */}
            <div className="svc-hero-imgwrap">
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(max-width: 900px) 90vw, 45vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            {/* ゴールドのコーナーライン */}
            <span aria-hidden="true" className="svc-hero-corner" style={{ borderColor: GOLD }} />
          </div>
        </div>
      </div>

      <style>{`
        .svc-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem clamp(1.5rem,5vw,5rem) 4.5rem;
        }
        .svc-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(2rem, 5vw, 4.5rem);
          align-items: center;
        }
        .svc-hero-figure {
          position: relative;
          width: 100%;
        }
        .svc-hero-accent {
          position: absolute;
          right: -1.25rem;
          top: -1.25rem;
          width: 62%;
          height: 62%;
          border-radius: 14px;
          opacity: 0.1;
          z-index: 0;
        }
        .svc-hero-imgwrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 2;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 28px 60px rgba(12,26,53,0.16);
          z-index: 1;
        }
        .svc-hero-corner {
          position: absolute;
          left: -1rem;
          bottom: -1rem;
          width: 70px;
          height: 70px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          border-bottom-left-radius: 14px;
          z-index: 2;
        }
        @media (max-width: 900px) {
          .svc-hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .svc-hero-text { order: 1; }
          .svc-hero-figure { order: 2; max-width: 460px; }
          .svc-hero-accent { right: -0.75rem; top: -0.75rem; }
        }
      `}</style>
    </section>
  );
}
