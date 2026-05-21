import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* ブランド */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">W</div>
              <span className="footer-logo-text">
                WELDEX<span className="footer-logo-dot">•</span>
              </span>
            </div>
            <p className="footer-desc">
              中小企業向けWEB制作・LINE予約システム<br />
              一社完結でDXを支援します。
            </p>
          </div>

          {/* ナビリンク */}
          <div className="footer-nav">
            <div className="footer-nav-col">
              <Link href="/services" className="footer-nav-link">Service</Link>
              <Link href="/works" className="footer-nav-link">Works &amp; Demo</Link>
              <Link href="/about" className="footer-nav-link">About</Link>
            </div>
            <div className="footer-nav-col">
              <Link href="/news" className="footer-nav-link">News &amp; Blog</Link>
              <Link href="/contact" className="footer-nav-link">Contact</Link>
            </div>
          </div>

          {/* 連絡先 */}
          <div className="footer-contact">
            <div className="footer-contact-label">CONTACT</div>
            <a href="mailto:info@weldex.jp" className="footer-contact-email">
              info@weldex.jp
            </a>
            <div className="footer-contact-note">返信：通常1営業日以内</div>
          </div>
        </div>

        {/* ボトム */}
        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} Weldex. All rights reserved.
          </span>
          <div className="footer-legal">
            <Link href="/privacy" className="footer-legal-link">プライバシーポリシー</Link>
            <Link href="/tokusho" className="footer-legal-link">特定商取引法</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
