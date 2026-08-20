import { useEffect, useRef } from 'react'

export type ThumbVariant = 'flow' | 'constellation' | 'dots' | 'ribbons'

// Palette per repo language (hue pairs). Falls back to a seed hash when
// the language is unknown or not provided.
const LANG_HUES: Record<string, readonly [number, number]> = {
  typescript: [210, 265],
  javascript: [48, 210],
  python: [215, 48],
  rust: [24, 350],
  go: [195, 225],
  c: [215, 260],
  'c++': [220, 255],
  'c#': [200, 270],
  shell: [100, 160],
  html: [8, 35],
  css: [265, 300],
  scss: [300, 330],
  java: [30, 210],
  kotlin: [280, 320],
  ruby: [350, 20],
  php: [230, 200],
  swift: [250, 20],
  dart: [200, 165],
  vue: [165, 250],
  svelte: [20, 200],
}

export function langHues(lang?: string | null): readonly [number, number] | null {
  if (!lang) return null
  return LANG_HUES[lang.toLowerCase()] ?? null
}

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PARTICLE_COUNT = 70
const NODE_COUNT = 26
const RIBBON_COUNT = 4
const RIBBON_HIST = 50

type Particle = { x: number; y: number; c: 0 | 1; v: number }
type Node = { x: number; y: number }
type Ribbon = { x: number; y: number; v: number; hist: Node[] }

