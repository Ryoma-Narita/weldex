'use client'

import { useEffect, useRef, useState } from 'react'

// ─── 浮遊アイコン ─────────────────────────────────────────────────────────────

const MonitorIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
const LightningIcon= () => <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
const ChatIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
const ChartIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
const LinkIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
const MobileIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>

const FLOAT_ICONS = [
  { id: 'tl', Icon: MonitorIcon,   gradient: 'linear-gradient(135deg,#667eea,#764ba2)', left: '4vw',  top: '10vh',    delay: '0s',   dur: '6s',  hide: false },
  { id: 'tr', Icon: LightningIcon, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', right: '4vw', top: '10vh',    delay: '1s',   dur: '5s',  hide: false },
  { id: 'ml', Icon: ChatIcon,      gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', left: '2vw',  top: '44vh',    delay: '2s',   dur: '7s',  hide: true  },
  { id: 'mr', Icon: ChartIcon,     gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', right: '2vw', top: '44vh',    delay: '0.5s', dur: '8s',  hide: true  },
  { id: 'bl', Icon: LinkIcon,      gradient: 'linear-gradient(135deg,#fa709a,#fee140)', left: '4vw',  bottom: '12vh', delay: '1.5s', dur: '6s',  hide: false },
  { id: 'br', Icon: MobileIcon,    gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', right: '4vw', bottom: '12vh', delay: '2.5s', dur: '7s',  hide: false },
] as const

// ─── ステージコンテンツ ───────────────────────────────────────────────────────

const STAGES = [
  {
    words: ['Connecting', 'for Value', 'Creation.'],
    style: 'headline' as const,
  },
  {
    words: ['Weldexは顧客と企業・', 'システムとマーケティング、', '全てを一体化させ引き出します。'],
    style: 'body' as const,
  },
  {
    words: ['Weld（溶接する・固固につなぐ）+ dex（体系化）', '制作・システム・LINE・保守まで、', '一社で完結。'],
    style: 'small' as const,
  },
]

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export default function KineticSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [stageIndex, setStageIndex] = useState(0)
  const [inView, setInView]         = useState(false)
  const prevIndex = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect      = el.getBoundingClientRect()
      const scrolled  = -rect.top                              // セクション先頭からのスクロール量
      const scrollMax = el.offsetHeight - window.innerHeight   // スクロール可能な最大値

      if (scrolled < 0 || scrolled > scrollMax) {
        setInView(false)
        return
      }
      setInView(true)

      // 0〜1 のスクロール進捗で 0/1/2 のステージを切り替え
      const progress = scrolled / scrollMax
      const idx = Math.min(Math.floor(progress * STAGES.length), STAGES.length - 1)
      if (idx !== prevIndex.current) {
        prevIndex.current = idx
        setStageIndex(idx)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* ─ スクロール領域（300vh） ─ */}
      <section ref={sectionRef} style={{ height: '300vh', position: 'relative' }}>

        {/* ─ sticky ビューポート ─ */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: '#f8f5f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>

          {/* ステージ番号（透かし） */}
          <span aria-hidden="true" style={{
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
            transition: 'opacity 0.4s ease',
          }}>
            {String(stageIndex + 1).padStart(2, '0')}
          </span>

          {/* ─ 各ステージ（絶対配置でスライド切り替え） ─ */}
          {STAGES.map((stage, i) => {
            const isActive   = stageIndex === i
            const isPrev     = stageIndex > i
            const isHeadline = stage.style === 'headline'
            const isSmall    = stage.style === 'small'

            const fontSize = isHeadline
              ? 'clamp(2.8rem, 8vw, 9rem)'
              : isSmall
              ? 'clamp(1.1rem, 2.2vw, 2rem)'
              : 'clamp(1.4rem, 3vw, 3rem)'

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 clamp(1.5rem, 6vw, 7rem)',
                  // スライドアップで入ってくる / スライドアップで出ていく
                  opacity:   isActive ? 1 : 0,
                  transform: isActive
                    ? 'translateY(0) scale(1)'
                    : isPrev
                    ? 'translateY(-6%) scale(0.97)'   // 上に消えていく
                    : 'translateY(6%) scale(0.97)',    // 下から来る（待機）
                  transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
                  pointerEvents: isActive ? 'auto' : 'none',
                  zIndex: isActive ? 1 : 0,
                }}
              >
                {/* テキスト群 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isHeadline ? '0.12em' : '0.35em' }}>
                  {stage.words.map((word, wi) => (
                    <div
                      key={wi}
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontWeight: isHeadline ? 900 : 700,
                        fontStyle:  isHeadline ? 'italic' : 'normal',
                        fontSize,
                        lineHeight: isHeadline ? 1.0 : 1.35,
                        letterSpacing: isHeadline ? '0.01em' : '0.02em',
                        color: 'var(--navy)',
                      }}
                    >
                      {word}
                    </div>
                  ))}
                </div>

                {/* 下部ゴールドライン */}
                <div style={{
                  width: isActive ? 40 : 0,
                  height: 1,
                  background: 'var(--gold)',
                  opacity: 0.6,
                  marginTop: '2.5rem',
                  transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s',
                }} />
              </div>
            )
          })}

          {/* スクロールドット（進捗表示） */}
          <div style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 2,
          }}>
            {STAGES.map((_, i) => (
              <div key={i} style={{
                width: stageIndex === i ? 6 : 4,
                height: stageIndex === i ? 6 : 4,
                borderRadius: '50%',
                background: stageIndex === i ? 'var(--gold)' : 'rgba(12,26,53,0.2)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ─ 3スライド通し固定アイコン ─ */}
      {inView && FLOAT_ICONS.map(({ id, Icon, gradient, delay, dur, hide, ...pos }) => (
        <div
          key={id}
          className={`kinetic-float-icon${hide ? ' kinetic-icon-hide' : ''}`}
          style={{
            position: 'fixed',
            ...(pos as React.CSSProperties),
            animation: `kinetic-float ${dur} ease-in-out ${delay} infinite alternate`,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          }}>
            <Icon />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes kinetic-float {
          0%   { transform: translateY(0px)   rotate(-1deg); }
          100% { transform: translateY(-18px) rotate(1deg);  }
        }
        @media (max-width: 640px) {
          .kinetic-icon-hide { display: none; }
          .kinetic-float-icon > div {
            width: 48px !important;
            height: 48px !important;
            border-radius: 12px !important;
          }
          .kinetic-float-icon > div svg {
            width: 20px !important;
            height: 20px !important;
          }
        }
      `}</style>
    </>
  )
}
