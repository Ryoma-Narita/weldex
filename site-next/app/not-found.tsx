import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "100svh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", textAlign: "center",
    }}>
      <p style={{
        fontFamily: "var(--font-cormorant)",
        fontSize: "clamp(6rem,20vw,12rem)",
        fontWeight: 700, color: "var(--border)",
        lineHeight: 1, marginBottom: "1rem",
      }}>404</p>
      <h1 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.75rem" }}>
        ページが見つかりません
      </h1>
      <p style={{ fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, marginBottom: "2.5rem" }}>
        URLが変更されたか、削除された可能性があります。
      </p>
      <Link href="/" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
        トップへ戻る →
      </Link>
    </main>
  );
}
