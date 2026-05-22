import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Weldex",
  description: "Weldexのプライバシーポリシーです。個人情報の取得・利用目的・管理方針を定めています。",
  alternates: { canonical: "https://weldex.jp/privacy" },
};

const sections: { title: string; content: React.ReactNode }[] = [
  {
    title: "1. 事業者情報",
    content: (
      <div style={{ lineHeight: 2 }}>
        Weldex（成田 涼真）<br />
        千葉県市原市五井東1-21-1<br />
        <a href="mailto:info@weldex.jp" style={{ color: "var(--navy)", textDecoration: "underline" }}>
          info@weldex.jp
        </a>
      </div>
    ),
  },
  {
    title: "2. 取得する情報",
    content: (
      <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <li>お問い合わせフォームへの入力情報（氏名・会社名・メールアドレス・お問い合わせ内容）</li>
        <li>アクセス解析情報（Google Analytics による閲覧ページ・滞在時間等）</li>
        <li>Cookie に関する情報</li>
      </ul>
    ),
  },
  {
    title: "3. 利用目的",
    content: (
      <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <li>お問い合わせへの返答</li>
        <li>サービスの改善・向上</li>
        <li>アクセス解析による利便性向上</li>
      </ul>
    ),
  },
  {
    title: "4. 第三者提供",
    content: (
      <>
        <p>以下の場合を除き、第三者に提供しません。</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>法令に基づく場合</li>
          <li>人命保護のために必要な場合</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. 業務委託",
    content: (
      <>
        <p>以下のサービスに業務委託する場合があります。各社のプライバシーポリシーに準拠します。</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <li>Google Analytics（アクセス解析）</li>
          <li>SendGrid（メール配信）</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Cookie について",
    content: (
      <p>
        当サイトは Google Analytics を使用しており、Cookie を利用しています。
        ブラウザの設定から無効化できます。
      </p>
    ),
  },
  {
    title: "7. 個人情報の開示・削除",
    content: (
      <p>
        ご本人からの開示・訂正・削除のご要望は{" "}
        <a href="mailto:info@weldex.jp" style={{ color: "var(--navy)", textDecoration: "underline" }}>
          info@weldex.jp
        </a>{" "}
        までご連絡ください。合理的な期間内に対応いたします。
      </p>
    ),
  },
  {
    title: "8. 改定",
    content: (
      <p>
        本ポリシーは予告なく改定する場合があります。最新版をこのページにてご確認ください。
      </p>
    ),
  },
];

const pStyle: React.CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--gray)",
  lineHeight: 2.0,
};

export default function PrivacyPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      {/* Hero */}
      <div
        style={{
          background: "var(--off)",
          borderBottom: "1px solid var(--border)",
          padding: "3rem clamp(1.5rem,5vw,6rem)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="sec-label">Privacy Policy</div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(22px,3.5vw,36px)",
              fontWeight: 900,
              color: "var(--navy)",
              lineHeight: 1.25,
            }}
          >
            プライバシーポリシー
          </h1>
        </div>
      </div>

      {/* Content */}
      <section style={{ padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {sections.map((s) => (
              <div key={s.title}>
                <h2
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "clamp(17px, 2vw, 22px)",
                    color: "var(--navy)",
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: "0.75rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {s.title}
                </h2>
                <div style={pStyle}>{s.content}</div>
              </div>
            ))}
          </div>

          <p style={{ ...pStyle, marginTop: "3rem", color: "var(--light)", fontSize: "0.8rem" }}>
            制定日：2026年5月18日
          </p>

          <div
            style={{
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <Link href="/" className="btn btn-outline" style={{ fontSize: "0.82rem" }}>
              トップへ戻る →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
