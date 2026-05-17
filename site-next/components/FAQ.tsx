"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";

const faqs = [
  { q: "料金はどのくらいかかりますか？", a: "サイト制作は¥150,000〜、LINE・WEB予約システムは¥80,000〜です。ご要件によって変動しますので、まず無料相談でお気軽にご相談ください。大手制作会社と比べ3分の1以下のコストを実現しています。" },
  { q: "納期はどのくらいですか？", a: "シンプルなサイトであれば最短2〜3週間、標準的な構成で4〜6週間が目安です。ご要望の公開日がある場合はお早めにご相談ください。" },
  { q: "修正は何回までできますか？", a: "デザイン確認時に2回、コーディング完了後に2回まで無償で対応します。それ以上の修正や仕様変更は別途お見積もりとなります。" },
  { q: "素材・写真は用意する必要がありますか？", a: "ロゴや店舗写真など手持ちの素材があればご提供ください。ない場合はフリー素材の選定・加工で対応します。プロカメラマンの手配が必要な場合は別途ご相談ください。" },
  { q: "公開後のサポートはありますか？", a: "公開後1ヶ月間は無料サポートが付きます。その後は月額¥5,000〜の保守プランへ移行可能です。内容の更新・SEO改善・トラブル対応まで継続してサポートします。" },
  { q: "今のサイトのデータは引き継げますか？", a: "テキスト・画像・お客様リストなどのデータ移行に対応しています。Excelや既存システムからのデータ移行も可能ですのでご相談ください。" },
  { q: "契約後にキャンセルはできますか？", a: "着手前（着手金入金前）はキャンセル料なしでキャンセル可能です。着手後のキャンセルは着手金の返金ができません。詳細は契約書に定める通りとなります。" },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ background: "var(--off)", borderTop: "1px solid var(--border)", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
      <div className="resp-2col" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "5rem", alignItems: "start" }}>
        <FadeIn>
          <div className="sec-label">FAQ</div>
          <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
            よくある<br />ご質問
          </h2>
          <p className="sec-desc" style={{ marginTop: "0.75rem" }}>その他のご質問はお気軽にお問い合わせください。</p>
          <Link href="/contact" className="btn btn-outline" style={{ marginTop: "1.5rem", display: "inline-block", fontSize: "0.8rem" }}>
            お問い合わせ →
          </Link>
        </FadeIn>
        <FadeIn delay={0.15}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "1.25rem 0", textAlign: "left", gap: "1rem",
                }}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--navy)", lineHeight: 1.5 }}>{faq.q}</span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ flexShrink: 0, fontSize: "1.2rem", color: "var(--gray)", lineHeight: 1, display: "block" }}
                >+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ paddingBottom: "1.25rem" }}>
                      <p style={{ fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300, lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
