import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { rideOptions, routes, naira } from './landingContent'

export default function RideOptions() {
  return (
    <section className="border-t border-line bg-canvas py-20 sm:py-28" aria-labelledby="ride-options-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div id="ride-options-heading">
            <SectionHeading eyebrow={rideOptions.eyebrow} title={rideOptions.headline} />
          </div>
          <p className="text-sm text-ink-muted">Prices shown are starting fares in Lagos.</p>
        </Reveal>
      </div>

      {/* Phones: horizontal snap row that bleeds to the screen edge; lg: 4-column grid */}
      <ul className="mx-auto mt-10 flex max-w-content snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-8 lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {rideOptions.options.map((o, i) => (
          <Reveal
            as="li"
            key={o.name}
            delay={i * 80}
            className="card group flex w-[78%] shrink-0 snap-start flex-col overflow-hidden sm:w-[46%] lg:w-auto"
          >
            <div className="overflow-hidden">
              <Photo
                image={o.image}
                sizes="(min-width: 1024px) 25vw, 78vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-ink">{o.name}</h3>
                <span className="badge badge-neutral">
                  <Users className="h-3 w-3" /> {o.seats}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                from <span className="font-semibold text-ink tabular-nums">{naira(o.from)}</span>
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{o.body}</p>
              <Link to={routes.rider} className="btn btn-ghost btn-sm -ml-3 mt-4 self-start text-accent-text" aria-label={`Choose ${o.name}`}>
                Choose <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
