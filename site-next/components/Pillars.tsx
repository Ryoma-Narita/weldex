'use client'

import Image from 'next/image'
import { useState } from 'react'
import FadeIn from './FadeIn'

const pillars = [
  {
    num: '01',
    label: 'Web Creative',
    title: 'WEBサイト制作',
    desc: '古いサイト・スマホ非対応・検索に出てこない。AIと人の目で解決し、顧客・取引先に信頼されるサイトをつくります。',
    img: '/pillars/web.png',
  },
  {
    num: '02',
    label: 'LINE / DX',
    title: 'LINE予約・DX導入',
    desc: '電話予約の手間、予約漏れ、無断キャンセル。LINE一本で解決できる仕組みを、業務フローに合わせて設計・構築します。',
    img: '/pillars/line.png',
  },
  {
    num: '03',
    label: 'System Dev',
    title: 'システム開発',
    desc: '予約管理・顧客管理・業務自動化など、貴事業に合わせたシステムをゼロから構築。AIで低コスト実現します。',
    img: '/pillars/system.png',
  },
  {
    num: '04',
    label: 'Support',
    title: '保守・運用サポート',
    desc: '作って終わりにしません。公開後の更新・改善・トラブル対応まで、まるごとお任せいただけます。',
    img: '/pillars/support.png',
  },
]

function PillarCard({
  p,
  delay,
  offset,
}: {
  p: (typeof pillars)[0]
  delay: number
  offset?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <FadeIn delay={delay} className={offset ? 'pillars-offset' : ''}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          /* 横長 5:3 ── 写真が十分に見える・正方形より幅広 */
          aspectRatio: '5 / 3',
          position: 'relative',
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid #e8eaf0',
          borderRadius: 6,
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 24px 56px rgba(12,26,53,0.14)'
            : '0 2px 12px rgba(12,26,53,0.06)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* ── 左：写真（60%・斜めクリップ）── */}
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '60%',
            overflow: 'hidden',
            /* 上辺: 0→100%, 下辺: 0→72% → 右端が斜めに */
            clipPath: 'polygon(0 0, 100% 0, 72% 100%, 0 100%)',
            background: '#0c1a35',
            zIndex: 2,
          }}
        >
          {!imgError ? (
            <Image
              src={p.img}
              alt={p.title}
              fill
              sizes="(max-width: 640px) 100vw, 30vw"
              style={{
                objectFit: 'cover',
                transform: hovered ? 'scale(1.06)' : 'scale(1.0)',
                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(201,168,76,0.4)', textTransform: 'uppercase' }}>
                No image
              </span>
            </div>
          )}

          {/* 番号バッジ */}
          <div style={{
            position: 'absolute', top: '0.9rem', left: '0.9rem',
            background: 'rgba(12,26,53,0.7)',
            backdropFilter: 'blur(8px)',
            padding: '0.15rem 0.55rem',
            borderRadius: 3,
            zIndex: 3,
          }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.1em', color: 'var(--gold)',
            }}>
              {p.num}
            </span>
          </div>
        </div>

        {/* ── 右：テキスト（純白・60%以降）── */}
        <div style={{
          position: 'absolute',
          left: '60%', right: 0, top: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '1.1rem 1.4rem 1.1rem 1.5rem',
          background: '#fff',
          zIndex: 1,
        }}>

          {/* ラベル */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
            <span style={{ width: 14, height: 1, background: 'var(--gold)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              {p.label}
            </span>
          </div>

          {/* タイトル */}
          <h3 style={{
            fontSize: 'clamp(1.05rem, 1.4vw, 1.3rem)',
            fontWeight: 800,
            color: 'var(--navy)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '0.6rem',
          }}>
            {p.title}
          </h3>

          {/* 区切り線 */}
          <div style={{ width: 20, height: 1, background: 'var(--border)', marginBottom: '0.6rem' }} />

          {/* 説明 */}
          <p style={{
            fontSize: '0.83rem',
            color: 'var(--gray)',
            lineHeight: 1.8,
            fontWeight: 400,
          }}>
            {p.desc}
          </p>

          {/* 矢印 */}
          <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em',
              color: hovered ? 'var(--navy)' : 'var(--light)',
              transition: 'color 0.3s ease',
            }}>
              詳しく見る
            </span>
            <div style={{
              width: 26, height: 26,
              border: `1px solid ${hovered ? 'var(--navy)' : 'var(--border)'}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hovered ? 'var(--navy)' : 'transparent',
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'all 0.3s ease',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5h7M5 1.5l3.5 3.5L5 8.5"
                  stroke={hovered ? '#fff' : 'var(--navy)'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

export default function Pillars() {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem clamp(1.5rem,5vw,3rem)' }}>
      <FadeIn style={{ marginBottom: '2.5rem' }}>
        <div className="sec-label">What We Do</div>
        <h2 style={{ fontSize: 'clamp(1.9rem,3vw,2.8rem)', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          4つの柱で、<br />デジタルをまるごと支える。
        </h2>
      </FadeIn>

      <div className="pillars-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
        alignItems: 'start',
      }}>
        {pillars.map((p, i) => (
          <PillarCard key={p.num} p={p} delay={0.08 + i * 0.09} offset={i % 2 === 1} />
        ))}
      </div>

      <style>{`
        .pillars-offset { margin-top: 2.5rem; }
        @media (max-width: 640px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
          .pillars-offset { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  )
}
