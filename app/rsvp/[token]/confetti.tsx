'use client'

import { useEffect, useRef } from 'react'

const PALETTE = ['#E5B53A', '#E0786A', '#5B9E7E', '#6FA8DC', '#E59FB0', '#C9A24A']

export function Confetti({
  play,
  kind = 'stars',
  accent,
  dense = false,
  onDone,
}: {
  play: boolean
  kind?: 'stars' | 'hearts' | 'dots'
  accent: string
  dense?: boolean
  onDone?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!play) return
    const cv = canvasRef.current
    if (!cv) return
    const maybeCtx = cv.getContext('2d')
    if (!maybeCtx) return
    const ctx = maybeCtx

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = cv.clientWidth
    const H = cv.clientHeight
    cv.width = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)

    const cols = [accent, ...PALETTE]
    const N = dense ? 52 : Math.round((W * H) / 5200)
    const cx = W / 2
    const cy = H * 0.42

    const particles = Array.from({ length: N }, () => ({
      x: dense ? cx + (Math.random() - 0.5) * 50 : Math.random() * W,
      y: dense ? cy : -Math.random() * H * 0.7 - 10,
      vx: dense ? (Math.random() - 0.5) * 7 : (Math.random() - 0.5) * 0.6,
      vy: dense ? -(Math.random() * 9 + 4) : Math.random() * 1.1 + 0.7,
      r: Math.random() * 7 + 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.18,
      sway: Math.random() * Math.PI * 2,
      col: cols[(Math.random() * cols.length) | 0],
      life: 1,
    }))

    let raf: number
    const t0 = performance.now()
    let stopping = false
    const dur = dense ? 1300 : 3400

    function star(c: CanvasRenderingContext2D, R: number) {
      c.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2
        c.lineTo(Math.cos(a) * R, Math.sin(a) * R)
        const b = a + (2 * Math.PI) / 5
        c.lineTo(Math.cos(b) * R * 0.46, Math.sin(b) * R * 0.46)
      }
      c.closePath()
    }

    function heart(c: CanvasRenderingContext2D, R: number) {
      const r = R * 0.9
      c.beginPath()
      c.moveTo(0, r * 0.35)
      c.bezierCurveTo(r, -r * 0.5, r * 0.55, -r, 0, -r * 0.35)
      c.bezierCurveTo(-r * 0.55, -r, -r, -r * 0.5, 0, r * 0.35)
      c.closePath()
    }

    function frame(now: number) {
      const elapsed = now - t0
      ctx.clearRect(0, 0, W, H)
      let alive = 0

      for (const p of particles) {
        p.sway += 0.03
        p.x += p.vx + Math.sin(p.sway) * 0.5
        p.vy += dense ? 0.32 : 0.004
        p.y += p.vy
        p.rot += p.vr
        if (stopping) p.life -= 0.03
        if (p.y < H + 20 && p.life > 0) alive++
        if (p.life <= 0) continue

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * 0.95
        ctx.fillStyle = p.col

        if (kind === 'dots') {
          ctx.beginPath()
          ctx.arc(0, 0, p.r * 0.5, 0, 7)
          ctx.fill()
        } else if (kind === 'hearts') {
          heart(ctx, p.r)
          ctx.fill()
        } else {
          star(ctx, p.r)
          ctx.fill()
        }

        ctx.restore()
      }

      if (elapsed > dur) stopping = true
      if (alive === 0 && stopping) {
        ctx.clearRect(0, 0, W, H)
        onDoneRef.current?.()
        return
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [play, kind, accent, dense])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    />
  )
}
