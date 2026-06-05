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
    img: '/pillars/web.jpg',
  },
  {
    num: '02',
    label: 'LINE / DX',
    title: 'LINE予約・DX導入',
    desc: '電話予約の手間、予約漏れ、無断キャンセル。LINE一本で解決できる仕組みを、貴社の業務フローに合わせて設計・構築します。',
    img: '/pillars/line.jpg',
  },
  {
    num: '03',
    label: 'System Dev',
    title: 'システム開発',
    desc: '予約管理・顧客管理・業務自動化など、貴事業に合わせたシステムをゼロから構築。「こんな機能がほしい」をAIで低コスト実現します。',
    img: '/pillars/system.jpg',
  },
  {
    num: '04',
    label: 'Support',
    title: '保守・運用サポート',
    desc: '作って終わりにしません。公開後の更新・改善・トラブル対応まで、まるごとお任せいただけます。',
    img: '/pillars/support.jpg',
  },
]

function PillarCard({ p, delay }: { p: (typeof pillars)[0]; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 20px 48px rgba(12,26,53,0.13)'
            : '0 2px 8px rgba(12,26,53,0.05)',
          transition: 'transform 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        {/* ── 画像エリア ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0c1a35 0%, #162645 60%, #1e3a5f 100%)',
          flexShrink: 0,
        }}>
          {!imgError ? (
            <Image
              src={p.img}
              alt={p.title}
              fill
              sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
              style={{
                objectFit: 'cover',
                transform: hovered ? 'scale(1.07)' : 'scale(1.0)',
                transition: 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '0.55rem', letterSpacing: '0.18em',
                color: 'rgba(201,168,76,0.4)', textTransform: 'uppercase',
              }}>
                Image coming soon
              </span>
            </div>
          )}

          {/* 番号バッジ */}
          <div style={{
            position: 'absolute', top: '0.8rem', left: '0.85rem',
            background: 'rgba(12,26,53,0.62)',
            backdropFilter: 'blur(8px)',
            padding: '0.12rem 0.5rem',
            borderRadius: 2,
          }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.12em', color: 'var(--gold)',
            }}>
              {p.num}
            </span>
          </div>

          {/* 下グラデーション（テキストへの繋ぎ） */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '35%',
            background: 'linear-gradient(to top, rgba(12,26,53,0.28), transparent)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* ── テキストエリア ── */}
        <div style={{
          padding: '1.4rem 1.5rem 1.6rem',
          display: 'flex', flexDirection: 'column', flex: 1,
        }}>
          {/* ラベル（英語小） */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            marginBottom: '0.5rem',
          }}>
            <span style={{ width: 14, height: 1, background: 'var(--gold)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{
              fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--gold)',
            }}>
              {p.label}
            </span>
          </div>

          {/* タイトル */}
          <h3 style={{
            fontSize: 'clamp(0.95rem, 1.2vw, 1.05rem)',
            fontWeight: 700, color: 'var(--navy)',
            lineHeight: 1.35, letterSpacing: '-0.01em',
            marginBottom: '0.7rem',
          }}>
            {p.title}
          </h3>

          {/* 説明 */}
          <p style={{
            fontSize: '0.78rem', color: 'var(--gray)',
            lineHeight: 1.85, fontWeight: 300,
            flex: 1,
          }}>
            {p.desc}
          </p>

          {/* 矢印ボタン */}
          <div style={{ marginTop: '1.1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              width: 30, height: 30,
              border: `1px solid ${hovered ? 'var(--navy)' : 'var(--border)'}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hovered ? 'var(--navy)' : 'transparent',
              transform: hovered ? 'translateX(3px)' : 'translateX(0)',
              transition: 'all 0.3s ease',
            }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M1.5 5.5h8M5.5 1.5l4 4-4 4"
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
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem clamp(1.5rem,5vw,3rem)' }}>
      <FadeIn style={{ marginBottom: '3rem' }}>
        <div className="sec-label">What We Do</div>
        <h2 style={{
          fontSize: 'clamp(1.9rem,3vw,2.8rem)', fontWeight: 700,
          color: 'var(--navy)', lineHeight: 1.2, letterSpacing: '-0.01em',
        }}>
          4つの柱で、<br />デジタルをまるごと支える。
        </h2>
      </FadeIn>

      <div className="pillars-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        alignItems: 'stretch',
      }}>
        {pillars.map((p, i) => (
          <PillarCard key={p.num} p={p} delay={0.08 + i * 0.09} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pillars-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
