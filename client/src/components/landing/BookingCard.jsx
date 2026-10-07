import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Route, Wallet, Users, ArrowRight } from 'lucide-react'
import RouteMap from './RouteMap'
import { useReducedMotion } from './useCarousel'
import { bookingExamples, rideTypes, routes, naira } from './landingContent'

const TYPE_MS = 55
const HOLD_MS = 2600

/**
 * Hero booking card. Placeholders type out example Lagos trips; ETA, distance and
 * fare update with each example. Typing your own route stops the demo.
 */
export default function BookingCard({ className = '', compact = false }) {
  const reduced = useReducedMotion()
  const [example, setExample] = useState(0)
  const [typed, setTyped] = useState({ pickup: '', destination: '' })
  const [values, setValues] = useState({ pickup: '', destination: '' })
  const [rideType, setRideType] = useState('economy')
  const [focused, setFocused] = useState(false)

  const demoActive = !focused && !values.pickup && !values.destination
  const current = bookingExamples[example]

  // Type-writer placeholder: type pickup, then destination, hold, next example.
  useEffect(() => {
    if (!demoActive) return
    const { pickup, destination } = bookingExamples[example]
    if (reduced) {
      const t = setTimeout(() => setExample(e => (e + 1) % bookingExamples.length), 4000)
      return () => clearTimeout(t)
    }
    let p = 0, d = 0, timer
    const tick = () => {
      if (p < pickup.length) {
        p++
        setTyped({ pickup: pickup.slice(0, p), destination: '' })
        timer = setTimeout(tick, TYPE_MS)
      } else if (d < destination.length) {
        d++
        setTyped({ pickup, destination: destination.slice(0, d) })
        timer = setTimeout(tick, TYPE_MS)
      } else {
        timer = setTimeout(() => setExample(e => (e + 1) % bookingExamples.length), HOLD_MS)
      }
    }
    timer = setTimeout(tick, 120)
    return () => clearTimeout(timer)
  }, [example, demoActive, reduced])

  const placeholder = reduced
    ? { pickup: current.pickup, destination: current.destination }
    : { pickup: typed.pickup || 'Pickup location', destination: typed.destination || 'Where to?' }

  return (
    <div className={`card overflow-hidden bg-surface/95 shadow-overlay backdrop-blur-xl ${className}`}>
      <div className={`flex items-center justify-between border-b border-line px-5 ${compact ? 'py-3' : 'py-4'}`}>
        <span className="text-sm font-semibold text-ink">Book a ride</span>
        <span className="badge badge-dot badge-success">Available now</span>
      </div>

      <div className={`border-b border-line ${compact ? 'h-24' : 'h-28 sm:h-32'}`}>
        <RouteMap key={example} />
      </div>

      <div className={compact ? 'space-y-3 p-4' : 'space-y-4 p-5'}>
        <div className="relative space-y-2.5">
          <span className="pointer-events-none absolute left-[18px] top-[22px] z-10 h-[calc(100%-44px)] w-px bg-line-strong" aria-hidden="true" />
          <div className="relative">
            <span className="pointer-events-none absolute left-[15px] top-1/2 z-10 h-2 w-2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/15" />
            <label htmlFor="hero-pickup" className="sr-only">Pickup location</label>
            <input
              id="hero-pickup"
              className="input pl-10"
              placeholder={placeholder.pickup}
              value={values.pickup}
              onChange={e => setValues(v => ({ ...v, pickup: e.target.value }))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-[15px] top-1/2 z-10 h-2 w-2 -translate-y-1/2 rounded-[2px] bg-ink" />
            <label htmlFor="hero-destination" className="sr-only">Destination</label>
            <input
              id="hero-destination"
              className="input pl-10"
              placeholder={placeholder.destination}
              value={values.destination}
              onChange={e => setValues(v => ({ ...v, destination: e.target.value }))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Ride type chips */}
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Ride type">
          {rideTypes.map(t => {
            const active = rideType === t.key
            return (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRideType(t.key)}
                className={`rounded-lg border px-2.5 py-2 text-left transition-colors duration-150 ${
                  active ? 'border-accent/30 bg-accent-soft text-accent-text' : 'border-line bg-surface text-ink hover:border-line-strong'
                }`}
              >
                <span className="flex items-center justify-between text-[13px] font-semibold">
                  {t.label}
                  <span className={`flex items-center gap-0.5 text-2xs font-normal ${active ? 'text-accent-text/80' : 'text-ink-subtle'}`}>
                    <Users className="h-3 w-3" /> {t.seats}
                  </span>
                </span>
                <span key={`${example}-${t.key}`} className="mt-0.5 block text-xs tabular-nums motion-safe:animate-text-swap">
                  {naira(current.fares[t.key])}
                </span>
              </button>
            )
          })}
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line" aria-live="polite">
          {[
            { icon: Clock, label: 'ETA', value: `${current.eta} min` },
            { icon: Route, label: 'Distance', value: `${current.km} km` },
            { icon: Wallet, label: 'Fare', value: naira(current.fares[rideType]) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-3 py-2.5">
              <dt className="flex items-center gap-1.5 text-xs text-ink-subtle">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} /> {label}
              </dt>
              <dd key={`${example}-${rideType}-${label}`} className="mt-0.5 text-sm font-semibold text-ink tabular-nums motion-safe:animate-text-swap">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <Link to={routes.rider} className={`btn btn-primary w-full ${compact ? 'h-11' : 'btn-lg'}`}>
          Book a ride <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
