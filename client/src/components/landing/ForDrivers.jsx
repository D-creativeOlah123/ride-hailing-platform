import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Wallet } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { forDrivers, routes, naira } from './landingContent'

function EarningsCalculator() {
  const { hours: range, earningsPerHour } = forDrivers
  const [hours, setHours] = useState(range.default)
  const id = useId()
  const weekly = hours * earningsPerHour
  const pct = ((hours - range.min) / (range.max - range.min)) * 100

  return (
    <div className="card p-5 shadow-raised sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">Hours online per week</label>
        <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-sm font-medium text-ink tabular-nums">{hours}h</span>
      </div>

      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={1}
        value={hours}
        onChange={e => setHours(Number(e.target.value))}
        aria-valuetext={`${hours} hours a week, about ${naira(weekly)} per week`}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[rgb(var(--accent))] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-accent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-raised"
        style={{ background: `linear-gradient(to right, rgb(var(--accent)) ${pct}%, rgb(var(--surface-3)) ${pct}%)` }}
      />
      <div className="mt-2 flex justify-between text-xs text-ink-subtle">
        <span>{range.min}h</span>
        <span>{range.max}h</span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-5" aria-live="polite">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            <Wallet className="h-3.5 w-3.5" strokeWidth={1.75} /> Estimated weekly earnings
          </p>
          <p className="mt-1 text-[2rem] font-semibold leading-none tracking-tight text-ink tabular-nums">{naira(weekly)}</p>
        </div>
        <p className="text-right text-xs text-ink-subtle">≈ {naira(weekly * 4.33)}<br />per month</p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
        Estimate only, based on an average of {naira(earningsPerHour)} per online hour in Lagos after commission. Actual earnings depend on demand, zone and hours.
      </p>
    </div>
  )
}

export default function ForDrivers() {
  return (
    <section id="drivers" className="scroll-mt-20 border-t border-line bg-canvas py-20 sm:py-28">
      <div className="mx-auto grid max-w-content items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Copy + calculator (left on desktop, mirroring For Riders) */}
        <div className="order-2 lg:order-1">
          <Reveal>
            <SectionHeading eyebrow={forDrivers.eyebrow} title={forDrivers.headline} body={forDrivers.body} />
          </Reveal>
          <ul className="mt-6 space-y-2.5">
            {forDrivers.perks.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-ink">
                <Check className="h-4 w-4 text-success" strokeWidth={2.5} /> {p}
              </li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <EarningsCalculator />
          </Reveal>
          <Link to={routes.driver} className="btn btn-primary btn-lg group/cta mt-8">
            Start driving
            <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </div>

        {/* Photo with secondary chip */}
        <Reveal className="relative order-1 lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-line shadow-raised">
            <Photo
              image={forDrivers.image}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
            />
          </div>
          <div className="absolute -bottom-6 -left-2 w-36 overflow-hidden rounded-xl border-4 border-canvas shadow-overlay sm:-left-6 sm:w-48">
            <Photo image={forDrivers.secondaryImage} sizes="200px" className="aspect-square w-full object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
