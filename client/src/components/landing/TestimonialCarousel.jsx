import { useEffect, useState } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { useCarousel, useReducedMotion } from './useCarousel'
import { testimonials } from './landingContent'

/** Cards visible at once: 1 on phones, 2 on md, 3 on lg. */
function usePerView() {
  const get = () => (window.matchMedia('(min-width: 1024px)').matches ? 3 : window.matchMedia('(min-width: 768px)').matches ? 2 : 1)
  const [perView, setPerView] = useState(() => (typeof window === 'undefined' ? 1 : get()))
  useEffect(() => {
    const queries = ['(min-width: 768px)', '(min-width: 1024px)'].map(q => window.matchMedia(q))
    const onChange = () => setPerView(get())
    queries.forEach(q => q.addEventListener('change', onChange))
    return () => queries.forEach(q => q.removeEventListener('change', onChange))
  }, [])
  return perView
}

export default function TestimonialCarousel() {
  const reduced = useReducedMotion()
  const perView = usePerView()
  const positions = Math.max(1, testimonials.length - perView + 1)
  const { index, goTo, next, prev, bind, hoverProps, controlProps } = useCarousel({ count: positions, interval: 7000 })
  const current = Math.min(index, positions - 1)

  return (
    <section className="overflow-hidden border-t border-line bg-canvas py-20 sm:py-28" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div id="testimonials-heading">
            <SectionHeading eyebrow="Testimonials" title="Lagos rides with RideLink." body="Riders and drivers on what changed for them." />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} {...controlProps} className="btn btn-secondary btn-icon" aria-label="Previous testimonials">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={next} {...controlProps} className="btn btn-secondary btn-icon" aria-label="Next testimonials">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>

        <div
          className="mt-10"
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          {...bind}
          {...hoverProps}
        >
          {/* Track (clipped to the content width): card width per breakpoint leaves the next card peeking in */}
          <div className="-m-2 overflow-hidden p-2">
          <ul
            className={`flex gap-[var(--gap)] [--card:86%] [--gap:1rem] md:[--card:47%] lg:[--card:30.5%] lg:[--gap:1.5rem] ${reduced ? '' : 'transition-transform duration-500 ease-brand'}`}
            style={{ transform: `translateX(calc(${current} * -1 * (var(--card) + var(--gap))))` }}
          >
            {testimonials.map((t, i) => {
              const visible = i >= current && i < current + perView
              return (
                <li
                  key={t.name}
                  className="card flex w-[var(--card)] shrink-0 flex-col p-6 sm:p-7"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${testimonials.length}`}
                  aria-hidden={!visible}
                  inert={!visible}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-warning text-warning" strokeWidth={0} />)}
                    </div>
                    <span className="badge badge-success"><BadgeCheck className="h-3.5 w-3.5" /> Verified ride</span>
                  </div>
                  <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-ink">“{t.quote}”</blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                    <Photo image={t.image} sizes="48px" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-surface-2" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{t.name}</p>
                      <p className="truncate text-[13px] text-ink-muted">{t.role}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          </div>

          {positions > 1 && (
            <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Choose testimonials">
              {Array.from({ length: positions }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => goTo(i)}
                  {...controlProps}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-accent' : 'w-3 bg-line-strong hover:bg-ink-subtle'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
