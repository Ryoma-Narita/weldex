"use client";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "./FadeIn";
import { useEffect, useState } from "react";

const LINES = [
  "AIとテクノロジーで",
  "日本の全ての会社の技術を",
  "底上げする。",
];

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="hero-wrap" style={{
      minHeight: "100svh",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      padding: "8rem clamp(1.5rem, 5vw, 6rem) 5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* 背景画像 */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/hero-tech.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center right" }}
          priority
          aria-hidden="true"
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.92) 52%, rgba(255,255,255,0.45) 65%, rgba(255,255,255,0.05) 82%, rgba(255,255,255,0) 100%)",
        }} />
      </div>

      {/* テキストコンテンツ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 780 }}>
        <FadeIn delay={0.1} style={{
          fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em",
          color: "var(--gold)", textTransform: "uppercase", marginBottom: "1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--gold)" }} />
          AI-Powered Digital Partner
        </FadeIn>

        {/* ① 一文字ずつ下からスライドイン (baigie.me CSS Tips #1) */}
        <h1 style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(1.7rem, 3.8vw, 3.2rem)",
          fontWeight: 900,
          color: "var(--navy)",
          lineHeight: 1.45,
          letterSpacing: "-0.01em",
          marginBottom: "1.5rem",
        }}>
          {LINES.map((line, lineIdx) => (
            <div key={lineIdx} style={{ overflow: "hidden" }}>
              <div style={{ display: "flex" }}>
                {line.split("").map((char, charIdx) => (
                  <span
                    key={charIdx}
                    style={{
                      display: "block",
                      transform: visible ? "translate(0, 0)" : "translate(0, 110%)",
                      transition: `transform cubic-bezier(0.215, 0.61, 0.355, 1) 0.65s`,
                      transitionDelay: `${0.15 + lineIdx * 0.32 + charIdx * 0.038}s`,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </h1>

        <FadeIn delay={0.9}>
          <p style={{
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            color: "var(--gray)",
            lineHeight: 1.85,
            marginBottom: "1.75rem",
            maxWidth: 480,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            padding: "0.5rem 0.75rem",
            borderRadius: 4,
          }}>
            WEBサイト制作・LINE予約・システム開発まで一社完結。<br />
            医療・歯科・士業・建設の現場を、AIで支えます。
          </p>
        </FadeIn>

        <FadeIn delay={1.0}>
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            gap: "0.75rem", marginBottom: "1.75rem",
          }}>
            <Link href="/diagnosis" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "var(--gold)", color: "var(--navy)",
              padding: "0.8rem 1.6rem", fontSize: "0.9rem", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.04em", borderRadius: 8,
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              サイトを無料診断する
            </Link>
            <Link href="/services" style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              border: "1px solid var(--navy)", color: "var(--navy)",
              padding: "0.8rem 1.4rem", fontSize: "0.9rem", fontWeight: 600,
              textDecoration: "none", letterSpacing: "0.04em", borderRadius: 8,
              background: "rgba(255,255,255,0.7)",
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}>
              サービス・料金を見る →
            </Link>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}
