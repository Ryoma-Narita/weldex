import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Weldex",
  description: "Weldexの特定商取引法に基づく表記です。",
  alternates: { canonical: "https://weldex.jp/tokusho" },
};

type Row = { label: string; value: ReactNode };

const rows: Row[] = [
  { label: "事業者名", value: "Weldex" },
  { label: "代表者名", value: "成田 龍馬" },
  {
    label: "所在地",
    value: (
      <>
        ※請求があれば遅滞なく開示します
      </>
    ),
  },
  {
    label: "電話番号",
    value: (
      <>
        ※請求があれば遅滞なく開示します
      </>
    ),
  },
  {
    label: "メールアドレス",
    value: <a href="mailto:info@weldex.jp" style={{ color: "var(--navy)" }}>info@weldex.jp</a>,
  },
  {
    label: "サービス内容",
    value: "WEBサイト制作・LINE予約システム構築・システム開発・保守運用サポート",
  },
  {
    label: "料金",
    value: "各サービスページに記載の通り。詳細はお見積もりにてご提示します。表示価格はすべて税別です。",
  },
  { label: "支払い方法", value: "銀行振込" },
  {
    label: "支払い時期",
    value: "契約締結時に50%、納品完了時に残額50%をお支払いいただきます。",
  },
  {
    label: "サービス提供時期",
    value: "着手金のご入金確認後、制作を開始します。納期は契約時に別途合意した日程に従います。",
  },
  {
    label: "キャンセル・返金",
    value: "制作着手後のキャンセルについては、着手金の返金はいたしかねます。納品後の返金も原則対応しておりません。詳細は契約書に定める通りとします。",
  },
  {
    label: "動作環境",
    value: "制作物は主要ブラウザ（Chrome・Safari・Firefox・Edge）の最新版および直近1世代での動作を保証します。",
  },
];

export default function TokushoPage() {
  return (
    <main style={{ paddingTop: "7rem" }}>
      <div style={{ background: "var(--off)", borderBottom: "1px solid var(--border)", padding: "3rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="sec-label">Specified Commercial Transactions</div>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(1.8rem,3.5vw,2.5rem)",
            fontWeight: 700, color: "var(--navy)", lineHeight: 1.2,
          }}>
            特定商取引法に基づく表記
          </h1>
        </div>
      </div>

      <section style={{ padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 2, marginBottom: "2.5rem" }}>
            特定商取引法第11条に基づき、以下の通り表記します。
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)" }}>
            {rows.map((row) => (
              <div
                key={row.label}
                style={{ display: "grid", gridTemplateColumns: "160px 1fr", background: "var(--white)" }}
                className="tokusho-row"
              >
                <div style={{
                  padding: "1.1rem 1.25rem",
                  background: "var(--off)",
                  fontSize: "0.82rem", color: "var(--navy)", fontWeight: 500,
                  borderRight: "1px solid var(--border)",
                }}>
                  {row.label}
                </div>
                <div style={{
                  padding: "1.1rem 1.25rem",
                  fontSize: "0.85rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.8,
                }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--light)", fontWeight: 300, marginTop: "2rem" }}>
            最終更新日：2025年5月1日
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
