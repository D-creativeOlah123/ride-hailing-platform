import { Check, ShieldCheck } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import { safety } from './landingContent'

/**
 * Dark band in both themes: ink background in light mode, surface in dark mode.
 * Colours below are paired (light / dark:) because the band inverts in light mode.
 */
export default function SafetySection() {
  return (
    <section id="safety" className="scroll-mt-20 bg-ink py-20 text-canvas dark:border-t dark:border-line dark:bg-surface dark:text-ink sm:py-28">
      <div className="mx-auto grid max-w-content items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal className="relative">
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 dark:ring-line">
            <Photo
              image={safety.image}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {/* Stat badge */}
          <div className="absolute -bottom-6 right-4 flex items-center gap-3 rounded-xl bg-canvas px-4 py-3 text-ink shadow-overlay ring-1 ring-black/5 dark:bg-surface-2 dark:ring-line sm:right-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xl font-semibold leading-none tracking-tight tabular-nums">{safety.stat.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{safety.stat.label}</p>
            </div>
          </div>
        </Reveal>

        <div className="pt-4 lg:pt-0">
          <Reveal>
            <p className="eyebrow mb-3 text-[#9db4ff] dark:text-accent-text">{safety.eyebrow}</p>
            <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.25rem]">{safety.headline}</h2>
            <p className="mt-3 text-base leading-relaxed text-canvas/75 dark:text-ink-muted">{safety.body}</p>
          </Reveal>

          <ul className="mt-8 divide-y divide-white/10 border-y border-white/10 dark:divide-line dark:border-line">
            {safety.items.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 70} className="flex items-center gap-3 py-3.5 text-[15px]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20 text-[#5fe0aa] dark:bg-success/15 dark:text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                {item}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
