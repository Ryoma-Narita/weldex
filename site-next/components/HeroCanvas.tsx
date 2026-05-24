'use client'

import { useEffect, useRef } from 'react'

// ─── 型 ──────────────────────────────────────────────────────────────────────

interface Ray {
  angle: number
  speed: number
  life: number
  maxLife: number
  width: number
  hue: number
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number
  opacity: number
}

interface Window {
  x: number; y: number; w: number; h: number
  lit: boolean
  timer: number
  interval: number
}

interface Building {
  x: number; y: number; w: number; h: number
  windows: Window[]
}

// ─── ビル生成 ─────────────────────────────────────────────────────────────────

function makeBuildings(W: number, H: number): Building[] {
  const buildings: Building[] = []
  const startX = W * 0.52
  let x = startX
  while (x < W + 20) {
    const w = 28 + Math.random() * 55
    const h = 90 + Math.random() * (H * 0.55)
    const bld: Building = { x, y: H - h, w, h, windows: [] }
    const cols = Math.floor(w / 11)
    const rows = Math.floor(h / 14)
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        bld.windows.push({
          x: bld.x + 4 + c * 11,
          y: bld.y + 6 + r * 14,
          w: 6, h: 8,
          lit: Math.random() > 0.35,
          timer: 0,
          interval: 60 + Math.floor(Math.random() * 300),
        })
      }
    }
    buildings.push(bld)
    x += w + 2 + Math.random() * 6
  }
  return buildings
}

// ─── パーティクル生成 ─────────────────────────────────────────────────────────

