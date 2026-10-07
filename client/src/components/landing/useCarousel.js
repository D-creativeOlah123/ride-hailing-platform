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
  // previous = the slide being left, so it can keep its end state while fading out
  const [state, setState] = useState({ index: 0, previous: null })
  const { index, previous } = state
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const touch = useRef(null)

  const move = useCallback((fn) => setState(s => {
    const target = ((fn(s.index) % count) + count) % count
    return target === s.index ? s : { index: target, previous: s.index }
  }), [count])
  const goTo = useCallback((i) => move(() => i), [move])
  const next = useCallback(() => move(i => i + 1), [move])
  const prev = useCallback(() => move(i => i - 1), [move])

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
    // Only a real mouse counts as hover. Phones fire emulated mouseenter on tap with no
    // matching leave, which would otherwise pause autoplay for good.
    onPointerEnter: (e) => { if (e.pointerType === 'mouse') setHovered(true) },
    onPointerLeave: (e) => { if (e.pointerType === 'mouse') setHovered(false) },
    // Only keyboard focus pauses; taps and clicks don't produce :focus-visible.
    onFocus: (e) => {
      if (e.target.matches?.(':focus-visible')) setFocused(true)
    },
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
    previous,
    goTo,
    next,
    prev,
    paused,
    userPaused,
    toggleUserPaused: () => setUserPaused(p => !p),
    bind,
  }
}
