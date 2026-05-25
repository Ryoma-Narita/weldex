'use client'

import { useEffect, useRef, useState } from 'react'

// ─── 既存の6ステップ ─────────────────────────────────────────────────────────
const steps = [
  { num: "01", title: "無料相談",             desc: "現状・課題・ご要望をヒアリング。費用・納期の目安をご提示します。",                                                     days: "Day 1" },
  { num: "02", title: "ご提案・お見積もり",     desc: "ヒアリング内容をもとに提案書と見積書を作成。ご確認いただきます。",                                                     days: "Day 2〜5" },
  { num: "03", title: "契約・着手",            desc: "契約締結後、着手金50%のご入金確認で制作を開始します。",                                                             days: "Week 1" },
  { num: "04", title: "デザイン・制作",         desc: "デザイン確認→コーディング→テストの順で進めます。中間報告でフィードバックをします。",                                       days: "Week 2" },
  { num: "05", title: "初稿・FB期間",          desc: "初稿が出来上がりお客様のフィードバック期間とします。ご要望に合わせた修正をいたします。",                                     days: "Week 3〜4" },
  { num: "06", title: "公開・引き渡し",         desc: "最終確認後に公開。残金50%のご請求と同時に1ヶ月間の無料サポートが始まります。",                                           days: "Week 4〜" },
]

// ─── デスクトップ：波形ノード座標 ─────────────────────────────────────────────
// viewBox="0 0 1200 440"
// top y=160, bottom y=300
const D = {
  vw: 1200, vh: 440,
  nodes: [
    { x: 100,  y: 160 }, // 01 top
    { x: 300,  y: 300 }, // 02 bottom
    { x: 500,  y: 160 }, // 03 top
    { x: 700,  y: 300 }, // 04 bottom
    { x: 900,  y: 160 }, // 05 top
    { x: 1100, y: 300 }, // 06 bottom
  ] as const,
  r: 22,
}

// ─── モバイル：縦型ノード座標 ─────────────────────────────────────────────────
// viewBox="0 0 340 1020"
// 左 x=38, 右 x=302, y step=170（左右を最大限に広げる）
const M = {
  vw: 300, vh: 1020,
  nodes: [
    { x: 70,  y: 80  }, // 01 left
    { x: 230, y: 250 }, // 02 right
    { x: 70,  y: 420 }, // 03 left
    { x: 230, y: 590 }, // 04 right
    { x: 70,  y: 760 }, // 05 left
    { x: 230, y: 930 }, // 06 right
  ] as const,
  r: 20,
}

// ─── SVGパス生成（Cubic Bezier 波形） ─────────────────────────────────────────
function wavePath(nodes: readonly { x: number; y: number }[]) {
  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 0; i < nodes.length - 1; i++) {
    const cx = (nodes[i].x + nodes[i + 1].x) / 2
    d += ` C ${cx} ${nodes[i].y}, ${cx} ${nodes[i + 1].y}, ${nodes[i + 1].x} ${nodes[i + 1].y}`
  }
  return d
}

const D_PATH = wavePath(D.nodes)
const M_PATH = wavePath(M.nodes)

