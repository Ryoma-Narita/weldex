import Link from "next/link";

const LINKS = [
  { label: "ホーム", href: "/" },
  { label: "サービス", href: "/services" },
  { label: "料金", href: "/pricing" },
  { label: "お問い合わせ", href: "/contact" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "特定商取引法", href: "/tokusho" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0c1a35",
        color: "rgba(255,255,255,0.6)",
        padding: "4rem clamp(1.5rem,5vw,5rem) 2.5rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.04em",
                marginBottom: "0.5rem",
              }}
            >
              Weldex
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#c9a84c",
                  marginLeft: 3,
                  verticalAlign: "middle",
                  marginBottom: 4,
                }}
              />
            </p>
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 300,
                lineHeight: 1.7,
                maxWidth: 260,
              }}
            >
              中小企業向けWEB制作・LINE予約システム
              <br />
              一社完結でDXを支援します。
            </p>
          </div>

          {/* Nav links */}
          <nav>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem",
              }}
            >
              {LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: "0.82rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      fontWeight: 300,
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div style={{ fontSize: "0.82rem", fontWeight: 300, lineHeight: 1.8 }}>
            <p style={{ color: "#c9a84c", fontWeight: 500, marginBottom: "0.5rem" }}>
              お問い合わせ
            </p>
            <p>
              <a
                href="mailto:info@weldex.jp"
                style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
              >
                info@weldex.jp
              </a>
            </p>
            <p style={{ marginTop: "0.3rem" }}>返信：通常1営業日以内</p>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.5rem",
            fontSize: "0.75rem",
            fontWeight: 300,
          }}
        >
          © {new Date().getFullYear()} Weldex. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
