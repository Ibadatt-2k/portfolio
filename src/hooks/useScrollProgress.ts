import { useCallback, useEffect, useRef, type RefObject } from 'react'

// Wheel/touch travel, in viewport heights, per 1 of progress (one scene).
const TRAVEL = 1.5
// Swipes cover less distance than wheel scrolling, so give them a boost.
const TOUCH_BOOST = 2
// How quickly the rendered progress catches up to the input (higher = snappier).
const SMOOTHING = 7

const KEY_STEPS: Record<string, number> = {
  ArrowDown: 0.1,
  ArrowUp: -0.1,
  PageDown: 0.5,
  PageUp: -0.5,
  End: Infinity,
  Home: -Infinity,
}

/**
 * The page never scrolls. Wheel, touch and keyboard input move a virtual
 * progress value from 0 to `end`; it's eased and written to the `--p` custom
 * property on `target` for CSS to animate against, and passed to
 * `onProgress` for anything animated from JS. Returns a function that glides
 * to a given progress, as if scrolled there.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  end: number,
  onProgress?: (progress: number) => void,
) {
  const callback = useRef(onProgress)
  useEffect(() => {
    callback.current = onProgress
  })
  const jump = useRef<(to: number) => void>(() => {})

  useEffect(() => {
    const el = target.current
    if (!el) return

    let goal = 0
    let current = 0
    let last = 0
    let frame = 0

    const tick = (now: number) => {
      const dt = Math.min(Math.max(now - last, 0) / 1000, 0.1)
      last = now
      current += (goal - current) * (1 - Math.exp(-SMOOTHING * dt))
      if (Math.abs(goal - current) < 0.0005) current = goal
      el.style.setProperty('--p', current.toFixed(4))
      callback.current?.(current)
      frame = current === goal ? 0 : requestAnimationFrame(tick)
    }

    const move = (delta: number) => {
      goal = Math.min(end, Math.max(0, goal + delta))
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    jump.current = (to) => move(to - goal)

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // trackpad pinch-zoom
      const px =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY
      move(px / (innerHeight * TRAVEL))
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) return
      const y = e.touches[0].clientY
      move(((touchY - y) * TOUCH_BOOST) / (innerHeight * TRAVEL))
      touchY = y
    }

    const onKeyDown = (e: KeyboardEvent) => {
      // Leave keys alone while someone's typing in a form field.
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return
      const step = e.key === ' ' ? (e.shiftKey ? -0.5 : 0.5) : KEY_STEPS[e.key]
      if (step === undefined) return
      e.preventDefault()
      move(step)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [target, end])

  return useCallback((to: number) => jump.current(to), [])
}
