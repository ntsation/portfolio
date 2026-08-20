import { useEffect, useRef } from 'react'

// Full-page dot grid used as the Lab background. Dots react to the pointer
// tracked at window level (grow, light up, get pushed away), but there is
// no radial glow around the cursor — only the dot response itself.

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let base = '#ffffff'
    let isDark = true

    const pointer = { x: -9999, y: -9999, active: false }

    const readTheme = () => {
      base = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff'
      isDark = document.documentElement.dataset.theme !== 'light'
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
    }

    const GAP = 26
    const ACCENT = '352'

    const draw = (t: number) => {
      ctx.fillStyle = base
      ctx.fillRect(0, 0, width, height)
      for (let gx = GAP / 2; gx < width; gx += GAP) {
        for (let gy = GAP / 2; gy < height; gy += GAP) {
          let x = gx
          let y = gy
          let r = 1.1 + Math.sin(t * 1.8 + (gx + gy) * 0.012) * 0.35
          let alpha = isDark ? 0.16 : 0.13
          let light = isDark ? 70 : 35

          if (pointer.active) {
            const dx = gx - pointer.x
            const dy = gy - pointer.y
            const d = Math.hypot(dx, dy)
            const R = 130
            if (d < R) {
              const f = 1 - d / R
              r += f * 2.6
              alpha = Math.min(0.9, alpha + f * 0.75)
              light = isDark ? 62 : 38
              x += (dx / (d || 1)) * f * 8
              y += (dy / (d || 1)) * f * 8
            }
          }

          ctx.fillStyle = `hsla(${ACCENT}, ${isDark ? 62 : 68}%, ${light}%, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    const loop = (now: number) => {
      draw(now / 1000)
      raf = requestAnimationFrame(loop)
    }

    readTheme()
    resize()
    if (reduced) {
      draw(0)
    } else {
      raf = requestAnimationFrame(loop)
    }

    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!reduced && !document.hidden) raf = requestAnimationFrame(loop)
    }

    const mo = new MutationObserver(() => {
      readTheme()
      if (reduced) draw(0)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={canvasRef} className="lab-bg" aria-hidden="true" />
}
