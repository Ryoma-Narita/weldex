import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--navy)", color: "var(--white)" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: "2rem",
        padding: "3rem clamp(1.5rem,5vw,6rem)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.45rem", fontWeight: 700, color: "var(--white)", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 3, marginBottom: "0.6rem" }}>
            Weldex
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", display: "inline-block", marginBottom: 6 }} />
          </div>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>AIで、あなたの事業の本質を支える。</p>
        </div>
        <nav style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          {[["ホーム", "/"], ["サービス", "/services"], ["料金", "/pricing"], ["お問い合わせ", "/contact"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 300 }}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "1rem",
        padding: "1.25rem clamp(1.5rem,5vw,6rem)",
      }}>
        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
          © 2026 Weldex. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {[["プライバシーポリシー", "/privacy"], ["特定商取引法に基づく表記", "/tokusho"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
