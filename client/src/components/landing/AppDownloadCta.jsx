import { Link } from 'react-router-dom'
import { ArrowRight, Smartphone } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import BookingCard from './BookingCard'
import { downloadCta, routes } from './landingContent'

function StoreButton({ store }) {
  // Placeholder: the native apps aren't published yet, so these are not links.
  return (
    <span
      className="inline-flex items-center gap-3 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-left text-white/90"
      aria-label={`${store} app coming soon`}
    >
      <Smartphone className="h-5 w-5" strokeWidth={1.75} />
      <span>
        <span className="block text-[10px] uppercase tracking-eyebrow text-white/60">Coming soon</span>
        <span className="block text-sm font-semibold leading-tight">{store}</span>
      </span>
    </span>
  )
}

/** CSS-only phone frame that shows the live booking card inside. */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[330px] rounded-[44px] border border-white/15 bg-[#0b0f17] p-3 shadow-overlay" aria-hidden="true" inert>
      <div className="absolute left-1/2 top-4 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[34px] bg-canvas">
        <div className="flex h-10 items-end justify-between px-6 pb-1 text-[11px] font-semibold text-ink">
          <span>9:41</span><span className="tracking-widest">●●●</span>
        </div>
        <div className="px-2 pb-2">
          <BookingCard compact hideSeats className="shadow-none" />
        </div>
      </div>
    </div>
  )
}

export default function AppDownloadCta() {
  return (
    <section className="relative isolate overflow-hidden bg-[#06080d] py-20 text-white sm:py-28">
      <Photo image={downloadCta.image} sizes="100vw" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      {/* Accent-tinted overlay */}
      <div className="absolute inset-0 -z-10 bg-[#06080d]/75" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-accent/45 via-accent/10 to-transparent mix-blend-screen" aria-hidden="true" />

      <div className="mx-auto grid max-w-content items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <Reveal>
          <h2 className="text-[2.25rem] font-semibold leading-[1.05] tracking-tightest sm:text-5xl">{downloadCta.headline}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">{downloadCta.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={routes.rider} className="btn btn-lg bg-white font-semibold text-[#1847c4] shadow-xs hover:bg-white/90">
              Book your first ride <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={routes.driver} className="btn btn-lg border border-white/40 text-white hover:border-white/70 hover:bg-white/10">
              Become a driver
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <StoreButton store="App Store" />
            <StoreButton store="Google Play" />
          </div>
        </Reveal>

        <Reveal delay={120} className="hidden sm:block">
          <PhoneMockup />
        </Reveal>
      </div>
    </section>
  )
}
