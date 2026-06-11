"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * 予約取りこぼし損失シミュレーター（ROI電卓）
 *
 * 「1日の電話件数 × 取りこぼし率 × 客単価」から月間・年間の機会損失と
 * 導入費の回収目安を試算する。/services/reservation に埋め込んで使う。
 * 数値は損失回避フレーミングで価格（¥200,000）を正当化するための概算。
 */

const MISS_RATES = [
  { label: "1割", value: 0.1 },
  { label: "2割", value: 0.2 },
  { label: "3割", value: 0.3 },
];

const WORKING_DAYS = 26; // 月あたり診療日数の目安
const SYSTEM_COST = 200000; // WEB予約システム導入費

const fmt = (n: number) => Math.round(n).toLocaleString("ja-JP");

export default function RoiCalculator() {
  const [dailyCalls, setDailyCalls] = useState(10);
  const [missRate, setMissRate] = useState(0.2);
  const [unitPrice, setUnitPrice] = useState(6000);

  const monthlyMissed = dailyCalls * missRate * WORKING_DAYS;
  const monthlyLoss = monthlyMissed * unitPrice;
  const yearlyLoss = monthlyLoss * 12;
  const paybackDays = monthlyLoss > 0 ? Math.ceil((SYSTEM_COST / monthlyLoss) * 30) : 0;

  const inputBox: React.CSSProperties = {
    border: "1px solid var(--border)",
    padding: "0.6rem 0.9rem",
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--navy)",
    width: 110,
    textAlign: "right",
    background: "#fff",
  };

  const label: React.CSSProperties = {
    fontSize: "0.8rem",
    color: "var(--gray)",
    letterSpacing: "0.02em",
    marginBottom: "0.5rem",
    display: "block",
  };

  return (
    <section style={{ background: "var(--navy)", padding: "6rem clamp(1.5rem,5vw,5rem)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div className="sec-label" style={{ color: "var(--gold)" }}>Simulation</div>
        <h2 style={{
          fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: "#fff",
          lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "0.75rem",
        }}>
          電話だけの予約で、いくら逃していますか？
        </h2>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", marginBottom: "2.5rem", lineHeight: 2 }}>
          話し中・診療時間外・昼休みに掛かってきた電話は、そのまま他院に流れます。3つの数字で概算できます。
        </p>

        <div style={{ background: "#fff", padding: "clamp(1.5rem,4vw,2.75rem)" }}>
          {/* 入力 */}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <div>
              <span style={label}>1日の予約電話の件数</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="number" min={1} max={200} value={dailyCalls}
                  onChange={(e) => setDailyCalls(Math.max(0, Number(e.target.value)))}
                  style={inputBox}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--gray)" }}>件</span>
              </div>
            </div>

            <div>
              <span style={label}>取れていない割合（話し中・時間外）</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {MISS_RATES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setMissRate(r.value)}
                    style={{
                      padding: "0.6rem 1.2rem",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: missRate === r.value ? "1px solid var(--navy)" : "1px solid var(--border)",
                      background: missRate === r.value ? "var(--navy)" : "#fff",
                      color: missRate === r.value ? "#fff" : "var(--gray)",
                      transition: "all 0.15s",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={label}>平均客単価</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--gray)" }}>¥</span>
                <input
                  type="number" min={0} step={500} value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                  style={inputBox}
                />
              </div>
            </div>
          </div>

          {/* 結果 */}
          <div style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "2rem",
            display: "flex",
            gap: "clamp(1.5rem,4vw,3.5rem)",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray)", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                月間の取りこぼし（推定）
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--navy)" }}>
                約{fmt(monthlyMissed)}件
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray)", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                月間の機会損失（推定）
              </div>
              <div style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700,
                color: "var(--navy)", lineHeight: 1,
                borderBottom: "2px solid var(--gold)", paddingBottom: 4,
              }}>
                ¥{fmt(monthlyLoss)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray)", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
                年間では
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#b91c1c" }}>
                ¥{fmt(yearlyLoss)}
              </div>
            </div>
          </div>

          {/* 回収目安 */}
          {monthlyLoss > 0 && (
            <div style={{
              marginTop: "1.75rem",
              padding: "1rem 1.5rem",
              background: "#f8f9fc",
              borderLeft: "3px solid var(--gold)",
              fontSize: "0.9rem",
              color: "var(--navy)",
              lineHeight: 1.9,
            }}>
              この場合、WEB予約システムの導入費 ¥{fmt(SYSTEM_COST)} は
              <strong style={{ fontWeight: 700 }}>
                約{paybackDays <= 60 ? `${paybackDays}日` : `${Math.ceil(paybackDays / 30)}ヶ月`}
              </strong>
              で回収できる計算です。
            </div>
          )}

          <p style={{ fontSize: "0.72rem", color: "var(--light)", marginTop: "1.25rem", lineHeight: 1.8 }}>
            ※ 月{WORKING_DAYS}診療日・取りこぼし分がすべて来院につながった場合の概算です。実際の数値を保証するものではありません。
          </p>

          <div style={{ marginTop: "1.75rem" }}>
            <Link href="/contact" className="btn btn-primary">
              この結果について相談する
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
