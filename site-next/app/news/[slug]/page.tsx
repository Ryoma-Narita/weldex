import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { POSTS, getPost, formatDate, type Section } from "@/data/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Weldex`,
    description: post.excerpt,
    alternates: { canonical: `https://weldex.jp/news/${post.slug}` },
  };
}

function renderSection(section: Section, i: number) {
  switch (section.type) {
    case "h2":
      return <h2 key={i} className="art-h2">{section.text}</h2>;
    case "h3":
      return <h3 key={i} className="art-h3">{section.text}</h3>;
    case "p":
      return (
        <p key={i} style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 2.1, margin: "0.8rem 0" }}>
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} style={{ margin: "0.75rem 0 0.75rem 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {section.items.map((item, j) => (
            <li key={j} style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.9, display: "flex", gap: "0.6rem", alignItems: "baseline" }}>
              <span style={{ color: "#c9a84c", fontWeight: 700, flexShrink: 0 }}>▸</span>
              {item}
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <div key={i} style={{
          background: "#fffbeb", border: "1px solid #f5e4a0",
          borderLeft: "4px solid #c9a84c", borderRadius: "0 8px 8px 0",
          padding: "1rem 1.25rem", margin: "1.5rem 0",
        }}>
          <p style={{ fontSize: "0.875rem", color: "#78630a", margin: 0, lineHeight: 1.9 }}>
            💡 {section.text}
          </p>
        </div>
      );
    case "table":
      return (
        <div key={i} style={{ overflowX: "auto", margin: "1.5rem 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--navy)" }}>
                {section.headers.map((h, j) => (
                  <th key={j} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, j) => (
                <tr key={j} style={{ borderBottom: "1px solid var(--border)", background: j % 2 === 1 ? "#f8f9fc" : "#fff" }}>
                  {row.map((cell, k) => (
                    <td key={k} style={{ padding: "0.75rem 1rem", color: "#374151" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <div key={i} style={{
          background: "var(--navy)", borderRadius: 12,
          padding: "2.5rem 2rem", margin: "3rem 0 0", textAlign: "center",
        }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "#c9a84c", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            関連サービス
          </p>
          <h3 style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: 900, color: "#fff", marginBottom: "0.75rem" }}>
            {section.heading}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", marginBottom: "1.5rem", lineHeight: 1.9 }}>
            {section.text}
          </p>
          <Link href={section.href} style={{
            display: "inline-block", background: "#c9a84c", color: "var(--navy)",
            fontWeight: 700, fontSize: "0.9rem", padding: "0.875rem 2rem",
            borderRadius: 8, textDecoration: "none",
          }}>
            {section.label}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const otherPosts = POSTS.filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <main style={{ background: "#f8f9fc" }}>
      {/* ── ページトップ ヒーロー ── */}
      <section style={{
        background: "var(--navy)",
        padding: "7.5rem clamp(1.5rem, 5vw, 6rem) 3rem",
      }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Link href="/news" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ニュース一覧
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
              padding: "0.25rem 0.8rem", borderRadius: 100,
              background: post.categoryColor + "30", color: "#c9a84c",
            }}>
              {post.category}
            </span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)" }}>
              {formatDate(post.publishedAt)} · 約{post.readMin}分
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.85rem)", fontWeight: 900, color: "#fff", lineHeight: 1.55 }}>
            {post.title}
          </h1>
        </div>
      </section>

      {/* ── 2カラム本文 ── */}
      <div className="art-layout">
        {/* ── メイン記事 ── */}
        <article>
          {/* アイキャッチ画像 */}
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                width={760}
                height={428}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            ) : (
              <div style={{
                aspectRatio: "16 / 9",
                background: `linear-gradient(135deg, var(--navy) 0%, ${post.categoryColor}44 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                  ARTICLE IMAGE
                </span>
              </div>
            )}
          </div>

          {/* 記事本文 */}
          <div style={{ background: "#fff", borderRadius: 10, padding: "2.5rem clamp(1.5rem, 4vw, 2.5rem)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            {post.body.map((section, i) => renderSection(section, i))}

            <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <Link href="/news" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ニュース一覧へ戻る
              </Link>
            </div>
          </div>
        </article>

        {/* ── サイドバー ── */}
        <aside>
          <div style={{ background: "#fff", borderRadius: 10, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", position: "sticky", top: "5.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--navy)", textTransform: "uppercase", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "2px solid var(--navy)" }}>
              新着記事
            </p>
            {otherPosts.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--light)" }}>他の記事はまだありません</p>
            ) : (
              otherPosts.map((p) => (
                <Link key={p.slug} href={`/news/${p.slug}`} className="side-card">
                  <div style={{
                    width: 72, height: 52, flexShrink: 0, borderRadius: 6, overflow: "hidden",
                    background: `linear-gradient(135deg, var(--navy) 0%, ${p.categoryColor}55 100%)`,
                  }} />
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1.5, margin: "0 0 0.25rem" }}>
                      {p.title}
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--light)" }}>{formatDate(p.publishedAt)}</span>
                  </div>
                </Link>
              ))
            )}

            {/* CTA */}
            <div style={{ marginTop: "1.75rem", padding: "1.25rem", background: "#f0f4fb", borderRadius: 8 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>
                無料相談受付中
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--gray)", lineHeight: 1.8, marginBottom: "0.75rem" }}>
                WEB制作・保守・LINE連携について、まずはお気軽にご相談ください。
              </p>
              <Link href="/contact" style={{
                display: "block", textAlign: "center", background: "var(--navy)", color: "#fff",
                fontSize: "0.8rem", fontWeight: 700, padding: "0.65rem", borderRadius: 6,
                textDecoration: "none",
              }}>
                無料で相談する
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
