'use client'

import Image from 'next/image'
import { useState } from 'react'
import FadeIn from './FadeIn'

const pillars = [
  {
    num: '01',
    label: 'Web Creative',
    title: 'WEBサイト制作',
    desc: '古いサイト・スマホ非対応・検索に出てこない。そんな課題をAIと人の目で解決。顧客・取引先に信頼されるサイトをつくります。',
    img: '/pillars/web.png',
  },
  {
    num: '02',
    label: 'LINE / DX',
    title: 'LINE予約・DX導入',
    desc: '電話予約の手間、予約漏れ、無断キャンセル。LINE一本で解決できる仕組みを、貴社の業務フローに合わせて設計・構築します。',
    img: '/pillars/line.png',
  },
  {
    num: '03',
    label: 'System Dev',
    title: 'システム開発',
    desc: '予約管理・顧客管理・業務自動化など、貴事業に合わせたシステムをゼロから構築。「こんな機能がほしい」をAIで低コスト実現します。',
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
          aspectRatio: '1 / 1',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 4,
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 20px 48px rgba(12,26,53,0.13)'
            : '0 2px 8px rgba(12,26,53,0.05)',
          transition: 'transform 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        {/* ── 左：写真エリア（48%） ── */}
        <div
          style={{
            width: '48%',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0c1a35 0%, #162645 60%, #1e3a5f 100%)',
          }}
        >
          {!imgError ? (
            <Image
              src={p.img}
              alt={p.title}
              fill
              sizes="(max-width: 640px) 100vw, 25vw"
              style={{
                objectFit: 'cover',
                transform: hovered ? 'scale(1.07)' : 'scale(1.0)',
                transition: 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '0.5rem', letterSpacing: '0.18em', color: 'rgba(201,168,76,0.35)', textTransform: 'uppercase' }}>
                No image
              </span>
            </div>
          )}

          {/* 番号バッジ */}
          <div
            style={{
              position: 'absolute', top: '1rem', left: '0.9rem',
              background: 'rgba(12,26,53,0.65)',
              backdropFilter: 'blur(8px)',
              padding: '0.12rem 0.5rem',
              borderRadius: 2,
              zIndex: 2,
            }}
          >
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)' }}>
              {p.num}
            </span>
          </div>

          {/*
            斜め境界：写真の右端に白の三角グラデーションをかぶせることで
            クリップせずに斜め分割ラインを作る。
            テキストエリアは常に白背景の 52% に完全収まる。
          */}
          <div
            style={{
              position: 'absolute',
              top: 0, right: 0, bottom: 0,
              width: '40%',
              background: 'linear-gradient(to bottom left, #ffffff 50%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>

        {/* ── 右：テキストエリア（52%・純白） ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '1.75rem 1.75rem 1.75rem 1.5rem',
            background: '#fff',
          }}
        >
          {/* ラベル */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
            <span style={{ width: 12, height: 1, background: 'var(--gold)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.17em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              {p.label}
            </span>
          </div>

          {/* タイトル */}
          <h3
            style={{
              fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
              fontWeight: 700,
              color: 'var(--navy)',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              marginBottom: '0.75rem',
            }}
          >
            {p.title}
          </h3>

          {/* 説明 */}
          <p style={{ fontSize: '0.77rem', color: 'var(--gray)', lineHeight: 1.85, fontWeight: 300 }}>
            {p.desc}
          </p>

          {/* 矢印 */}
          <div style={{ marginTop: '1.25rem' }}>
            <div
              style={{
                width: 28, height: 28,
                border: `1px solid ${hovered ? 'var(--navy)' : 'var(--border)'}`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hovered ? 'var(--navy)' : 'transparent',
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'all 0.3s ease',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 5h7M5 1.5l3.5 3.5L5 8.5"
                  stroke={hovered ? '#fff' : 'var(--navy)'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
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
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem clamp(1.5rem,5vw,3rem)' }}>
      <FadeIn style={{ marginBottom: '3rem' }}>
        <div className="sec-label">What We Do</div>
        <h2 style={{ fontSize: 'clamp(1.9rem,3vw,2.8rem)', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          4つの柱で、<br />デジタルをまるごと支える。
        </h2>
      </FadeIn>

      <div
        className="pillars-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', alignItems: 'start' }}
      >
        {pillars.map((p, i) => (
          <PillarCard key={p.num} p={p} delay={0.08 + i * 0.09} offset={i % 2 === 1} />
        ))}
      </div>

      <style>{`
        .pillars-offset { margin-top: 3rem; }
        @media (max-width: 640px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
          .pillars-offset { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  )
}
