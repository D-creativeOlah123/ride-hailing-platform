import Photo from './Photo'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { howItWorks } from './landingContent'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow={howItWorks.eyebrow} title={howItWorks.headline} />
        </Reveal>

        <ol className="relative mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {howItWorks.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 120} className="relative">
              <div className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-card">
                <Photo
                  image={step.image}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <div className="relative -mt-6 ml-5 flex items-center">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-surface bg-accent font-mono text-sm font-semibold text-white shadow-raised">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Dotted connector to the next step's badge (desktop) */}
                {i < howItWorks.steps.length - 1 && (
                  <span className="absolute left-14 right-[-3.25rem] top-1/2 hidden border-t-2 border-dashed border-line-strong md:block" aria-hidden="true" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
