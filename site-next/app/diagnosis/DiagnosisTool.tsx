"use client";
import { useState, useRef } from "react";
import Link from "next/link";

// ─── 型定義 ────────────────────────────────────────────────────────
type Scores = { performance: number; seo: number; accessibility: number; bestPractices: number };
type Issue  = { id: string; title: string; value: string; severity: "critical" | "warning" };
type Result = { url: string; scores: Scores; issues: Issue[] };

// ─── スコアサークル ─────────────────────────────────────────────────
function ScoreCircle({ score, label }: { score: number; label: string }) {
  const color  = score >= 90 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const bg     = score >= 90 ? "#dcfce7" : score >= 50 ? "#fef3c7" : "#fee2e2";
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill={bg}  strokeWidth="0" />
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color}   strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 44 44)" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="44" y="49" textAnchor="middle" fontSize="18" fontWeight="900" fill={color}>
          {score}
        </text>
      </svg>
      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.3rem", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ─── スコアラベル ────────────────────────────────────────────────────
function grade(s: Scores) {
  const min = Math.min(s.performance, s.seo, s.accessibility, s.bestPractices);
  if (min >= 90) return { text: "優秀", color: "#16a34a", bg: "#dcfce7" };
  if (min >= 50) return { text: "改善が必要", color: "#d97706", bg: "#fef3c7" };
  return { text: "要対応", color: "#dc2626", bg: "#fee2e2" };
}

