import { Car, CarFront, Users, UserRound, Route, Clock, TrendingDown, AlertCircle } from 'lucide-react'
import { Skeleton } from '../ui'
import { naira } from '../../utils/tripStats'

const RIDE_ICONS = { economy: Car, comfort: CarFront, xl: Users }

const periodText = (period) =>
  !period || period.multiplier === 1 ? 'Standard pricing' : `${period.label} · prices ×${period.multiplier}`

// "9pm" → "at 9pm", "Tmrw 6am" → "tomorrow at 6am"
const whenText = (label) => (label.startsWith('Tmrw ') ? `tomorrow at ${label.slice(5)}` : `at ${label}`)

/**
 * Fare estimate shown before booking: trip summary, ride type choice and
 * prices for the same trip at other departure times.
 */
export default function FareEstimate({ estimate, loading, error, rideType, onRideTypeChange }) {
  if (loading) return <EstimateSkeleton />

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    )
  }

  if (!estimate) return null

  const selected = estimate.options.find(o => o.type === rideType) || estimate.options[0]
  const slots = (estimate.byTime || []).filter(s => s.fares)
  const fareAt = (slot) => slot.fares[selected.type]
  const lowest = slots.length ? Math.min(...slots.map(fareAt)) : null
  const nowFare = slots[0] ? fareAt(slots[0]) : selected.fare
  const cheaperSlot = slots.find(s => s.label !== 'Now' && fareAt(s) === lowest && lowest < nowFare)

  return (
    <div className="mt-4 space-y-5">
      {/* Trip summary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-muted" aria-live="polite">
        <span className="inline-flex items-center gap-1.5">
          <Route className="h-3.5 w-3.5 text-ink-subtle" strokeWidth={1.75} aria-hidden="true" />
          <span className="font-medium text-ink tabular-nums">{estimate.distanceKm} km</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-ink-subtle" strokeWidth={1.75} aria-hidden="true" />
          <span className="font-medium text-ink tabular-nums">~{estimate.durationMin} min</span>
        </span>
        <span className={`badge ${estimate.period?.multiplier > 1 ? 'badge-warning' : 'badge-neutral'}`}>
          {periodText(estimate.period)}
        </span>
      </div>

      {/* Ride types */}
      <div>
        <p className="eyebrow mb-2" id="ride-type-label">Choose a ride</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="ride-type-label">
          {estimate.options.map(option => {
            const Icon = RIDE_ICONS[option.type] || Car
            const isSelected = option.type === selected.type
            return (
              <button
                key={option.type}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onRideTypeChange(option.type)}
                className={`min-w-0 rounded-lg border p-3 text-left transition-colors duration-150 ${
                  isSelected
                    ? 'border-accent bg-accent-soft ring-1 ring-accent'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
                }`}
              >
                <span className="flex items-center justify-between gap-1">
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-accent-text' : 'text-ink-subtle'}`} strokeWidth={1.75} aria-hidden="true" />
                  <span className="inline-flex items-center gap-0.5 text-2xs text-ink-subtle">
                    <UserRound className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                    {option.seats}<span className="sr-only"> seats</span>
                  </span>
                </span>
                <span className="mt-2 block truncate text-[13px] font-medium text-ink">{option.label}</span>
                <span className="mt-0.5 block text-[15px] font-semibold text-ink tabular-nums">{naira(option.fare)}</span>
                <span className="mt-1 hidden text-xs text-ink-muted sm:block">{option.description}</span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-ink-muted sm:hidden">
          <span className="font-medium text-ink">{selected.label}:</span> {selected.description} · {selected.seats} seats
        </p>
      </div>

      {/* Price by time */}
      {slots.length > 1 && (
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="eyebrow">Price by time · {selected.label}</p>
            <p className="text-xs text-ink-subtle">Booking is for now — compare times to plan your trip</p>
          </div>

          <div
            role="region"
            aria-label={`${selected.label} prices if you left at other times`}
            tabIndex={0}
            className="-mx-1 mt-2 overflow-x-auto overscroll-x-contain rounded-lg px-1 pb-2 pt-1"
          >
            <ul className="flex w-max gap-2">
              {slots.map(slot => {
                const fare = fareAt(slot)
                const isNow = slot.label === 'Now'
                // Only flag times that are actually cheaper than leaving now
                const isLowest = fare === lowest && lowest < nowFare
                return (
                  <li
                    key={slot.departAt || slot.label}
                    className={`w-[104px] shrink-0 rounded-lg border px-3 py-2.5 ${
                      isNow
                        ? 'border-accent bg-accent-soft ring-1 ring-accent'
                        : isLowest
                          ? 'border-success/40 bg-success/[0.07]'
                          : 'border-line bg-surface'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span className={`text-[13px] font-semibold ${isNow ? 'text-accent-text' : 'text-ink'}`}>{slot.label}</span>
                      {isLowest && (
                        <span className="text-2xs font-medium text-success">Cheapest</span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-2xs text-ink-subtle">{slot.period}</span>
                    <span className="mt-1.5 block text-sm font-semibold text-ink tabular-nums">{naira(fare)}</span>
                    <span className="block text-2xs text-ink-muted tabular-nums">~{slot.durationMin} min</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {cheaperSlot && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Save {naira(nowFare - lowest)} by leaving {whenText(cheaperSlot.label)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function EstimateSkeleton() {
  return (
    <div className="mt-4 space-y-5" role="status" aria-label="Getting prices">
      <div className="flex gap-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-[92px] sm:h-[112px]" />)}
      </div>
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[84px] w-[104px] shrink-0" />)}
      </div>
    </div>
  )
}