function makeParticles(W: number, H: number, n = 70): Particle[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: 1.2 + Math.random() * 2,
    opacity: 0.4 + Math.random() * 0.6,
  }))
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // リサイズ
    let W = 0, H = 0
    let buildings: Building[] = []
    let particles: Particle[] = []

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      buildings = makeBuildings(W, H)
      particles = makeParticles(W, H)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // 消失点
    const vpX = () => W * 0.62
    const vpY = () => H * 0.42

    // レイ群
    const rays: Ray[] = []
    const spawnRay = () => {
      rays.push({
        angle: Math.random() * Math.PI * 2,
        speed: 2.5 + Math.random() * 5,
        life: 0,
        maxLife: 40 + Math.random() * 80,
        width: 0.4 + Math.random() * 1.6,
        hue: 190 + Math.random() * 40,
      })
    }
    // 初期レイ
    for (let i = 0; i < 60; i++) spawnRay()

    let frame = 0
    let raf: number

    // ─── グリッド線 ───────────────────────────────────────────────────────────
    const drawGrid = () => {
      ctx.save()
      ctx.globalAlpha = 0.18
      ctx.strokeStyle = '#1a6aaa'
      ctx.lineWidth = 0.6

      const ox = vpX(), oy = vpY()
      const spread = 16
      const tNorm = (frame * 0.4) % spread

      // 水平方向グリッド（消失点から上下）
      for (let i = -8; i <= 24; i++) {
        const t = (i * spread + tNorm) / 400
        const yTop = oy + (0 - oy) * (1 - t)
        const yBot = oy + (H - oy) * (1 - t)
        if (yTop < 0 || yBot > H + 20) continue
        ctx.beginPath()
        ctx.moveTo(0, yBot)
        ctx.lineTo(W, yBot)
        ctx.globalAlpha = 0.07 + t * 0.13
        ctx.stroke()
      }

      // 垂直方向グリッド
      ctx.globalAlpha = 0.12
      const vLines = 18
      for (let i = 0; i <= vLines; i++) {
        const xEnd = (i / vLines) * W
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.lineTo(xEnd, H)
        ctx.stroke()
      }

      ctx.restore()
    }

    // ─── スピードレイ ─────────────────────────────────────────────────────────
    const drawRays = () => {
      for (let i = rays.length - 1; i >= 0; i--) {
        const r = rays[i]
        const progress = r.life / r.maxLife
        const alpha = Math.sin(progress * Math.PI) * 0.7
        const dist   = r.life * r.speed
        const distEnd = (r.life + 18) * r.speed

        const x1 = vpX() + Math.cos(r.angle) * dist
        const y1 = vpY() + Math.sin(r.angle) * dist
        const x2 = vpX() + Math.cos(r.angle) * distEnd
        const y2 = vpY() + Math.sin(r.angle) * distEnd

        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, `hsla(${r.hue},90%,75%,0)`)
        grad.addColorStop(0.4, `hsla(${r.hue},90%,80%,${alpha})`)
        grad.addColorStop(1, `hsla(${r.hue},90%,90%,0)`)

        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.lineWidth = r.width
        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.restore()

        r.life++
        if (r.life >= r.maxLife) {
          rays.splice(i, 1)
          spawnRay()
        }
      }
    }

    // ─── パーティクル ─────────────────────────────────────────────────────────
    const drawParticles = () => {
      const maxDist = 120

      // 接続線
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < maxDist) {
            const a = (1 - d / maxDist) * 0.25
            ctx.strokeStyle = `rgba(80,180,255,${a})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.restore()

      // ノード
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grd.addColorStop(0, `rgba(160,220,255,${p.opacity})`)
        grd.addColorStop(1, 'rgba(80,160,255,0)')
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // ─── ビル ─────────────────────────────────────────────────────────────────
    const drawBuildings = () => {
      ctx.save()

      for (const b of buildings) {
        // 外壁
        const wallGrad = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y)
        wallGrad.addColorStop(0, '#060d1a')
        wallGrad.addColorStop(1, '#0a1628')
        ctx.fillStyle = wallGrad
        ctx.fillRect(b.x, b.y, b.w, b.h)

        // アウトライン
        ctx.strokeStyle = 'rgba(30,80,140,0.5)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(b.x, b.y, b.w, b.h)

        // 窓
        for (const w of b.windows) {
          w.timer++
          if (w.timer >= w.interval) {
            w.lit = Math.random() > 0.3
            w.timer = 0
            w.interval = 60 + Math.floor(Math.random() * 300)
          }
          if (w.lit) {
            const wType = Math.random() < 0.1 ? 'orange' : 'blue'
            ctx.fillStyle = wType === 'orange'
              ? 'rgba(255,120,60,0.75)'
              : 'rgba(100,200,255,0.65)'
            ctx.fillRect(w.x, w.y, w.w, w.h)

            // 窓の輝き
            ctx.save()
            ctx.globalCompositeOperation = 'screen'
            ctx.globalAlpha = 0.15
            ctx.fillStyle = wType === 'orange' ? '#ff8844' : '#44aaff'
            ctx.fillRect(w.x - 2, w.y - 2, w.w + 4, w.h + 4)
            ctx.restore()
          } else {
            ctx.fillStyle = 'rgba(8,20,40,0.9)'
            ctx.fillRect(w.x, w.y, w.w, w.h)
          }
        }
      }
      ctx.restore()
    }

    // ─── 中央グロー ───────────────────────────────────────────────────────────
    const drawGlow = () => {
      const pulse = 0.6 + Math.sin(frame * 0.025) * 0.15
      const ox = vpX(), oy = vpY()

      // 外側グロー
      const outer = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.55)
      outer.addColorStop(0, `rgba(80,160,255,${0.09 * pulse})`)
      outer.addColorStop(0.4, `rgba(30,100,200,${0.04 * pulse})`)
      outer.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = outer
      ctx.fillRect(0, 0, W, H)

      // 内側白グロー
      const inner = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.1)
      inner.addColorStop(0, `rgba(200,230,255,${0.55 * pulse})`)
      inner.addColorStop(0.3, `rgba(100,180,255,${0.15 * pulse})`)
      inner.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = inner
      ctx.fillRect(0, 0, W, H)
      ctx.restore()
    }

    // ─── 背景 ─────────────────────────────────────────────────────────────────
    const drawBackground = () => {
      const bg = ctx.createRadialGradient(W * 0.62, H * 0.4, 0, W * 0.5, H * 0.5, W * 0.85)
      bg.addColorStop(0, '#0d1f3a')
      bg.addColorStop(0.5, '#060e1c')
      bg.addColorStop(1, '#030810')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)
    }

    // ─── アニメーションループ ─────────────────────────────────────────────────
    const tick = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      drawBackground()
      drawGrid()
      drawGlow()
      drawRays()
      drawBuildings()
      drawParticles()

      // 最上部：ビル右側グラデーションマスク（左側を文字エリアとしてやや暗く）
      const mask = ctx.createLinearGradient(0, 0, W * 0.5, 0)
      mask.addColorStop(0, 'rgba(5,10,22,0.72)')
      mask.addColorStop(0.38, 'rgba(5,10,22,0.35)')
      mask.addColorStop(0.55, 'rgba(0,0,0,0)')
      ctx.fillStyle = mask
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  )
}
