import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Star } from 'lucide-react'
import Photo from './Photo'
import BookingCard from './BookingCard'
import { useCarousel, useReducedMotion } from './useCarousel'
import { heroSlides, heroTrustLine, routes } from './landingContent'

const INTERVAL = 6000

export default function HeroCarousel() {
  const reduced = useReducedMotion()
  const { index, previous, goTo, next, prev, paused, userPaused, toggleUserPaused, bind } = useCarousel({
    count: heroSlides.length,
    interval: INTERVAL,
  })
  const slide = heroSlides[index]

  return (
    <>
      <section
        className="group/hero relative isolate flex min-h-[92svh] items-center overflow-hidden bg-[#06080d] text-white outline-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured"
        tabIndex={0}
        {...bind}
      >
        {/* Slides */}
        {heroSlides.map((s, i) => {
          const active = i === index
          return (
            <div
              key={s.image.file}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${heroSlides.length}`}
              aria-hidden={!active}
              className={`absolute inset-0 -z-10 transition-opacity ease-brand motion-reduce:transition-none ${
                active ? 'opacity-100 duration-[900ms]' : 'opacity-0 duration-[900ms]'
              }`}
            >
              {/* Re-adding the animation class restarts the zoom; the slide being left keeps its end scale while it fades */}
              <Photo
                image={s.image}
                priority={i === 0}
                sizes="100vw"
                className={`h-full w-full object-cover ${reduced ? '' : active ? 'animate-ken-burns' : i === previous ? 'scale-[1.08]' : ''}`}
              />
            </div>
          )
        })}

        {/* Contrast overlays: strong on the left/bottom where the copy sits */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-black/30" aria-hidden="true" />

        <div className="mx-auto grid w-full max-w-content items-center gap-10 px-4 pb-28 pt-28 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:pb-32">
          {/* Copy */}
          <div className="max-w-xl" aria-live={paused ? 'polite' : 'off'}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Now riding across Lagos
            </span>

            <h1 key={`h-${index}`} className="mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-tightest motion-safe:animate-fade-up sm:text-[3.25rem] lg:text-[3.75rem]">
              {slide.headline}
            </h1>
            <p key={`p-${index}`} className="mt-5 max-w-md text-base leading-relaxed text-white/80 motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-lg">
              {slide.subhead}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={routes.rider} className="btn btn-primary btn-lg group/cta">
                Book a ride
                <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" strokeWidth={2} />
              </Link>
              <Link to={routes.driver} className="btn btn-lg border border-white/40 text-white hover:border-white/70 hover:bg-white/10">
                Drive & earn
              </Link>
            </div>
          </div>

          {/* Booking card floats over the photo on large screens only */}
          <div className="hidden lg:block">
            <div className="ml-auto max-w-md -rotate-1 transition-transform duration-300 ease-brand hover:rotate-0 motion-reduce:rotate-0">
              <BookingCard />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-content items-center gap-4 px-4 pb-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
              {heroSlides.map((s, i) => {
                const active = i === index
                return (
                  <button
                    key={s.image.file}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Slide ${i + 1}: ${s.headline}`}
                    onClick={() => goTo(i)}
                    className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ease-brand ${active ? 'w-10 bg-white/30' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                  >
                    {active && (
                      <span
                        // Timer restarts after a pause, so the bar restarts too
                        key={`bar-${index}-${paused}`}
                        className={`absolute inset-0 origin-left rounded-full bg-white ${reduced ? '' : 'animate-progress'}`}
                        style={reduced ? undefined : { animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <span className="font-mono text-xs tabular-nums text-white/70" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleUserPaused}
                className="btn btn-icon btn-sm border border-white/25 text-white hover:bg-white/10"
                aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              >
                {userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={prev}
                className="btn btn-icon btn-sm hidden border border-white/25 text-white opacity-0 transition-opacity hover:bg-white/10 focus-visible:opacity-100 group-hover/hero:opacity-100 sm:inline-flex"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="btn btn-icon btn-sm hidden border border-white/25 text-white opacity-0 transition-opacity hover:bg-white/10 focus-visible:opacity-100 group-hover/hero:opacity-100 sm:inline-flex"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Below the hero: booking card on small screens, then the trust line */}
      <div className="bg-canvas lg:hidden">
        <div className="mx-auto max-w-md px-4 pt-8 sm:px-6">
          <BookingCard />
        </div>
      </div>
      <p className="bg-canvas px-4 py-6 text-center text-[13px] text-ink-muted">
        <Star className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px fill-warning text-warning" strokeWidth={0} />
        {heroTrustLine}
      </p>
    </>
  )
}