// ─── メインコンポーネント ──────────────────────────────────────────
export default function DiagnosisTool() {
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<Result | null>(null);
  const [error,   setError]   = useState("");
  const [dots,    setDots]    = useState(".");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const NAVY  = "#1a2540";
  const GOLD  = "#b8960c";
  const GRAY  = "#4b5563";
  const BORDER = "#f1f5f9";

  const startDots = () => {
    timerRef.current = setInterval(() => {
      setDots(d => d.length >= 3 ? "." : d + ".");
    }, 500);
  };
  const stopDots = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    startDots();

    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "診断に失敗しました");
      } else {
        setResult(data);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {
      setError("通信エラーが発生しました。しばらく待ってから再試行してください。");
    } finally {
      stopDots();
      setLoading(false);
    }
  };

  const g = result ? grade(result.scores) : null;
  const criticals = result?.issues.filter(i => i.severity === "critical").length ?? 0;
  const warnings  = result?.issues.filter(i => i.severity === "warning").length ?? 0;

  return (
    <main style={{ paddingTop: "4.5rem", overflow: "hidden" }}>

      {/* ─── ヒーロー ─── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #162645 100%)`,
        padding: "5rem clamp(1.5rem,5vw,6rem) 4rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* 背景装飾 */}
        <div aria-hidden="true" style={{
          position: "absolute", top: -80, right: -80,
          width: 360, height: 360, borderRadius: "50%",
          background: "rgba(201,168,76,0.06)",
        }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em",
            color: GOLD, textTransform: "uppercase", marginBottom: "1.25rem" }}>
            Free Diagnosis Tool
          </div>
          <h1 style={{ fontSize: "clamp(1.75rem,4.5vw,3rem)", fontWeight: 900,
            color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
            あなたのホームページ、<br />
            <span style={{ color: GOLD }}>今すぐ無料診断</span>
          </h1>
          <p style={{ fontSize: "clamp(0.875rem,1.5vw,1rem)", color: "rgba(255,255,255,0.65)",
            lineHeight: 1.8, marginBottom: "2.5rem" }}>
            URLを入力するだけ。表示速度・スマホ対応・SEO・セキュリティを<br />
            60秒で無料チェックします。
          </p>

          {/* 入力フォーム */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example-clinic.jp"
              disabled={loading}
              style={{
                flex: "1 1 320px", maxWidth: 440,
                padding: "0.9rem 1.25rem", fontSize: "0.9375rem",
                borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)", color: "#fff",
                outline: "none", fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              style={{
                padding: "0.9rem 2rem", background: loading ? "#555" : GOLD,
                color: loading ? "#ccc" : NAVY,
                fontSize: "0.9rem", fontWeight: 700, border: "none",
                borderRadius: 4, cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", fontFamily: "inherit",
                transition: "background 0.2s", whiteSpace: "nowrap",
              }}
            >
              {loading ? `診断中${dots}` : "無料診断する"}
            </button>
          </form>

          {error && (
            <p style={{ marginTop: "1rem", color: "#fca5a5", fontSize: "0.85rem" }}>{error}</p>
          )}

          {/* ローディングバー */}
          {loading && (
            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "0.6rem" }}>
                サイトを診断しています（通常15〜30秒かかります）
              </p>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden", maxWidth: 400, margin: "0 auto" }}>
                <div style={{
                  height: "100%", background: GOLD, borderRadius: 2,
                  animation: "diagProgress 25s linear forwards",
                }} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 診断結果 ─── */}
      {result && (
        <section ref={resultRef} style={{ background: "#f8fafc", padding: "4rem clamp(1.5rem,5vw,6rem)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            {/* 総合評価バナー */}
            <div style={{
              background: g!.bg, border: `1px solid ${g!.color}20`,
              borderRadius: 4, padding: "1.25rem 1.5rem",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "0.75rem", marginBottom: "2.5rem",
            }}>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em",
                  color: g!.color, textTransform: "uppercase" }}>診断結果</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: g!.color, marginTop: "0.15rem" }}>
                  総合評価: {g!.text}
                  {criticals > 0 && <span style={{ fontSize: "0.85rem", fontWeight: 400, marginLeft: "0.5rem" }}>
                    重大な問題 {criticals}件
                  </span>}
                </div>
                <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: "0.25rem" }}>
                  診断対象: {result.url}
                </div>
              </div>
              <Link href="/contact" style={{
                display: "inline-block", background: NAVY, color: "#fff",
                padding: "0.7rem 1.5rem", fontSize: "0.85rem", fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.04em", flexShrink: 0,
              }}>
                無料相談する →
              </Link>
            </div>

            {/* スコア4つ */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4,1fr)",
              gap: "1.5rem", marginBottom: "2.5rem",
              background: "#fff", border: `1px solid ${BORDER}`,
              padding: "2rem", borderRadius: 4,
            }}>
              <ScoreCircle score={result.scores.performance}   label="表示速度" />
              <ScoreCircle score={result.scores.seo}           label="SEO" />
              <ScoreCircle score={result.scores.accessibility} label="アクセシビリティ" />
              <ScoreCircle score={result.scores.bestPractices} label="ベストプラクティス" />
            </div>

            {/* スコア凡例 */}
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "2rem", fontSize: "0.72rem" }}>
              {[["#16a34a","90〜100：優秀"],["#d97706","50〜89：改善が必要"],["#dc2626","0〜49：要対応"]].map(([c,t]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: GRAY }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>

            {/* 課題リスト */}
            {result.issues.length > 0 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
                <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: NAVY, margin: 0 }}>
                    発見された課題
                  </h2>
                  <span style={{ fontSize: "0.75rem", color: GRAY }}>{result.issues.length}件</span>
                </div>
                {result.issues.map((issue, i) => (
                  <div key={issue.id} style={{
                    display: "flex", alignItems: "flex-start", gap: "0.75rem",
                    padding: "1rem 1.5rem", borderBottom: i < result.issues.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}>
                    <span style={{
                      display: "inline-block", flexShrink: 0,
                      padding: "0.15rem 0.5rem", borderRadius: 2,
                      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
                      background: issue.severity === "critical" ? "#fee2e2" : "#fef3c7",
                      color:      issue.severity === "critical" ? "#dc2626" : "#d97706",
                    }}>
                      {issue.severity === "critical" ? "重大" : "警告"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: NAVY }}>{issue.title}</div>
                      {issue.value && (
                        <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: "0.15rem" }}>{issue.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{
              background: NAVY, padding: "2.5rem", borderRadius: 4, textAlign: "center",
            }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em",
                color: GOLD, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Free Consultation
              </div>
              <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.75rem)", fontWeight: 900, color: "#fff",
                marginBottom: "0.75rem", lineHeight: 1.3 }}>
                課題をそのままにしていませんか？
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: "1.75rem" }}>
                Weldexは診断で見つかった課題を、大手の1/3以下のコストで解決します。<br />
                まずは無料でご相談ください。
              </p>
              <Link href="/contact" style={{
                display: "inline-block", background: GOLD, color: NAVY,
                padding: "0.9rem 2.5rem", fontSize: "0.9rem", fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.04em",
              }}>
                無料相談をする →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── SEOコンテンツ ─── */}
      <section style={{ background: "#fff", padding: "5rem clamp(1.5rem,5vw,6rem)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em",
            color: GOLD, textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Why it matters
          </div>
          <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 900, color: NAVY,
            marginBottom: "3rem", lineHeight: 1.3 }}>
            なぜ、ホームページの診断が重要なのか
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem" }}>
            {[
              {
                num: "7%",
                label: "表示が1秒遅れるごとにコンバージョン率が低下",
                desc: "患者・顧客が予約フォームを開く前に離脱します。スマホでは特に顕著です。",
              },
              {
                num: "70%",
                label: "スマートフォンからのアクセスが全体に占める割合",
                desc: "スマホ非対応のサイトはGoogleの検索順位が下がり、集客機会を失います。",
              },
              {
                num: "3倍",
                label: "検索1位と2位のクリック率の差",
                desc: "SEOスコアは検索順位に直結します。上位表示されなければ存在しないのと同じです。",
              },
            ].map(item => (
              <div key={item.num}>
                <div style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900,
                  color: NAVY, lineHeight: 1, marginBottom: "0.5rem" }}>{item.num}</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: NAVY,
                  marginBottom: "0.5rem", lineHeight: 1.4 }}>{item.label}</div>
                <p style={{ fontSize: "0.78rem", color: GRAY, lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── チェック内容 ─── */}
      <section style={{ background: "#f8fafc", padding: "5rem clamp(1.5rem,5vw,6rem)", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.75rem)", fontWeight: 900, color: NAVY,
            marginBottom: "2.5rem" }}>診断項目</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
            {[
              { label: "表示速度", desc: "FCP・LCP・TBT・CLSなどCore Web Vitalsを計測。遅い原因を特定します。" },
              { label: "スマートフォン対応", desc: "モバイルviewport設定・タップ領域・文字サイズなどを確認します。" },
              { label: "SEO最適化", desc: "メタタグ・見出し構造・リンク設定などGoogleに評価される要素をチェックします。" },
              { label: "セキュリティ", desc: "HTTPS対応・セキュリティヘッダーの設定状況を確認します。" },
            ].map(item => (
              <div key={item.label} style={{
                background: "#fff", border: `1px solid ${BORDER}`,
                padding: "1.25rem 1.5rem",
              }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY, marginBottom: "0.4rem" }}>
                  {item.label}
                </div>
                <p style={{ fontSize: "0.8rem", color: GRAY, lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ background: "#fff", padding: "5rem clamp(1.5rem,5vw,6rem)", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.75rem)", fontWeight: 900, color: NAVY,
            marginBottom: "2.5rem" }}>よくある質問</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { q: "本当に無料ですか？", a: "はい、完全無料です。クレジットカードの登録なども不要です。Googleが提供するPageSpeed Insights APIを使用しています。" },
              { q: "診断に時間がかかるのはなぜですか？", a: "Googleのサーバーが実際にサイトにアクセスして計測するため、通常15〜30秒かかります。" },
              { q: "診断結果はどう活用すればいいですか？", a: "スコアが50以下の項目は早急な対応が必要です。Weldexでは診断結果をもとに具体的な改善策と費用感をご提案します。" },
              { q: "どんなサイトでも診断できますか？", a: "公開されているWebサイトであれば診断可能です。ログインが必要なページや、特定のIPからのアクセスを制限しているサイトは診断できない場合があります。" },
            ].map((faq, i, arr) => (
              <div key={faq.q} style={{
                padding: "1.5rem 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
              }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY, marginBottom: "0.5rem" }}>
                  Q. {faq.q}
                </div>
                <p style={{ fontSize: "0.85rem", color: GRAY, lineHeight: 1.8, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 最終CTA ─── */}
      <section style={{ background: "#f8fafc", padding: "5rem clamp(1.5rem,5vw,6rem)", textAlign: "center", borderTop: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em",
          color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>Contact</p>
        <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 900, color: NAVY,
          marginBottom: "1rem", lineHeight: 1.3 }}>
          課題が見つかったら、Weldexへ。
        </h2>
        <p style={{ fontSize: "0.9rem", color: GRAY, lineHeight: 1.85, marginBottom: "2rem" }}>
          診断結果をそのままお持ちください。<br />
          費用・納期・改善策を無料でご提案します。
        </p>
        <Link href="/contact" style={{
          display: "inline-block", background: NAVY, color: "#fff",
          padding: "0.95rem 2.5rem", fontSize: "0.9rem", fontWeight: 700,
          textDecoration: "none", letterSpacing: "0.04em",
        }}>
          無料相談をする
        </Link>
      </section>

      <style>{`
        @keyframes diagProgress {
          0%   { width: 0%; }
          80%  { width: 85%; }
          100% { width: 90%; }
        }
        input::placeholder { color: rgba(255,255,255,0.35); }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
