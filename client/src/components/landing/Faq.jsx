import { ChevronDown, Mail } from 'lucide-react'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { faq, SUPPORT_EMAIL } from './landingContent'

/** Native <details>/<summary> accordion — keyboard accessible with no JS state. */
export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line bg-surface py-20 sm:py-28">
      <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered." body="Everything you need to know about riding and driving with RideLink." />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn-secondary mt-6">
            <Mail className="h-4 w-4" strokeWidth={1.75} /> Contact support
          </a>
        </Reveal>

        <Reveal className="divide-y divide-line border-y border-line">
          {faq.map((item, i) => (
            <details key={item.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-ink transition-colors hover:text-accent-text [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <p className="-mt-1 max-w-2xl pb-5 pr-10 text-sm leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
