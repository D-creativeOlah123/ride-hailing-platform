import { useCallback, useEffect, useRef, useState } from 'react'

/** true when the user has asked the OS to reduce motion. */
export function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * Shared carousel state with autoplay.
 *
 * Autoplay runs from mount and pauses only while:
 *   - a mouse hovers an element spread with `hoverProps`
 *   - a control spread with `controlProps` has keyboard focus (:focus-visible)
 *   - the tab is hidden
 *   - the user pressed pause
 * Reduced motion does NOT stop autoplay (callers just skip the transitions).
 *
 * One interval drives it; the tick lives in a ref so the interval is only
 * recreated when the pause state changes or the user navigates manually.
 */
export function useCarousel({ count, interval = 6000, autoplay = true }) {
  // previous = the slide being left, so it can keep its end state while fading out
  // highest = furthest slide reached, so callers can lazily mount slides as they come up
  const [state, setState] = useState({ index: 0, previous: null, highest: 0 })
  const { index, previous, highest } = state
  const [hovered, setHovered] = useState(false)
  const [controlFocused, setControlFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const [resetKey, setResetKey] = useState(0)
  const touch = useRef(null)
  const tickRef = useRef(null)

  const move = useCallback((fn) => setState(s => {
    const target = ((fn(s.index) % count) + count) % count
    return target === s.index ? s : { index: target, previous: s.index, highest: Math.max(s.highest, target) }
  }), [count])

  // The autoplay tick (kept in a ref so the interval never needs recreating for it)
  useEffect(() => {
    tickRef.current = () => {
      move(i => i + 1)
    }
  }, [move])

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const paused = !autoplay || userPaused || hovered || controlFocused || pageHidden

  useEffect(() => {
    if (paused || count < 2) return
    const id = setInterval(() => tickRef.current?.(), interval)
    return () => clearInterval(id)
  }, [paused, interval, count, resetKey])

  // Manual navigation restarts the countdown so the new slide gets a full interval.
  const navigate = useCallback((fn) => { move(fn); setResetKey(k => k + 1) }, [move])
  const goTo = useCallback((i) => navigate(() => i), [navigate])
  const next = useCallback(() => navigate(i => i + 1), [navigate])
  const prev = useCallback(() => navigate(i => i - 1), [navigate])

  /** Spread on the interactive parts of the carousel (not a full-bleed background). */
  const hoverProps = {
    onPointerEnter: (e) => { if (e.pointerType === 'mouse') setHovered(true) },
    onPointerLeave: (e) => { if (e.pointerType === 'mouse') setHovered(false) },
  }

  /** Spread on dots / arrows / pause button: keyboard focus pauses, clicks and taps don't. */
  const controlProps = {
    onFocus: (e) => { if (e.currentTarget.matches(':focus-visible')) setControlFocused(true) },
    onBlur: () => setControlFocused(false),
  }

  /** Spread on the carousel root: arrow keys and swipe. */
  const bind = {
    onKeyDown: (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    },
    onTouchStart: (e) => {
      touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    },
    onTouchEnd: (e) => {
      if (!touch.current) return
      const dx = e.changedTouches[0].clientX - touch.current.x
      const dy = e.changedTouches[0].clientY - touch.current.y
      touch.current = null
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)()
    },
  }

  return {
    index,
    previous,
    highest,
    goTo,
    next,
    prev,
    paused,
    userPaused,
    toggleUserPaused: () => setUserPaused(p => !p),
    bind,
    hoverProps,
    controlProps,
    resetKey,
  }
}
