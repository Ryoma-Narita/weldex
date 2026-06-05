'use client'

import { useEffect, useRef, useState } from 'react'

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)
const LightningIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)
const MobileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)

const ICONS = [
  { id: 'tl', Icon: MonitorIcon,  gradient: 'linear-gradient(135deg,#667eea,#764ba2)', left: '5%',  top: '12%',              delay: '0s',    dur: '6s',  sp: false },
  { id: 'tr', Icon: LightningIcon,gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', right: '8%', top: '10%',              delay: '1s',    dur: '5s',  sp: true  },
  { id: 'ml', Icon: ChatIcon,     gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', left: '3%',  top: '45%',              delay: '2s',    dur: '7s',  sp: false },
  { id: 'mr', Icon: ChartIcon,    gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', right: '6%', top: '42%',              delay: '0.5s',  dur: '8s',  sp: true  },
  { id: 'bl', Icon: LinkIcon,     gradient: 'linear-gradient(135deg,#fa709a,#fee140)', left: '7%',  bottom: '18%',           delay: '1.5s',  dur: '6s',  sp: false },
  { id: 'br', Icon: MobileIcon,   gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', right: '5%', bottom: '20%',           delay: '2.5s',  dur: '7s',  sp: true  },
] as const

export default function BrandSection() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} style={{
      minHeight: '100vh', background: '#f5f5f0',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6rem clamp(1.5rem, 5vw, 6rem)',
    }}>

      {/* 浮遊アイコン */}
      {ICONS.map(({ id, Icon, gradient, delay, dur, sp, ...pos }) => (
        <div key={id} className={sp ? 'resp-hide' : ''} style={{
          position: 'absolute',
          ...pos,
          animation: `float-brand ${dur} ease-in-out ${delay} infinite alternate`,
          zIndex: 0,
        }}>
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

      {/* メインコンテンツ */}
      <div style={{
        textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}>

        {/* タグ */}
        <div style={{
          fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em',
          color: 'var(--gold)', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          marginBottom: '1.75rem',
        }}>
          <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'block' }} />
          Weld + Connect + Grow
          <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'block' }} />
        </div>

        {/* 見出し */}
        <h2 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(4.5rem, 13vw, 10rem)',
          fontWeight: 700, fontStyle: 'italic',
          color: '#1a2540', lineHeight: 0.95,
          letterSpacing: '-0.03em', marginBottom: '2.25rem',
        }}>
          Connecting<br />
          <span style={{ fontSize: '0.65em', fontStyle: 'normal', letterSpacing: '-0.01em' }}>for Value</span><br />
          <span style={{ fontSize: '0.7em' }}>Creation.</span>
        </h2>

        {/* 日本語メインコピー */}
        <p style={{
          fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
          color: 'var(--gray)', fontWeight: 300, lineHeight: 1.95,
          marginBottom: '1.25rem',
        }}>
          Weldexは顧客と企業・システムとマーケティング、<br />
          全てを一体化させお客様の事業のDXを促進させます。
        </p>

        {/* 語源説明 */}
        <p style={{
          fontSize: '0.78rem', color: 'var(--light)',
          fontWeight: 300, lineHeight: 1.85,
        }}>
          Weld（つなぐ・強固にする）+ dex（体系化）<br />
          制作・システム・LINE連携・保守まで、全て一社で完結。
        </p>
      </div>

      {/* スクロールインジケーター */}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--light)', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--light), transparent)' }} />
      </div>
    </section>
  )
}
