"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { label: "ホーム", href: "/" },
  { label: "サービス", href: "/services" },
  { label: "実績・デモ", href: "/works" },
  { label: "料金", href: "/pricing" },
];

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
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8e8e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem clamp(1.5rem,5vw,5rem)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "#0c1a35",
            letterSpacing: "0.04em",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          Weldex
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#c9a84c",
              display: "inline-block",
              marginBottom: 6,
            }}
          />
        </Link>

        {/* Desktop nav */}
        <ul
          style={{
            gap: "2.5rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
          className="hidden md:flex"
        >
          {NAV.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    fontSize: "0.875rem",
                    color: active ? "var(--gold)" : "#0c1a35",
                    textDecoration: "none",
                    fontWeight: active ? 500 : 400,
                    borderBottom: active ? "1px solid var(--gold)" : "none",
                    paddingBottom: active ? 2 : 0,
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                background: "#0c1a35",
                color: "#fff",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                padding: "0.6rem 1.5rem",
                textDecoration: "none",
              }}
            >
              無料相談
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          onClick={toggle}
          aria-label="メニュー"
          style={{
            flexDirection: "column",
            gap: 5,
            padding: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          className="flex md:hidden flex-col"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: 22,
                height: 1.5,
                background: "#0c1a35",
                transition: "all 0.2s",
                transform:
                  open && i === 0
                    ? "rotate(45deg) translate(5px,5px)"
                    : open && i === 2
                    ? "rotate(-45deg) translate(5px,-5px)"
                    : "none",
                opacity: open && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 190,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.1rem 1.5rem",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#0c1a35",
              }}
            >
              Weldex
            </span>
            <button
              onClick={close}
              aria-label="閉じる"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0c1a35"
                strokeWidth="1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1.5rem",
            }}
          >
            {[...NAV].map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  style={{
                    padding: "1rem 0",
                    fontSize: "1.1rem",
                    color: active ? "var(--gold)" : "#0c1a35",
                    textDecoration: "none",
                    borderBottom: "1px solid #e8e8e8",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={close}
              style={{
                display: "block",
                marginTop: "2rem",
                background: "#0c1a35",
                color: "#fff",
                textAlign: "center",
                padding: "1rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              無料相談をする
            </Link>
          </div>

          <div
            style={{
              marginTop: "auto",
              padding: "1.5rem",
              borderTop: "1px solid #e8e8e8",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "#aaa",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              WEBサイト制作・LINE予約・システム開発
              <br />
              info@weldex.jp
            </p>
          </div>
        </div>
      )}
    </>
  );
}
