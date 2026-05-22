"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const pains = [
  {
    emoji: "👨‍⚕️",
    role: "歯科医院長",
    bubble: "ホームページを作ったはいいけど、集客できている気がしない。。",
    color: "#3b82f6",
  },
  {
    emoji: "💆‍♀️",
    role: "サロンオーナー",
    bubble: "診療中も電話が鳴り続けて、集中できない日が続いている。。",
    color: "#8b5cf6",
  },
  {
    emoji: "👷",
    role: "建設会社 社長",
    bubble: "システム会社に相談したら金額が高すぎて、諦めてしまった。。",
    color: "#f59e0b",
  },
];

// タイミング（ms）
const TIMINGS = [
  { typing: 400,  msg: 1600 },
  { typing: 400,  msg: 1800 },
  { typing: 400,  msg: 1800 },
];

export default function PainPoints() {
  const [shown, setShown]     = useState<number[]>([]);
  const [typing, setTyping]   = useState<number | null>(null);
  const [replied, setReplied] = useState(false);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    setShown([]);
    setTyping(null);
    setReplied(false);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;

    let cumulative = 0;
    const ids: ReturnType<typeof setTimeout>[] = [];

    pains.forEach((_, i) => {
      const { typing: tDelay, msg: mDelay } = TIMINGS[i];

      // タイピング表示
      cumulative += tDelay;
      const t1 = setTimeout(() => setTyping(i), cumulative);

      // メッセージ表示
      cumulative += mDelay;
      const t2 = setTimeout(() => {
        setShown((prev) => [...prev, i]);
        setTyping(null);
      }, cumulative);

      ids.push(t1, t2);
    });

    // Weldex 返信
    cumulative += 600;
    const t3 = setTimeout(() => {
      setReplied(true);
      setPlaying(false);
    }, cumulative);
    ids.push(t3);

    return () => ids.forEach(clearTimeout);
  }, [playing]);

  // 初回自動再生
  useEffect(() => { play(); }, [play]);

  const allShown = shown.length === pains.length;

  return (
    <section style={{ background: "#f0f4f8", padding: "5rem clamp(1.5rem,5vw,3rem)" }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        {/* セクションヘッダー */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em",
            color: "#c9a84c", marginBottom: "0.75rem",
          }}>
            CHALLENGE
          </div>
          <h2 style={{
            fontFamily: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif",
            fontWeight: 900, fontSize: "clamp(1.4rem,4vw,1.75rem)",
            color: "#0c1a35", lineHeight: 1.4, letterSpacing: "-0.01em",
          }}>
            こんなお悩み、<br />ありませんか？
          </h2>
        </div>

        {/* LINEチャット枠 */}
        <div style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(12,26,53,0.13)",
        }}>
          {/* ヘッダー */}
          <div style={{
            background: "#0c1a35",
            padding: "0.85rem 1rem",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(201,168,76,0.18)",
              border: "2px solid #c9a84c",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.15rem", flexShrink: 0,
            }}>
              W
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
                Weldex 相談窓口
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>オンライン</span>
              </div>
            </div>
          </div>

          {/* チャットエリア */}
          <div style={{
            background: "#e8f0f8",
            padding: "1.25rem 0.875rem",
            minHeight: 260,
            display: "flex", flexDirection: "column", gap: "1rem",
          }}>
            {/* 日付ラベル */}
            <div style={{ textAlign: "center" }}>
              <span style={{
                fontSize: "0.68rem", color: "#94a3b8",
                background: "rgba(255,255,255,0.55)",
                padding: "0.2rem 0.75rem", borderRadius: 99,
              }}>
                今日
              </span>
            </div>

            {/* メッセージ */}
            {pains.map((p, i) => (
              <div key={i}>
                {/* 表示済みメッセージ */}
                {shown.includes(i) && (
                  <div style={{
                    display: "flex", alignItems: "flex-end", gap: "0.5rem",
                    animation: "msgIn 0.3s ease forwards",
                  }}>
                    {/* アバター */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: p.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", flexShrink: 0,
                    }}>
                      {p.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: 500 }}>
                        {p.role}
                      </div>
                      <div style={{
                        background: "#fff",
                        borderRadius: "0 12px 12px 12px",
                        padding: "0.65rem 0.875rem",
                        fontSize: "0.82rem", color: "#0c1a35",
                        lineHeight: 1.65, fontWeight: 400,
                        maxWidth: 260,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}>
                        {p.bubble}
                      </div>
                    </div>
                  </div>
                )}

                {/* タイピングインジケーター */}
                {typing === i && !shown.includes(i) && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: p.color, opacity: 0.6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", flexShrink: 0,
                    }}>
                      {p.emoji}
                    </div>
                    <div style={{
                      background: "#fff",
                      borderRadius: "0 12px 12px 12px",
                      padding: "0.65rem 0.875rem",
                      display: "flex", gap: 5, alignItems: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: "#94a3b8", display: "inline-block",
                          animation: `dot 0.6s ease ${d * 0.15}s infinite alternate`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Weldex 返信 */}
            {replied && (
              <div style={{
                display: "flex", justifyContent: "flex-end",
                animation: "msgIn 0.35s ease forwards",
              }}>
                <div style={{
                  background: "#0c1a35",
                  borderRadius: "12px 0 12px 12px",
                  padding: "0.7rem 1rem",
                  fontSize: "0.82rem", color: "#fff",
                  lineHeight: 1.7, fontWeight: 500,
                  maxWidth: 260,
                  boxShadow: "0 2px 8px rgba(12,26,53,0.18)",
                }}>
                  全て、Weldexが解決できます。<br />
                  お気軽にご相談ください。
                </div>
              </div>
            )}
          </div>

          {/* 入力バー */}
          <div style={{
            background: "#fff",
            padding: "0.75rem 0.875rem",
            display: "flex", alignItems: "center", gap: "0.625rem",
            borderTop: "1px solid #e2e8f0",
          }}>
            <div style={{
              flex: 1, background: "#f1f5f9", borderRadius: 20,
              padding: "0.5rem 0.875rem",
              fontSize: "0.78rem", color: "#cbd5e1",
              userSelect: "none",
            }}>
              メッセージを入力...
            </div>
            <button
              onClick={play}
              aria-label={allShown && replied ? "リセット・再生" : "再生"}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "#0c1a35", color: "#fff",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", flexShrink: 0,
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {allShown && replied ? "↺" : "▶"}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/contact" style={{
            display: "inline-block",
            background: "#0c1a35", color: "#fff",
            fontSize: "0.875rem", fontWeight: 600,
            padding: "0.85rem 2.25rem",
            textDecoration: "none", letterSpacing: "0.04em",
          }}>
            無料相談をする
          </Link>
        </div>

      </div>
    </section>
  );
}
