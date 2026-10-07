// TEMPORARY: the previous landing page's lower sections, kept so the page stays complete
// while the redesign is built phase by phase. Replaced and deleted in Phase 4.
import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, CreditCard, Headset, Star } from 'lucide-react'
import Logo from '../Logo'
import { Avatar } from '../ui'

const features = [
  { icon: Zap, title: 'Fast Pickup', desc: 'Average pickup time under 3 minutes in premium zones.' },
  { icon: ShieldCheck, title: 'Safe Rides', desc: 'All drivers verified with background checks and ratings.' },
  { icon: CreditCard, title: 'Easy Payment', desc: 'Seamless billing with corporate and personal accounts.' },
  { icon: Headset, title: '24/7 Support', desc: 'Round the clock assistance for riders and drivers.' },
]

const steps = [
  { num: '01', title: 'Select Destination', desc: 'Enter your pickup location and destination. Our system finds the best route instantly.' },
  { num: '02', title: 'Real-time Matching', desc: 'We match you with the nearest available premium driver within seconds.' },
  { num: '03', title: 'Enjoy the Journey', desc: 'Sit back and relax. Track your ride live and arrive at your destination safely.' },
]

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
    {/* Features */}
    <section id="features" className="scroll-mt-16 border-t border-line bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Features"
          title="Engineered for Excellence"
          description="Built from the ground up for riders who value their time, safety, and comfort above all else."
        />
        <div className="mt-12 grid overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 [&>*]:bg-surface gap-px">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 sm:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-accent-text">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-[15px] font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" className="scroll-mt-16 border-t border-line py-20 sm:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="How it works"
          title="Seamless in Three Steps"
          description="Getting around has never been this simple."
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((step) => (
            <li key={step.num} className="card card-pad relative">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-medium text-accent-text">{step.num}</span>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-[17px] font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

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
