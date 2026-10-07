import { trustBar } from './landingContent'

// Simple geometric marks for the fictional companies (no real brands).
const MARKS = [
  <circle key="c" cx="10" cy="10" r="7" />,
  <rect key="r" x="3" y="3" width="14" height="14" rx="3" />,
  <path key="t" d="M10 2.5 17.5 16h-15Z" />,
  <path key="d" d="M10 2 18 10 10 18 2 10Z" />,
  <path key="h" d="M6 3h8l4 7-4 7H6l-4-7Z" />,
  <path key="w" d="M2 14c2.5-6 5.5-6 8 0s5.5 6 8 0" fill="none" strokeWidth="2.5" />,
]

function Wordmark({ name, i }) {
  return (
    <span className="flex shrink-0 items-center gap-2 text-ink-subtle transition-colors hover:text-ink-muted">
      <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current stroke-current" aria-hidden="true">{MARKS[i % MARKS.length]}</svg>
      <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">{name}</span>
    </span>
  )
}

export default function TrustBar() {
  const { label, companies } = trustBar
  return (
    <section className="border-y border-line bg-surface" aria-label={label}>
      <div className="mx-auto flex max-w-content flex-col items-center gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
        <p className="eyebrow shrink-0">{label}</p>

        {/* Desktop: static row */}
        <ul className="hidden flex-1 items-center justify-between gap-6 lg:flex">
          {companies.map((c, i) => <li key={c}><Wordmark name={c} i={i} /></li>)}
        </ul>

        {/* Mobile/tablet: marquee (static, scrollable row when reduced motion is on) */}
        <div className="relative w-full overflow-hidden lg:hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <ul className="flex w-max gap-10 pr-10 motion-safe:animate-marquee motion-reduce:w-full motion-reduce:overflow-x-auto">
            {[...companies, ...companies].map((c, i) => (
              <li key={i} aria-hidden={i >= companies.length}><Wordmark name={c} i={i} /></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