// ─── メインコンポーネント ─────────────────────────────────────────────────────
export default function Process() {
  const sectionRef  = useRef<HTMLElement>(null)
  const dPathRef    = useRef<SVGPathElement>(null)
  const mPathRef    = useRef<SVGPathElement>(null)
  const [dLen, setDLen] = useState(2400)
  const [mLen, setMLen] = useState(1800)
  const [progress, setProgress] = useState(0)
  const [started,  setStarted]  = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 実際のパス長を取得
  useEffect(() => {
    if (dPathRef.current) setDLen(dPathRef.current.getTotalLength())
    if (mPathRef.current) setMLen(mPathRef.current.getTotalLength())
  }, [])

  // IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  // アニメーションループ
  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timerRef.current!); return 100 }
        return Math.min(p + 0.8, 100)
      })
    }, 16)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started])

  const dOffset = dLen * (1 - progress / 100)
  const mOffset = mLen * (1 - progress / 100)

  const isActive = (i: number) => progress >= (i / (steps.length - 1)) * 100
  const isCurrent = (i: number) => {
    const idx = steps.findIndex((_, j) => progress < (j / (steps.length - 1)) * 100)
    return (idx === -1 ? steps.length - 1 : idx) === i
  }

  return (
    <section
      ref={sectionRef}
      style={{ padding: "5rem clamp(1.5rem,5vw,6rem)", background: "var(--white,#fff)", overflowX: 'hidden' }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ─── ヘッダー ─── */}
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 3rem" }}>
          <div className="sec-label" style={{ justifyContent: "center" }}>Process</div>
          <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 700, color: "var(--navy)", lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
            制作の流れ
          </h2>
          <p className="sec-desc" style={{ margin: "0 auto" }}>
            お問い合わせから公開まで、最短4週間で対応します。
          </p>
        </div>

        {/* ════ デスクトップ SVG (md以上) ════ */}
        <div className="proc-desktop">
          <svg
            viewBox={`0 0 ${D.vw} ${D.vh}`}
            style={{ width: '100%', display: 'block', overflow: 'visible' }}
            aria-label="制作の流れ 6ステップ"
          >
            <defs>
              <filter id="proc-glow-d">
                <feGaussianBlur stdDeviation="5" result="blur" />
              </filter>
            </defs>

            {/* グローライン */}
            <path d={D_PATH} fill="none" stroke="var(--gold)" strokeWidth={8}
              opacity={0.12} filter="url(#proc-glow-d)"
              strokeDasharray={dLen} strokeDashoffset={dOffset} />

            {/* メインライン */}
            <path ref={dPathRef} d={D_PATH} fill="none"
              stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round"
              strokeDasharray={dLen} strokeDashoffset={dOffset} />

            {/* 背景ライン */}
            <path d={D_PATH} fill="none" stroke="var(--border,#e2e8f0)"
              strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />

            {/* ノード群 */}
            {D.nodes.map((node, i) => {
              const active  = isActive(i)
              const current = isCurrent(i)
              const isTop   = i % 2 === 0  // 奇数インデックス=偶数ステップ=bottom

              return (
                <g key={i}>
                  {/* ripple */}
                  {current && (
                    <circle cx={node.x} cy={node.y} r={D.r + 8}
                      fill="none" stroke="var(--gold)" strokeWidth={1} opacity={0}
                      style={{ animation: 'proc-ripple 1.5s ease-out infinite', transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  {/* ノード円 */}
                  <circle cx={node.x} cy={node.y} r={D.r}
                    fill={active ? 'var(--gold)' : 'var(--white,#fff)'}
                    stroke={active ? 'var(--gold)' : 'var(--border,#e2e8f0)'}
                    strokeWidth={1.5}
                    style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                  />

                  {/* 番号 */}
                  <text x={node.x} y={node.y + 5} textAnchor="middle"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 13, fontWeight: 700,
                      fill: active ? '#fff' : 'var(--navy)', transition: 'fill 0.4s ease' }}>
                    {steps[i].num}
                  </text>

                  {/* days */}
                  <text x={node.x} y={isTop ? node.y - 46 : node.y + 52} textAnchor="middle"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 10, fontWeight: 600,
                      fill: active ? 'var(--gold)' : 'rgba(12,26,53,0.3)', letterSpacing: '0.05em',
                      transition: 'fill 0.4s ease' }}>
                    {steps[i].days}
                  </text>

                  {/* title */}
                  <text x={node.x} y={isTop ? node.y - 30 : node.y + 36} textAnchor="middle"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 13, fontWeight: 700,
                      fill: active ? 'var(--navy)' : 'rgba(12,26,53,0.35)',
                      transition: 'fill 0.4s ease' }}>
                    {steps[i].title}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* 説明文グリッド */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0 1rem',
            marginTop: '1.5rem',
            padding: '0 0.5rem',
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color: 'var(--gray)',
                lineHeight: 1.7,
                fontWeight: 300,
                opacity: isActive(i) ? 1 : 0.3,
                transition: 'opacity 0.5s ease',
              }}>
                {s.desc}
              </div>
            ))}
          </div>
        </div>

        {/* ════ モバイル SVG (sm以下) ════ */}
        <div className="proc-mobile">
          <svg
            viewBox={`0 0 ${M.vw} ${M.vh}`}
            style={{ width: '100%', maxWidth: 340, display: 'block', margin: '0 auto', overflow: 'visible' }}
            aria-label="制作の流れ 6ステップ"
          >
            <defs>
              <filter id="proc-glow-m">
                <feGaussianBlur stdDeviation="4" result="blur" />
              </filter>
            </defs>

            {/* グローライン */}
            <path d={M_PATH} fill="none" stroke="var(--gold)" strokeWidth={6}
              opacity={0.12} filter="url(#proc-glow-m)"
              strokeDasharray={mLen} strokeDashoffset={mOffset} />

            {/* メインライン */}
            <path ref={mPathRef} d={M_PATH} fill="none"
              stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round"
              strokeDasharray={mLen} strokeDashoffset={mOffset} />

            {/* 背景ライン */}
            <path d={M_PATH} fill="none" stroke="var(--border,#e2e8f0)"
              strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />

            {/* ノード群 */}
            {M.nodes.map((node, i) => {
              const active  = isActive(i)
              const current = isCurrent(i)
              const isLeft  = i % 2 === 0

              return (
                <g key={i}>
                  {current && (
                    <circle cx={node.x} cy={node.y} r={M.r + 6}
                      fill="none" stroke="var(--gold)" strokeWidth={1} opacity={0}
                      style={{ animation: 'proc-ripple 1.5s ease-out infinite', transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  <circle cx={node.x} cy={node.y} r={M.r}
                    fill={active ? 'var(--gold)' : 'var(--white,#fff)'}
                    stroke={active ? 'var(--gold)' : 'var(--border,#e2e8f0)'}
                    strokeWidth={1.5}
                    style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                  />

                  {/* 番号 */}
                  <text x={node.x} y={node.y + 5} textAnchor="middle"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 11, fontWeight: 700,
                      fill: active ? '#fff' : 'var(--navy)', transition: 'fill 0.4s ease' }}>
                    {steps[i].num}
                  </text>

                  {/* days＋title：ノードから離してテキストが数字に被らないよう配置 */}
                  <text
                    x={isLeft ? node.x + M.r + 55 : node.x - M.r - 55}
                    y={node.y - 4}
                    textAnchor={isLeft ? 'start' : 'end'}
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 8,
                      fill: active ? 'var(--gold)' : 'rgba(12,26,53,0.25)', letterSpacing: '0.04em',
                      transition: 'fill 0.4s ease' }}>
                    {steps[i].days}
                  </text>
                  <text
                    x={isLeft ? node.x + M.r + 55 : node.x - M.r - 55}
                    y={node.y + 11}
                    textAnchor={isLeft ? 'start' : 'end'}
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 11, fontWeight: 700,
                      fill: active ? 'var(--navy)' : 'rgba(12,26,53,0.35)', transition: 'fill 0.4s ease' }}>
                    {steps[i].title}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* ─── CSS ─── */}
      <style>{`
        .proc-desktop { display: block; }
        .proc-mobile  { display: none; }

        @media (max-width: 640px) {
          .proc-desktop { display: none; }
          .proc-mobile  { display: block; }
        }

        @keyframes proc-ripple {
          0%   { r: 26; opacity: 0.6; }
          100% { r: 44; opacity: 0; }
        }
        @keyframes proc-pulse {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
