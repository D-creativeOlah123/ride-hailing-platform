import { useEffect, useState } from 'react'
import { useInView } from './useInView'
import { useReducedMotion } from './useCarousel'
import { stats } from './landingContent'

const DURATION = 1400

/** Counts from 0 to `value` once `start` is true (instantly with reduced motion). */
function useCountUp(value, start, reduced) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return
    if (reduced) {
      const id = requestAnimationFrame(() => setN(value))
      return () => cancelAnimationFrame(id)
    }
    let raf
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - t0) / DURATION)
      setN(value * (1 - Math.pow(1 - p, 3))) // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, start, reduced])
  return n
}

function Stat({ stat, start, reduced }) {
  const n = useCountUp(stat.value, start, reduced)
  return (
    <div className="px-4 py-8 text-center sm:px-6 lg:py-2">
      <p className="text-[2.5rem] font-semibold leading-none tracking-tightest text-ink tabular-nums sm:text-5xl">
        {n.toFixed(stat.decimals || 0)}
        <span className="text-accent-text">{stat.suffix}</span>
      </p>
      <p className="mt-3 text-sm text-ink-muted">{stat.label}</p>
    </div>
  )
}

export default function Stats() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ threshold: 0.4 })

  return (
    <section className="border-t border-line bg-surface py-16 sm:py-20" aria-label="RideLink in numbers">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        {/* 1px gaps over a line-coloured background give clean dividers in the 2x2 and 4x1 layouts */}
        <div ref={ref} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="bg-surface lg:py-8">
              <Stat stat={s} start={inView} reduced={reduced} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
