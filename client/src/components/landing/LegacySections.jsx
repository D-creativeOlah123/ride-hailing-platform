// TEMPORARY: the previous landing page's lower sections, kept so the page stays complete
// while the redesign is built phase by phase. Replaced and deleted in Phase 4.
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Logo from '../Logo'
import { Avatar } from '../ui'

const testimonials = [
  { name: 'James Cooling', role: 'Executive', text: 'The most professional ride service I have ever used. Always on time, always clean, always perfect.' },
  { name: 'Sarah Chen', role: 'Consultant', text: 'RideLink has completely changed how I commute. The drivers are courteous and the app is flawless.' },
  { name: 'Marcus Thomas', role: 'Entrepreneur', text: 'Reliable, fast, and premium. Exactly what a busy professional needs. Highly recommended.' },
]

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow mb-3 text-accent-text">{eyebrow}</p>
      <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.25rem]">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-ink-muted">{description}</p>}
    </div>
  )
}


export default function LegacySections() {
  return (
    <>
    {/* Testimonials */}
    <section id="testimonials" className="scroll-mt-16 border-t border-line bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Testimonials"
          title="What Our Elite Riders Say"
          description="Join millions of professionals who rely on RideLink every day."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-xl border border-line bg-canvas p-6 dark:bg-surface-2/50">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <Avatar name={t.name} className="h-9 w-9 text-xs" />
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-subtle">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-accent px-6 dark:bg-accent/90 py-12 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, #000, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, #000, transparent)',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2.25rem]">Ready to Ride in Style?</h2>
            <p className="mx-auto mt-3 max-w-md text-base text-white/75">
              Join thousands of professionals who trust RideLink for their daily commute.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register/rider" className="btn btn-lg bg-white font-semibold text-[#1847c4] shadow-xs hover:bg-white/90">
                Get Started Free
              </Link>
              <Link to="/register/driver" className="btn btn-lg border border-white/30 text-white hover:bg-white/10">
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-[13px] text-ink-subtle">Precision in Motion.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted" aria-label="Footer">
          <a href="mailto:eyinjueledumareadeyosola@gmail.com" className="hover:text-ink">Support</a>
          <a href="#" className="hover:text-ink">Safety</a>
          <a href="/terms" className="hover:text-ink">Legal</a>
          <a href="/privacy" className="hover:text-ink">Privacy</a>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-content px-4 py-5 text-xs text-ink-subtle sm:px-6 lg:px-8">
          © {new Date().getFullYear()} RideLink. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  )
}
