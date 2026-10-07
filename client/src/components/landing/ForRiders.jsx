import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Wallet, Headset, ArrowRight, CheckCircle2 } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import { forRiders, routes } from './landingContent'

const ICONS = { Zap, ShieldCheck, Wallet, Headset }

export default function ForRiders() {
  const { image, notification, benefits } = forRiders

  return (
    <section id="riders" className="scroll-mt-20 border-t border-line bg-canvas py-20 sm:py-28">
      <div className="mx-auto grid max-w-content items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Photo with floating notification */}
        <Reveal className="relative">
          <div className="overflow-hidden rounded-2xl border border-line shadow-raised">
            <Photo
              image={image}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
            />
          </div>
          <div className="card absolute -bottom-6 left-4 right-4 flex items-center gap-3 p-4 shadow-overlay sm:left-6 sm:right-auto sm:w-80">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{notification.title}</p>
              <p className="truncate text-[13px] text-ink-muted">{notification.body}</p>
            </div>
          </div>
        </Reveal>

        {/* Copy + benefits */}
        <div className="pt-6 lg:pt-0">
          <Reveal>
            <SectionHeading eyebrow={forRiders.eyebrow} title={forRiders.headline} body={forRiders.body} />
          </Reveal>

          <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {benefits.map((b, i) => {
              const Icon = ICONS[b.icon]
              return (
                <Reveal as="li" key={b.title} delay={i * 80}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-accent-text shadow-xs">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{b.body}</p>
                </Reveal>
              )
            })}
          </ul>

          <Link to={routes.rider} className="btn btn-primary btn-lg mt-10 group/cta">
            Get your first ride
            <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
