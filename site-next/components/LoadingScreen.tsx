"use client";
import { useEffect, useState } from "react";

const TAGLINE = "テクノロジーで全てをつなぐ。";

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"logo" | "tagline" | "exit" | "done">("logo");

  // logo → tagline after Weldex reveal (~2.0s)
  useEffect(() => {
    const t = setTimeout(() => setPhase("tagline"), 2100);
    return () => clearTimeout(t);
  }, []);

  // tagline → exit after chars finish sliding in + pause
  useEffect(() => {
    if (phase !== "tagline") return;
    // last char: delay 13*0.055 + 0.5s anim ≈ 1.22s → wait 0.6s → exit at 1.82s
    const t = setTimeout(() => setPhase("exit"), 1900);
    return () => clearTimeout(t);
  }, [phase]);

  // exit → done
  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => setPhase("done"), 480);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;
  const exiting = phase === "exit";
  const showTagline = phase === "tagline" || phase === "exit";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "var(--navy)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "opacity 0.46s ease",
        opacity: exiting ? 0 : 1,
        pointerEvents: "none",
      }}
    >
      {/* グリッド線 */}
      {[20, 40, 60, 80].map(p => (
        <div key={`v${p}`} style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${p}%`, width: 1,
          background: "rgba(201,168,76,0.07)",
        }} />
      ))}
      {[33, 67].map(p => (
        <div key={`h${p}`} style={{
          position: "absolute", left: 0, right: 0,
          top: `${p}%`, height: 1,
          background: "rgba(201,168,76,0.07)",
        }} />
      ))}

      {/* コーナーブラケット */}
      {([
        { top: 40, left: 40, borderTop: "1px solid", borderLeft: "1px solid" },
        { top: 40, right: 40, borderTop: "1px solid", borderRight: "1px solid" },
        { bottom: 40, left: 40, borderBottom: "1px solid", borderLeft: "1px solid" },
        { bottom: 40, right: 40, borderBottom: "1px solid", borderRight: "1px solid" },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{
          position: "absolute", ...s,
          width: 22, height: 22,
          borderColor: "rgba(201,168,76,0.28)",
        }} />
      ))}

      {/* 中央コンテンツ */}
      <div style={{
        textAlign: "center",
        transition: "transform 0.46s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.46s ease",
        transform: exiting ? "translate(-43vw, -46vh) scale(0.22)" : "translate(0,0) scale(1)",
        opacity: exiting ? 0 : 1,
      }}>
        {/* Weldex ロゴ（左→右リビール） */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <div className="loader-logo-base">
            Weldex<span style={{ color: "rgba(201,168,76,0.22)" }}>.</span>
          </div>
          <div className="loader-logo-reveal" style={{ position: "absolute", top: 0, left: 0, whiteSpace: "nowrap" }}>
            Weldex<span style={{ color: "var(--gold)" }}>.</span>
          </div>
        </div>

        {/* タグライン：一文字ずつ下からスライドアップ (baigie.me ① 方式) */}
        <div style={{
          overflow: "hidden",
          marginTop: "2.5rem",
          padding: "0 clamp(1rem, 5vw, 4rem)",
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.45em" }}>
            {TAGLINE.split("").map((char, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  color: "rgba(255,255,255,0.92)",
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  fontWeight: 700,
                  transform: showTagline ? "translate(0, 0)" : "translate(0, 110%)",
                  transition: `transform cubic-bezier(0.215, 0.61, 0.355, 1) 0.5s`,
                  transitionDelay: `${i * 0.055}s`,
                  letterSpacing: "0.06em",
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* プログレスバー */}
        <div style={{
          margin: "1.8rem auto 0",
          width: "min(260px, 55vw)",
          height: 1,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}>
          <div className="loader-bar" />
        </div>
      </div>
    </div>
  );
}