export default function InteractiveThumb({
  seed,
  variant = 'flow',
  hues = null,
  hoverBoost = false,
}: {
  seed: string
  variant?: ThumbVariant
  hues?: readonly [number, number] | null
  hoverBoost?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const rand = mulberry32(hashSeed(seed))
    let hueA: number
    let hueB: number
    if (hues) {
      ;[hueA, hueB] = hues
    } else {
      hueA = rand() * 360
      hueB = (hueA + 60 + rand() * 120) % 360
    }
    const o1 = rand() * 10
    const o2 = rand() * 10
    const o3 = rand() * 10

    let width = 1
    let height = 1
    let freq = 0.014
    let particles: Particle[] = []
    let nodes: Node[] = []
    let ribbons: Ribbon[] = []

    // Background follows the site theme: canvas base is the page's --bg
    // token, re-read whenever data-theme flips between light and dark.
    let base = '#ffffff'
    let isDark = true

    const readTheme = () => {
      base = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff'
      isDark = document.documentElement.dataset.theme !== 'light'
      ctx.fillStyle = base
      ctx.fillRect(0, 0, width, height)
    }

    const spawn = (): Particle => ({
      x: rand() * width,
      y: rand() * height,
      c: rand() > 0.5 ? 0 : 1,
      v: 0.6 + rand() * 0.9,
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.round(rect.width)
      height = Math.round(rect.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      freq = 2.4 / Math.max(width, height)
      ctx.fillStyle = base
      ctx.fillRect(0, 0, width, height)
      if (particles.length === 0) {
        particles = Array.from({ length: PARTICLE_COUNT }, spawn)
        nodes = Array.from({ length: NODE_COUNT }, () => ({ x: rand() * width, y: rand() * height }))
        ribbons = Array.from({ length: RIBBON_COUNT }, () => ({
          x: rand() * width,
          y: rand() * height,
          v: 1.4 + rand() * 1.2,
          hist: [],
        }))
      }
    }

    const pointer = { x: -999, y: -999, tx: -999, ty: -999, active: false }
    let lastScroll = window.scrollY
    let scrollEnergy = 0
    let hoverAmt = 0
    let hoverOn = false

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.tx = e.clientX - rect.left
      pointer.ty = e.clientY - rect.top
      if (!pointer.active) {
        pointer.x = pointer.tx
        pointer.y = pointer.ty
      }
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
    }

    const fieldAngle = (x: number, y: number, t: number) =>
      Math.sin(x * freq + t * 0.5 + o1) * 1.5 +
      Math.cos(y * freq * 1.35 - t * 0.35 + o2) * 1.5 +
      Math.sin((x + y) * freq * 0.7 + t * 0.2 + o3) * 0.9

    const clearFull = () => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = base
      ctx.fillRect(0, 0, width, height)
    }

    const drawFlow = (t: number, dt: number, energy: number, hueShift: number) => {
      // Trail fade towards the current theme background color.
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 0.09
      ctx.fillStyle = base
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // Dark mode: additive glow strokes. Light mode: subtractive ink.
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over'
      ctx.lineWidth = 1.1
      ctx.lineCap = 'round'
      for (const p of particles) {
        const a = fieldAngle(p.x, p.y, t)
        let vx = Math.cos(a) * p.v * energy
        let vy = Math.sin(a) * p.v * energy

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const R = 90
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / R) * 2.2
            vx += (-dy / d) * f + (dx / d) * f * 0.35
            vy += (dx / d) * f + (dy / d) * f * 0.35
          }
        }

        const nx = p.x + vx * dt * 60
        const ny = p.y + vy * dt * 60

        const hue = ((p.c === 0 ? hueA : hueB) + hueShift) % 360
        ctx.strokeStyle = isDark ? `hsla(${hue}, 85%, 62%, 0.5)` : `hsla(${hue}, 72%, 34%, 0.4)`
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(nx, ny)
        ctx.stroke()

        p.x = nx
        p.y = ny
        if (p.x < -8 || p.x > width + 8 || p.y < -8 || p.y > height + 8) Object.assign(p, spawn())
      }
    }

    const drawConstellation = (t: number, dt: number, energy: number, hueShift: number) => {
      clearFull()
      // Slow drift through the flow field
      for (const n of nodes) {
        const a = fieldAngle(n.x, n.y, t) * 0.35
        n.x += Math.cos(a) * 0.35 * energy * dt * 60
        n.y += Math.sin(a) * 0.35 * energy * dt * 60
        if (pointer.active) {
          const dx = n.x - pointer.x
          const dy = n.y - pointer.y
          const R = 80
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / R) * 1.6
            n.x += (dx / d) * f
            n.y += (dy / d) * f
          }
        }
        if (n.x < -10) n.x = width + 10
        if (n.x > width + 10) n.x = -10
        if (n.y < -10) n.y = height + 10
        if (n.y > height + 10) n.y = -10
      }

      const link = 80
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > link * link) continue
          const d = Math.sqrt(d2)
          let alpha = (1 - d / link) * (isDark ? 0.32 : 0.26)
          let hue = (hueA + hueShift) % 360
          if (pointer.active) {
            const mc = Math.min(
              Math.hypot(a.x - pointer.x, a.y - pointer.y),
              Math.hypot(b.x - pointer.x, b.y - pointer.y),
            )
            if (mc < 120) alpha *= 1 + (1 - mc / 120) * 2.4
          }
          ctx.strokeStyle = isDark
            ? `hsla(${hue}, 80%, 62%, ${alpha})`
            : `hsla(${hue}, 65%, 36%, ${alpha})`
          ctx.lineWidth = 0.9
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      nodes.forEach((n, i) => {
        const hue = ((i % 2 === 0 ? hueA : hueB) + hueShift) % 360
        let r = 1.6 + Math.sin(t * 2 + i) * 0.4
        let alpha = isDark ? 0.9 : 0.75
        if (pointer.active) {
          const d = Math.hypot(n.x - pointer.x, n.y - pointer.y)
          if (d < 100) {
            const f = 1 - d / 100
            r += f * 2
            alpha = Math.min(1, alpha + f)
          }
        }
        ctx.fillStyle = isDark ? `hsla(${hue}, 85%, 65%, ${alpha})` : `hsla(${hue}, 70%, 38%, ${alpha})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, Math.max(0.4, r), 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawDots = (t: number, _dt: number, _energy: number, hueShift: number) => {
      clearFull()
      const gap = 22
      for (let gx = gap / 2; gx < width; gx += gap) {
        for (let gy = gap / 2; gy < height; gy += gap) {
          let x = gx
          let y = gy
          let r = 1.1 + Math.sin(t * 2.2 + (gx + gy) * 0.012) * 0.35
          let alpha = isDark ? 0.22 : 0.18
          let sat = 30
          let light = isDark ? 65 : 45

          if (pointer.active) {
            const dx = gx - pointer.x
            const dy = gy - pointer.y
            const d = Math.hypot(dx, dy)
            const R = 110
            if (d < R) {
              const f = 1 - d / R
              r += f * 2.6
              alpha = Math.min(0.95, alpha + f * 0.8)
              sat = 80
              light = isDark ? 62 : 38
              x += (dx / (d || 1)) * f * 7
              y += (dy / (d || 1)) * f * 7
            }
          }

          const hue = (hueA + hueShift + ((x + y) / (width + height)) * 60) % 360
          ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const drawRibbons = (t: number, dt: number, energy: number, hueShift: number) => {
      clearFull()
      ctx.lineCap = 'round'
      ribbons.forEach((rb, idx) => {
        const a = fieldAngle(rb.x, rb.y, t)
        if (pointer.active) {
          const dx = rb.x - pointer.x
          const dy = rb.y - pointer.y
          const R = 90
          const d2 = dx * dx + dy * dy
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1
            const f = (1 - d / R) * 1.8
            rb.x += (dx / d) * f * 2
            rb.y += (dy / d) * f * 2
          }
        }
        rb.x += Math.cos(a) * rb.v * energy * dt * 60
        rb.y += Math.sin(a) * rb.v * energy * dt * 60
        rb.hist.push({ x: rb.x, y: rb.y })
        if (rb.hist.length > RIBBON_HIST) rb.hist.shift()
        if (rb.x < -14 || rb.x > width + 14 || rb.y < -14 || rb.y > height + 14) {
          rb.x = rand() * width
          rb.y = rand() * height
          rb.hist = []
        }

        const hue = ((idx % 2 === 0 ? hueA : hueB) + hueShift) % 360
        const maxA = isDark ? 0.55 : 0.42
        for (let i = 1; i < rb.hist.length; i++) {
          const p0 = rb.hist[i - 1]
          const p1 = rb.hist[i]
          const f = i / rb.hist.length
          ctx.strokeStyle = isDark
            ? `hsla(${hue}, 80%, 62%, ${f * maxA})`
            : `hsla(${hue}, 68%, 36%, ${f * maxA})`
          ctx.lineWidth = 0.8 + f * 1.4
          ctx.beginPath()
          ctx.moveTo(p0.x, p0.y)
          ctx.lineTo(p1.x, p1.y)
          ctx.stroke()
        }
      })
    }

    const draw = (timeMs: number, dt: number) => {
      const t = timeMs / 1000
      pointer.x += (pointer.tx - pointer.x) * 0.12
      pointer.y += (pointer.ty - pointer.y) * 0.12
      hoverAmt += ((hoverOn ? 1 : 0) - hoverAmt) * 0.08

      const energy = (1 + scrollEnergy) * (1 + hoverAmt * 1.4)
      const hueShift =
        t * 6 + window.scrollY * 0.05 + (pointer.active ? (pointer.x / width - 0.5) * 60 : 0)

      ctx.globalCompositeOperation = 'source-over'
      if (variant === 'flow') drawFlow(t, dt, energy, hueShift)
      else if (variant === 'constellation') drawConstellation(t, dt, energy, hueShift)
      else if (variant === 'dots') drawDots(t, dt, energy, hueShift)
      else drawRibbons(t, dt, energy, hueShift)

      if (pointer.active) {
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 70)
        const gh = (hueA + 180 + hueShift) % 360
        if (isDark) {
          g.addColorStop(0, `hsla(${gh}, 90%, 65%, 0.22)`)
          g.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
        } else {
          g.addColorStop(0, `hsla(${gh}, 80%, 45%, 0.1)`)
          g.addColorStop(1, 'hsla(0, 0%, 100%, 0)')
        }
        ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over'
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let last = performance.now()
    let running = false

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const d = Math.abs(window.scrollY - lastScroll)
      lastScroll = window.scrollY
      scrollEnergy = Math.min(scrollEnergy * 0.9 + d * 0.12, 5)
      draw(now, dt)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reduced) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) for (let i = 0; i < 160; i++) draw(i * 16.7, 1 / 60)
    })
    ro.observe(canvas)

    let io: IntersectionObserver | null = null
    if (reduced) {
      for (let i = 0; i < 160; i++) draw(i * 16.7, 1 / 60)
    } else {
      io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      })
      io.observe(canvas)
    }

    readTheme()
    const mo = new MutationObserver(readTheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onMove)
    canvas.addEventListener('pointerleave', onLeave)

    const host = hoverBoost ? (canvas.closest('.lab-card') ?? canvas) : null
    const onHostEnter = () => {
      hoverOn = true
    }
    const onHostLeaveCard = () => {
      hoverOn = false
    }
    host?.addEventListener('pointerenter', onHostEnter)
    host?.addEventListener('pointerleave', onHostLeaveCard)

    return () => {
      stop()
      ro.disconnect()
      io?.disconnect()
      mo.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      host?.removeEventListener('pointerenter', onHostEnter)
      host?.removeEventListener('pointerleave', onHostLeaveCard)
    }
  }, [seed, variant, hues, hoverBoost])

  return <canvas ref={canvasRef} className="interactive-thumb" aria-hidden="true" />
}
