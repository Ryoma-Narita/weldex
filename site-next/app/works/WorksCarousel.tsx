"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Demo = {
  category: string;
  title: string;
  desc: string;
  demoUrl: string | null;
  tag: "DEMO" | "準備中";
  iframeUrl?: string;
};

const demos: Demo[] = [
  {
    category: "WEB予約システム",
    title: "予約フォーム デモ",
    desc: "日付・時間・メニュー選択から確認画面まで、患者・顧客の目線で設計した予約フォームです。実際に操作してお試しください。",
    demoUrl: "https://weldex.jp/booking/",
    iframeUrl: "https://weldex.jp/booking/",
    tag: "DEMO",
  },
  {
    category: "管理画面",
    title: "予約管理ダッシュボード デモ",
    desc: "予約一覧・顧客管理・統計ダッシュボード・CSV出力など、クリニック・サロンの管理業務をまとめて効率化します。",
    demoUrl: "https://weldex.jp/admin/",
    iframeUrl: "https://weldex.jp/admin/",
    tag: "DEMO",
  },
  {
    category: "LINE予約システム",
    title: "LINE予約ボット デモ",
    desc: "LINEのトーク画面から日付・時間・メニューを選んで予約が完了します。前日リマインド・キャンセル対応も自動化。",
    demoUrl: null,
    tag: "準備中",
  },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function WorksCarousel() {
  const [[index, dir], setSlide] = useState([0, 0]);

  const go = (next: number) => {
    const d = next > index ? 1 : -1;
    setSlide([next, d]);
  };
  const prev = () => go((index - 1 + demos.length) % demos.length);
  const next = () => go((index + 1) % demos.length);

  const demo = demos[index];

  return (
    <div style={{ width: "100%" }}>
      {/* ──── カルーセル本体 ──── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            style={{ width: "100%" }}
          >
            {/* ブラウザ枠モックアップ */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(12,26,53,0.12)",
              background: "var(--navy)",
            }}>
              {/* ブラウザ Chrome */}
              <div style={{
                background: "#1a2a45",
                padding: "0.6rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />
                  ))}
                </div>
                <div style={{
                  flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 4,
                  padding: "0.2rem 0.75rem", fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)", fontFamily: "monospace",
                }}>
                  {demo.iframeUrl ?? "— 準備中 —"}
                </div>
                <span style={{
                  fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em",
                  color: demo.tag === "DEMO" ? "var(--gold)" : "rgba(255,255,255,0.3)",
                  border: `1px solid ${demo.tag === "DEMO" ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
                  padding: "0.15rem 0.5rem",
                }}>
                  {demo.tag}
                </span>
              </div>

              {/* iframe / placeholder */}
              <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#f0f2f5" }}>
                {demo.iframeUrl ? (
                  <iframe
                    src={demo.iframeUrl}
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    title={demo.title}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "var(--off)", gap: "1rem",
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--light)" strokeWidth="1.2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span style={{ fontSize: "0.85rem", color: "var(--light)", fontWeight: 300 }}>近日公開予定</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 矢印ナビ */}
        {[{ fn: prev, label: "←", side: "left" }, { fn: next, label: "→", side: "right" }].map(({ fn, label, side }) => (
          <button
            key={side}
            onClick={fn}
            aria-label={side === "left" ? "前へ" : "次へ"}
            style={{
              position: "absolute", top: "50%",
              [side]: -20,
              transform: "translateY(-50%)",
              width: 44, height: 44,
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem", color: "var(--navy)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              zIndex: 10,
              transition: "background 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ドットインジケーター */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
        {demos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`スライド ${i + 1}`}
            style={{
              width: i === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === index ? "var(--gold)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.25s ease",
            }}
          />
        ))}
      </div>

      {/* カード情報 + ボタン */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: "2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--blue)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {demo.category}
          </div>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 700, color: "var(--navy)",
            lineHeight: 1.3,
          }}>
            {demo.title}
          </h2>
          <p style={{
            fontSize: "0.875rem", color: "var(--gray)", fontWeight: 300,
            lineHeight: 1.8, maxWidth: 520,
          }}>
            {demo.desc}
          </p>
          <div style={{ marginTop: "0.5rem" }}>
            {demo.demoUrl ? (
              <a
                href={demo.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: "0.85rem" }}
              >
                デモを見る →
              </a>
            ) : (
              <span style={{
                display: "inline-block", fontSize: "0.82rem",
                color: "var(--light)", border: "1px solid var(--border)",
                padding: "0.6rem 1.5rem",
              }}>
                近日公開予定
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
