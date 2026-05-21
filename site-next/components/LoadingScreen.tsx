"use client";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"visible" | "exit" | "done">("visible");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 2500);
    const t2 = setTimeout(() => setPhase("done"), 2960);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "done") return null;
  const exiting = phase === "exit";

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
      {/* Vertical grid lines */}
      {[20, 40, 60, 80].map(p => (
        <div key={`v${p}`} style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${p}%`, width: 1,
          background: "rgba(201,168,76,0.07)",
        }} />
      ))}
      {/* Horizontal grid lines */}
      {[33, 67].map(p => (
        <div key={`h${p}`} style={{
          position: "absolute", left: 0, right: 0,
          top: `${p}%`, height: 1,
          background: "rgba(201,168,76,0.07)",
        }} />
      ))}

      {/* Corner bracket accents */}
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

      {/* Center content — moves to header logo position on exit */}
      <div style={{
        textAlign: "center",
        transition: "transform 0.46s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.46s ease",
        transform: exiting ? "translate(-43vw, -46vh) scale(0.22)" : "translate(0,0) scale(1)",
        opacity: exiting ? 0 : 1,
      }}>
        {/* Eyebrow */}
        <div className="loader-eyebrow">
          AI · Powered · Digital · Partner
        </div>

        {/* Two-layer logo: dim base + bright clip-reveal */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Dim base (provides layout size) */}
          <div className="loader-logo-base">
            Weldex<span style={{ color: "rgba(201,168,76,0.22)" }}>.</span>
          </div>
          {/* Bright layer: revealed left→right */}
          <div className="loader-logo-reveal" style={{ position: "absolute", top: 0, left: 0, whiteSpace: "nowrap" }}>
            Weldex<span style={{ color: "var(--gold)" }}>.</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          margin: "2rem auto 0",
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
