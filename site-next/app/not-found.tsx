import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "5rem clamp(1.5rem, 5vw, 6rem)", textAlign: "center",
    }}>
      <div>
        <div style={{
          fontFamily: "var(--font-cormorant)", fontSize: "clamp(5rem, 15vw, 10rem)",
          fontWeight: 700, color: "var(--border)", lineHeight: 1, marginBottom: "1.5rem",
        }}>404</div>
        <h1 style={{
          fontSize: "clamp(1.2rem, 2.5vw, 1.75rem)", fontWeight: 700,
          color: "var(--navy)", marginBottom: "1rem",
        }}>
          ページが見つかりません
        </h1>
        <p style={{
          fontSize: "0.9rem", color: "var(--gray)", fontWeight: 300,
          lineHeight: 1.8, marginBottom: "2.5rem",
        }}>
          お探しのページは移動または削除された可能性があります。
        </p>
        <Link href="/" className="btn btn-outline">トップページへ戻る</Link>
      </div>
    </main>
  );
}
