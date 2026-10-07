import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Star } from 'lucide-react'
import Photo from './Photo'
import BookingCard from './BookingCard'
import { useCarousel, useReducedMotion } from './useCarousel'
import { heroSlides, heroTrustLine, routes } from './landingContent'

const INTERVAL = 6000

// Focal point drives both object-position and the Ken Burns origin, per breakpoint.
const FOCAL_CLASSES =
  '[object-position:var(--focal-m)] [transform-origin:var(--focal-m)] md:[object-position:var(--focal-d)] md:[transform-origin:var(--focal-d)]'

export default function HeroCarousel() {
  const reduced = useReducedMotion()
  const { index, previous, highest, goTo, next, prev, paused, userPaused, toggleUserPaused, bind, hoverProps, controlProps, resetKey } = useCarousel({
    count: heroSlides.length,
    interval: INTERVAL,
  })
  const slide = heroSlides[index]

  // Only slide 1 loads up front (it's the LCP image). The next slide's photo is fetched once
  // the page has finished loading, so the hidden slides don't compete for bandwidth.
  const [pageLoaded, setPageLoaded] = useState(() => document.readyState === 'complete')
  useEffect(() => {
    if (pageLoaded) return
    const onLoad = () => setPageLoaded(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [pageLoaded])
  const shouldMount = (i) => i <= highest || (pageLoaded && i <= highest + 1)

  return (
    <>
      <section
        className="group/hero relative isolate flex min-h-[72svh] overflow-x-clip items-end bg-[#06080d] text-white outline-none md:min-h-[80svh] lg:min-h-[92svh] lg:items-start"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured"
        tabIndex={0}
        {...bind}
      >
        {/* Slides (clipped here so the desktop booking card can hang below the hero) */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {heroSlides.map((s, i) => {
            const active = i === index
            return (
              <div
                key={s.image.file}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${heroSlides.length}`}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-brand motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
              >
                {/* Re-adding the animation class restarts the zoom; the slide being left keeps its end scale while it fades */}
                {shouldMount(i) && (
                  <Photo
                    image={s.image}
                    priority={i === 0}
                    sizes="100vw"
                    style={{ '--focal-m': s.focal.mobile, '--focal-d': s.focal.desktop }}
                    className={`h-full w-full object-cover ${FOCAL_CLASSES} ${reduced ? '' : active ? 'animate-ken-burns' : i === previous ? 'scale-[1.08]' : ''}`}
                  />
                )}
              </div>
            )
          })}

          {/* Overlays: light at the top so photos read as photos, darker only behind the copy */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/70 via-black/45 to-transparent lg:hidden" aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 hidden w-[68%] bg-gradient-to-r from-black/65 via-black/40 to-transparent lg:block" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-black/45 to-transparent lg:block" aria-hidden="true" />
        </div>

        <div className="mx-auto grid w-full max-w-content gap-10 px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pb-36 lg:pt-[max(7rem,16svh)]">
          {/* Copy */}
          <div {...hoverProps} className="relative max-w-xl lg:max-w-[min(36rem,calc(100%-460px))] xl:max-w-xl [text-shadow:0_1px_18px_rgb(0_0_0/0.35)]" aria-live={paused ? 'polite' : 'off'}>
            {/* Soft local scrim: darkens only behind the copy so the headline keeps ≥4.5:1 on bright photos */}
            <div className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[48px] bg-black/50 blur-2xl sm:-inset-x-12" aria-hidden="true" />
            <span className="hidden items-center gap-2 rounded-full border border-white/25 bg-black/25 sm:inline-flex px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm [text-shadow:none]">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Now riding across Lagos
            </span>

            <h1 key={`h-${index}`} className="text-[2.25rem] font-semibold sm:mt-5 leading-[1.05] tracking-tightest motion-safe:animate-fade-up sm:text-[3.25rem] lg:mt-6 xl:text-[3.75rem]">
              {slide.headline}
            </h1>
            <p key={`p-${index}`} className="mt-4 max-w-md text-base leading-relaxed text-white/90 motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-lg lg:mt-5">
              {slide.subhead}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-row lg:mt-8 [text-shadow:none]">
              <Link to={routes.rider} className="btn btn-primary btn-lg group/cta">
                Book a ride
                <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" strokeWidth={2} />
              </Link>
              <Link to={routes.driver} className="btn btn-lg border border-white/50 bg-black/15 text-white backdrop-blur-sm hover:border-white/80 hover:bg-white/10">
                Drive & earn
              </Link>
            </div>
          </div>

          {/* Desktop: narrower card (412px), aligned to the content's right edge and lowered so its
              top sits below the headline; it hangs ~80px past the hero's bottom edge. */}
          <div {...hoverProps} className="absolute bottom-[-80px] right-[max(2rem,calc((100vw-72rem)/2+2rem))] z-20 hidden w-[412px] lg:block">
            <div className="-rotate-1 transition-transform duration-300 ease-brand hover:rotate-0 motion-reduce:rotate-0">
              <BookingCard compact />
            </div>
          </div>
        </div>

        {/* Controls: kept on the left so the desktop card never covers them; raised on
            small screens to clear the overlapping booking card. */}
        <div className="absolute inset-x-0 bottom-0">
          <div {...hoverProps} className="mx-auto flex max-w-content items-center gap-3 px-4 pb-14 sm:px-6 lg:px-8 lg:pb-8">
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
                    {...controlProps}
                    className="group/dot flex h-6 items-center"
                  >
                    {/* Thin bar inside a 24px-tall hit area */}
                    <span className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 ease-brand ${active ? 'w-10 bg-white/30' : 'w-4 bg-white/45 group-hover/dot:bg-white/75'}`}>
                      {active && (
                        <span
                          // The interval restarts after a pause or manual navigation, so the bar restarts too
                          key={`bar-${index}-${paused}-${resetKey}`}
                          className={`absolute inset-0 origin-left rounded-full bg-white ${reduced ? '' : 'animate-progress'}`}
                          style={reduced ? undefined : { animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                        />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            <span className="font-mono text-xs tabular-nums text-white/80" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
            </span>

            <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
              <button
                type="button"
                onClick={toggleUserPaused}
                {...controlProps}
                className="btn btn-icon btn-sm border border-white/30 bg-black/20 text-white backdrop-blur-sm hover:bg-white/10"
                aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                title={userPaused ? 'Play' : 'Pause'}
              >
                {userPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={prev}
                {...controlProps}
                className="btn btn-icon btn-sm hidden border border-white/30 bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/10 focus-visible:opacity-100 group-hover/hero:opacity-100 sm:inline-flex"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                {...controlProps}
                className="btn btn-icon btn-sm hidden border border-white/30 bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/10 focus-visible:opacity-100 group-hover/hero:opacity-100 sm:inline-flex"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Phones/tablets: booking card overlaps the hero's bottom edge by 40px */}
      <div className="relative z-10 -mt-10 px-4 sm:px-6 lg:hidden">
        <div className="mx-auto max-w-md">
          <BookingCard />
        </div>
      </div>

      {/* Trust line: centred on small screens; on desktop it sits left, clear of the hanging card */}
      <div className="bg-canvas">
        <p className="mx-auto max-w-content px-4 py-6 text-center text-[13px] text-ink-muted sm:px-6 lg:px-8 lg:py-10 lg:pr-[460px] lg:text-left">
          <Star className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px fill-warning text-warning" strokeWidth={0} />
          {heroTrustLine}
        </p>
      </div>
    </>
  )
}
