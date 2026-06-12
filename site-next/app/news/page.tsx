import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { POSTS, formatDate } from "@/data/posts";

export const metadata: Metadata = {
  title: "News & Blog | Weldex",
  description:
    "WEB制作・予約システム・LINE連携に関する実践的な情報を発信。費用相場・導入事例・運用ノウハウなど中小企業の経営者に役立つ記事を掲載しています。",
  alternates: { canonical: "https://weldex.jp/news" },
};

/** 画像がない場合のグラデーションプレースホルダー */
function Placeholder({ color }: { color: string }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16 / 9",
      background: `linear-gradient(135deg, var(--navy) 0%, ${color}55 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
        <circle cx="13" cy="17" r="3" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" fill="none" />
        <path d="M4 26l9-7 7 5 5-4 11 9" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

export default function NewsPage() {
  return (
    <main>
      <PageHeader
        title="News & Blog"
        desc="WEB制作・予約システム・LINE連携に関する実践的な情報を発信しています。"
      />

      <section style={{
        background: "#f8f9fc",
        padding: "4rem clamp(1.5rem, 5vw, 6rem) 6rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {POSTS.length === 0 ? (
            <p style={{ color: "var(--gray)", textAlign: "center", padding: "5rem 0" }}>
              記事を準備中です。しばらくお待ちください。
            </p>
          ) : (
            <ul className="news-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {POSTS.map((post) => (
                <li key={post.slug}>
                  <Link href={`/news/${post.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <article className="news-card">
                      {/* サムネイル */}
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={600}
                          height={338}
                          style={{ width: "100%", height: "auto", display: "block" }}
                        />
                      ) : (
                        <Placeholder color={post.categoryColor} />
                      )}

                      {/* カード本文 */}
                      <div style={{ padding: "1.25rem 1.5rem 1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h2 style={{
                          fontSize: "0.975rem", fontWeight: 700, color: "var(--navy)",
                          lineHeight: 1.6, marginBottom: "auto", paddingBottom: "1rem",
                        }}>
                          {post.title}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ fontSize: "0.78rem", color: "var(--light)" }}>
                              {formatDate(post.publishedAt)}
                            </span>
                            <span style={{
                              fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em",
                              padding: "0.2rem 0.6rem", borderRadius: 4,
                              background: post.categoryColor + "15", color: post.categoryColor,
                            }}>
                              {post.category}
                            </span>
                          </div>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 9h10M10 5l4 4-4 4" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
