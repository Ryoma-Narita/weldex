import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Weldex",
  description: "Weldexのプライバシーポリシーです。個人情報の取得・利用目的・管理方針を定めています。",
  alternates: { canonical: "https://weldex.jp/privacy" },
};

const sections = [
  {
    title: "1. 取得する個人情報",
    body: "当事業者は、お問い合わせフォームやメール等を通じて、以下の個人情報を取得することがあります。",
    list: ["氏名", "メールアドレス", "電話番号", "会社名・屋号", "お問い合わせ内容"],
  },
  {
    title: "2. 利用目的",
    body: "取得した個人情報は、以下の目的のために利用します。",
    list: [
      "お問い合わせ・ご相談への対応",
      "サービスのご提案・お見積もりの提示",
      "契約の締結・履行に関する連絡",
      "サービス改善のための分析（個人を特定しない形で使用）",
    ],
  },
  {
    title: "3. 第三者提供",
    body: "当事業者は、以下の場合を除き、お客様の個人情報を第三者に提供・開示することはありません。",
    list: [
      "お客様の同意がある場合",
      "法令に基づく開示が必要な場合",
      "人の生命・身体・財産の保護のために必要な場合",
    ],
  },
  {
    title: "4. 個人情報の管理",
    body: "当事業者は、個人情報への不正アクセス・紛失・破損・改ざん・漏洩等を防ぐため、適切なセキュリティ対策を講じます。保有する個人情報は、利用目的の達成後、速やかに削除します。",
    list: [],
  },
  {
    title: "5. Cookie・アクセス解析",
    body: "当サイトでは、Googleアナリティクスを使用してアクセス情報を収集・分析する場合があります。収集されるデータは匿名であり、個人を特定するものではありません。Cookieの無効化はブラウザの設定から行えます。",
    list: [],
  },
  {
    title: "6. 開示・訂正・削除",
    body: "お客様ご自身の個人情報の開示・訂正・削除をご希望の場合は、下記お問い合わせ先までご連絡ください。合理的な期間内に対応いたします。",
    list: [],
  },
  {
    title: "7. お問い合わせ",
    body: "プライバシーポリシーに関するお問い合わせは、下記までご連絡ください。",
    list: [],
    contact: true,
  },
];

const pStyle: React.CSSProperties = { fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 2 };
const h3Style: React.CSSProperties = {
  fontFamily: "var(--font-cormorant)", fontSize: "1.15rem", color: "var(--navy)",
  fontWeight: 700, marginBottom: "0.75rem", paddingBottom: "0.5rem",
  borderBottom: "1px solid var(--border)",
};

export default function PrivacyPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ background: "var(--off)", borderBottom: "1px solid var(--border)", padding: "3rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="sec-label">Privacy Policy</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(1.8rem,3.5vw,2.5rem)",
            fontWeight: 700, color: "var(--navy)", lineHeight: 1.2,
          }}>
            プライバシーポリシー
          </h1>
        </div>
      </div>

      <section style={{ padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ ...pStyle, marginBottom: "3rem" }}>
            Weldex（以下「当事業者」）は、お客様の個人情報の保護を重要な責務と考え、以下のとおりプライバシーポリシーを定めます。
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {sections.map((s) => (
              <div key={s.title}>
                <h2 style={h3Style}>{s.title}</h2>
                {s.body && <p style={pStyle}>{s.body}</p>}
                {s.list.length > 0 && (
                  <ul style={{ marginTop: "0.75rem", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {s.list.map((item) => (
                      <li key={item} style={pStyle}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.contact && (
                  <div style={{
                    marginTop: "1rem", padding: "1.25rem 1.5rem",
                    background: "var(--off)", border: "1px solid var(--border)",
                    fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 2,
                  }}>
                    事業者名：Weldex<br />
                    メール：info@weldex.jp
                  </div>
                )}
              </div>
            ))}
          </div>

          <p style={{ ...pStyle, marginTop: "3rem", color: "var(--light)" }}>
            制定日：2025年5月1日
          </p>

          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
            <Link href="/" className="btn btn-outline" style={{ fontSize: "0.82rem" }}>
              トップへ戻る →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
