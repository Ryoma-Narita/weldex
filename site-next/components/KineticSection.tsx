'use client'

import { useEffect, useRef, useState } from 'react'

// ─── 3ステージのコンテンツ ───────────────────────────────────────────────────

const STAGES = [
  {
    words: ['Connecting', 'for Value', 'Creation.'],
    style: 'headline',   // 大見出し
  },
  {
    words: ['Weldexは顧客と企業・', 'システムとマーケティング、', '全てを一体化させ引き出します。'],
    style: 'body',       // 本文サイズ
  },
  {
    words: ['Weld（溶接する・固固につなぐ）+ dex（体系化）', '制作・システム・LINE・保守まで、', '一社で完結。'],
    style: 'small',      // 小サイズ
  },
] as const

// ─── 1ブロック ───────────────────────────────────────────────────────────────

function Stage({ stage, index }: { stage: typeof STAGES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const isHeadline = stage.style === 'headline'
  const isSmall    = stage.style === 'small'

  const fontSize = isHeadline
    ? 'clamp(2.8rem, 8vw, 9rem)'
    : isSmall
    ? 'clamp(1.1rem, 2.2vw, 2rem)'
    : 'clamp(1.4rem, 3vw, 3rem)'

  const fontStyle  = isHeadline ? 'italic' : 'normal'
  const fontWeight = isHeadline ? 900 : 700
  const lineHeight = isHeadline ? 1.0 : 1.35

  return (
    <div
      ref={ref}
      style={{
        minHeight: '110vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 clamp(1.5rem, 6vw, 7rem)',
        position: 'relative',
        borderBottom: index < STAGES.length - 1
          ? '1px solid rgba(12,26,53,0.06)'
          : 'none',
      }}
    >
      {/* ステージ番号（透かし） */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 'clamp(1rem, 4vw, 5rem)',
          bottom: '-0.05em',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 900,
          fontSize: 'clamp(10rem, 28vw, 28rem)',
          color: 'rgba(12,26,53,0.03)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* 下部アクセントライン（中央） */}
      <div style={{
        width: visible ? 40 : 0,
        height: 1,
        background: 'var(--gold)',
        opacity: 0.6,
        marginTop: '2.5rem',
        transition: `width 0.6s cubic-bezier(0.16,1,0.3,1) ${stage.words.length * 160 + 100}ms`,
      }} />

      {/* テキスト群 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isHeadline ? '0.15em' : '0.4em' }}>
        {stage.words.map((word, wi) => {
          const delay = wi * 160
          return (
            <div
              key={wi}
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight,
                fontStyle,
                fontSize,
                lineHeight,
                letterSpacing: isHeadline ? '0.01em' : '0.02em',
                color: 'var(--navy)',
                opacity: visible ? 1 : 0,
                transform: visible
                  ? 'translateY(0) scale(1)'
                  : 'translateY(0.4em) scale(0.94)',
                transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                             transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                willChange: 'opacity, transform',
              }}
            >
              {word}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export default function KineticSection() {
  return (
    <section style={{ background: '#f8f5f0', overflow: 'hidden' }}>
      {STAGES.map((stage, i) => (
        <Stage key={i} stage={stage} index={i} />
      ))}
    </section>
  )
}
