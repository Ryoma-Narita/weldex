"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const DESKTOP_NAV = [
  { label: "ホーム",     href: "/" },
  { label: "サービス",   href: "/services" },
  { label: "実績・デモ", href: "/works" },
  { label: "料金",       href: "/pricing" },
  { label: "About",      href: "/about" },
];

const MENU_ITEMS = [
  { label: "SERVICE",      href: "/services" },
  { label: "WORKS & DEMO", href: "/works" },
  { label: "ABOUT",        href: "/about" },
  { label: "NEWS & BLOG",  href: "/news" },
];

const STAGGER = ["0.05s", "0.12s", "0.19s", "0.26s"];

const DM: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };
  const toggle = () => {
    const next = !open;
    setOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  };

  return (
    <>
      {/* ── ナビゲーションバー ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8e8e8",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.1rem clamp(1.5rem,5vw,5rem)",
      }}>
        {/* ロゴ */}
        <Link href="/" style={{
          fontSize: "1.45rem", fontWeight: 700, color: "#0c1a35",
          letterSpacing: "0.04em", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 3,
          ...DM,
        }}>
          Weldex
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a84c", display: "inline-block", marginBottom: 6 }} />
        </Link>

        {/* デスクトップ nav */}
        <ul style={{ gap: "2.5rem", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }} className="hidden md:flex">
          {DESKTOP_NAV.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link href={href} style={{
                  fontSize: "0.875rem",
                  color: active ? "var(--gold)" : "#0c1a35",
                  textDecoration: "none",
                  fontWeight: active ? 500 : 400,
                  borderBottom: active ? "1px solid var(--gold)" : "none",
                  paddingBottom: active ? 2 : 0,
                }}>
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/contact" style={{
              display: "inline-block", background: "#0c1a35", color: "#fff",
              fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.04em",
              padding: "0.6rem 1.5rem", textDecoration: "none",
            }}>
              無料相談
            </Link>
          </li>
        </ul>

        {/* ハンバーガーボタン */}
        <button
          onClick={toggle}
          aria-label="メニュー"
          className="flex md:hidden"
          style={{ flexDirection: "column", gap: 5, padding: 8, background: "none", border: "none", cursor: "pointer", alignItems: "flex-end" }}
        >
          {[22, 22, 16].map((w, i) => (
            <span key={i} style={{ display: "block", width: w, height: 1.5, background: "#1a2540", borderRadius: 2 }} />
          ))}
        </button>
      </nav>

      {/* ── フルスクリーンメニュー ── */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "#111318",
          display: "flex", flexDirection: "column",
          animation: "menuOpenAnim 0.25s ease",
        }}>
          {/* メニューヘッダー */}
          <div style={{ height: 64, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, background: "#fff", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#1a2540", ...DM,
              }}>W</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", ...DM }}>
                WELDEX<span style={{ color: "#b8960c", fontSize: 8, marginLeft: 2 }}>•</span>
              </span>
            </div>
            <button
              onClick={close}
              aria-label="閉じる"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}
            >
              <span style={{ display: "block", height: 1.5, width: 24, background: "#fff", borderRadius: 2, transform: "rotate(45deg) translateY(6.5px)" }} />
              <span style={{ display: "block", height: 1.5, width: 24, background: "#fff", borderRadius: 2, transform: "rotate(-45deg) translateY(-6.5px)" }} />
            </button>
          </div>

          {/* メニュー項目 */}
          <div style={{ flex: 1, padding: "32px 24px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
            {MENU_ITEMS.map(({ label, href }, i) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="menu-nav-item"
                style={{
                  fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 700,
                  letterSpacing: "0.04em", color: "#fff",
                  textDecoration: "none", display: "block", lineHeight: 1,
                  opacity: 0,
                  animation: `menuItemIn 0.4s ease ${STAGGER[i]} forwards`,
                  ...DM,
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA ボタン */}
          <div style={{ padding: "0 24px 16px", flexShrink: 0 }}>
            <Link
              href="/contact"
              onClick={close}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "20px 24px",
                borderRadius: 100, background: "#b8960c",
                color: "#fff", fontSize: 16, fontWeight: 700,
                textDecoration: "none", boxSizing: "border-box",
                letterSpacing: "0.04em", ...DM,
              }}
            >
              <span>無料相談をする</span>
              <span>→</span>
            </Link>
          </div>

          {/* フッターリンク */}
          <div style={{ padding: "16px 24px 32px", display: "flex", gap: 24, flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { label: "プライバシーポリシー", href: "/privacy" },
              { label: "特定商取引法",         href: "/legal" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} onClick={close} style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", ...DM }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
