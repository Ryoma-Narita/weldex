"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };
  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.1rem clamp(1.5rem, 5vw, 5rem)",
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant)", fontSize: "1.45rem", fontWeight: 700,
          color: "var(--navy)", letterSpacing: "0.04em", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "3px",
        }}>
          Weldex
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--gold)", display: "inline-block", marginBottom: 6,
          }} />
        </Link>

        {/* Desktop nav */}
        <ul style={{
          display: "flex", gap: "2.5rem", listStyle: "none",
          margin: 0, padding: 0, alignItems: "center",
        }} className="hidden md:flex">
          <li><Link href="/" style={{ fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 400 }}>ホーム</Link></li>
          <li><Link href="/services" style={{ fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 400 }}>サービス</Link></li>
          <li><Link href="/works" style={{ fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 400 }}>実績・デモ</Link></li>
          <li><Link href="/pricing" style={{ fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 400 }}>料金</Link></li>
          <li>
            <Link href="/contact" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.82rem" }}>
              無料相談
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className="flex md:hidden flex-col gap-[5px] p-2 bg-transparent border-0 cursor-pointer"
          onClick={toggleMenu}
          aria-label="メニュー"
        >
          <span style={{ display: "block", width: 22, height: 1.5, background: "var(--navy)", transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 1.5, background: "var(--navy)", transition: "all 0.2s", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 1.5, background: "var(--navy)", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 190,
          background: "var(--white)", display: "flex", flexDirection: "column",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.3rem", fontWeight: 700, color: "var(--navy)" }}>Weldex</span>
            <button onClick={closeMenu} aria-label="閉じる" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c1a35" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}>
            {[["ホーム", "/"], ["サービス", "/services"], ["実績・デモ", "/works"], ["料金", "/pricing"]].map(([label, href]) => (
              <Link key={href} href={href} onClick={closeMenu} style={{
                padding: "1rem 0", fontSize: "1.1rem", color: "var(--navy)",
                textDecoration: "none", borderBottom: "1px solid var(--border)", fontWeight: 400,
              }}>{label}</Link>
            ))}
            <Link href="/contact" onClick={closeMenu} className="btn btn-primary" style={{ marginTop: "2rem", textAlign: "center" }}>
              無料相談をする
            </Link>
          </div>
          <div style={{ marginTop: "auto", padding: "1.5rem", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--light)", fontWeight: 300, lineHeight: 1.7 }}>
              WEBサイト制作・LINE予約・システム開発<br />info@weldex.jp
            </p>
          </div>
        </div>
      )}
    </>
  );
}
