import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Weldex",
  description: "Weldexの特定商取引法に基づく表記です。販売業者・料金・キャンセルポリシー等を記載しています。",
  alternates: { canonical: "https://weldex.jp/legal" },
};

const rows: { label: string; content: React.ReactNode }[] = [
  {
    label: "販売業者",
    content: "Weldex（成田 涼真）",
  },
  {
    label: "所在地",
    content: "千葉県市原市五井東1-21-1",
  },
  {
    label: "電話番号",
    content: (
      <>
        080-3404-1872
        <br />
        <span style={{ fontSize: "0.8rem", color: "var(--light)" }}>
          受付時間：平日 10:00〜18:00
        </span>
      </>
    ),
  },
  {
    label: "メールアドレス",
    content: (
      <a href="mailto:info@weldex.jp" style={{ color: "var(--navy)", textDecoration: "underline" }}>
        info@weldex.jp
      </a>
    ),
  },
  {
    label: "サービス内容",
    content: "WEBサイト制作・予約システム導入・LINE連携・保守サポート",
  },
  {
    label: "料金",
    content: (
      <>
        ¥150,000〜（税込）
        <br />
        <Link href="/pricing" style={{ fontSize: "0.8rem", color: "var(--navy)", textDecoration: "underline" }}>
          詳細は料金ページをご参照ください
        </Link>
      </>
    ),
  },
  {
    label: "支払い方法",
    content: "銀行振込",
  },
  {
    label: "支払い時期",
    content: (
      <>
        着手金（50%）：契約後 7 日以内
        <br />
        残金（50%）：納品確認後 7 日以内
      </>
    ),
  },
  {
    label: "サービス提供時期",
    content: "契約・着手金入金確認後、約4週間",
  },
  {
    label: "キャンセルについて",
    content: (
      <>
        制作着手前：全額返金
        <br />
        制作着手後：着手金の返金不可
        <br />
        納品後：返金不可
      </>
    ),
  },
  {
    label: "特記事項",
    content:
      "第三者サービス（Vercel・Railway・LINE 等）の障害に起因する損害については責任を負いかねます。",
  },
];

export default function LegalPage() {
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
          <div className="sec-label">Legal</div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(22px,3.5vw,36px)",
              fontWeight: 900,
              color: "var(--navy)",
              lineHeight: 1.25,
            }}
          >
            特定商取引法に基づく表記
          </h1>
        </div>
      </div>

      {/* Table */}
      <section style={{ padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9375rem",
              lineHeight: 2.0,
            }}
          >
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <th
                    style={{
                      background: "var(--off)",
                      color: "var(--navy)",
                      fontWeight: 500,
                      padding: "1rem 1.25rem",
                      textAlign: "left",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                      width: "9rem",
                      fontSize: "0.8rem",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {row.label}
                  </th>
                  <td
                    style={{
                      padding: "1rem 1.25rem",
                      color: "var(--gray)",
                      verticalAlign: "top",
                    }}
                  >
                    {row.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
