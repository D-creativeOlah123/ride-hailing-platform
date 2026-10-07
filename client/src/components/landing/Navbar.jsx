import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { LogoMark } from '../Logo'
import ThemeToggle from '../ThemeToggle'
import { navLinks, routes } from './landingContent'

/**
 * Transparent over the hero (white text); after 24px of scroll it becomes a
 * blurred canvas bar and shrinks from 72px to 60px. Mobile: full-height sheet.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const solid = scrolled || open
  const linkTone = solid ? 'text-ink-muted hover:text-ink' : 'text-white/80 hover:text-white'

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height] duration-300 ease-brand ${
        solid ? 'h-[60px] border-b border-line bg-canvas/80 backdrop-blur-md' : 'h-[72px] border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5 rounded-md" aria-label="RideLink home">
          <LogoMark />
          <span className={`text-[15px] font-semibold tracking-tight transition-colors ${solid ? 'text-ink' : 'text-white'}`}>RideLink</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className={`rounded-md px-3 py-2 text-sm transition-colors ${linkTone}`}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle className={solid ? '' : 'text-white/85 hover:bg-white/10 hover:text-white'} />
          <Link
            to={routes.login}
            className={`btn hidden sm:inline-flex ${solid ? 'btn-ghost' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}
          >
            Sign In
          </Link>
          <Link to={routes.rider} className="btn btn-primary btn-sm hidden h-9 sm:inline-flex">
            Get Started
          </Link>
          <button
            type="button"
            className={`btn btn-icon lg:hidden ${solid ? 'btn-ghost' : 'text-white hover:bg-white/10'}`}
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

    </header>

    {/* Rendered outside <header>: its backdrop-filter would otherwise trap this fixed panel */}
      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-[60px] z-40 animate-fade-in overflow-y-auto bg-canvas lg:hidden">
          <nav className="mx-auto flex max-w-content flex-col px-4 py-4 sm:px-6" aria-label="Mobile">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-line py-4 text-lg font-medium text-ink"
              >
                {l.label}
                <ArrowRight className="h-4 w-4 text-ink-subtle" />
              </a>
            ))}
            <div className="mt-6 grid gap-3">
              <Link to={routes.rider} className="btn btn-primary btn-lg">Book a ride</Link>
              <Link to={routes.driver} className="btn btn-secondary btn-lg">Drive & earn</Link>
              <Link to={routes.login} className="btn btn-ghost btn-lg">Sign In</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
