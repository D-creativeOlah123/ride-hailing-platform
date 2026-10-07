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
 * Shared carousel state: index, next/prev/goTo, autoplay with pause on hover,
 * focus, hidden tab or user toggle, swipe and arrow-key support.
 *
 * Spread `bind` onto the carousel's root element.
 */
export function useCarousel({ count, interval = 6000, autoplay = true }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const touch = useRef(null)

  const goTo = useCallback((i) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => setIndex(i => (i + 1) % count), [count])
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count])

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const paused = !autoplay || userPaused || hovered || focused || pageHidden

  // Restart the timer whenever the slide changes, so manual navigation gets a full interval.
  useEffect(() => {
    if (paused || count < 2) return
    const t = setTimeout(next, interval)
    return () => clearTimeout(t)
  }, [index, paused, interval, next, count])

  const bind = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
    },
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
    goTo,
    next,
    prev,
    paused,
    userPaused,
    toggleUserPaused: () => setUserPaused(p => !p),
    bind,
  }
}
