import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

/**
 * Layout for every signed-in page.
 * - lg and up: fixed sidebar on the left.
 * - below lg: compact top bar with a menu button that opens the sidebar as a drawer.
 *
 * Props:
 *   title, subtitle  page heading (title may be a node)
 *   actions          optional buttons shown beside the heading
 *   children         page content
 */
export default function AppShell({ title, subtitle, actions, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close the drawer on navigation.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Escape closes the drawer; lock page scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-canvas lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-in border-r border-line shadow-overlay">
            <Sidebar onClose={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
          <div className="flex h-14 items-center gap-2 px-4 sm:px-6 lg:h-16 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="btn btn-ghost btn-icon -ml-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <Logo className="lg:hidden" />
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {(title || actions) && (
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                {title && <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-content flex-col gap-2 px-4 py-5 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} RideLink. Precision in Motion.</p>
            <nav className="flex gap-5" aria-label="Footer">
              <a href="mailto:eyinjueledumareadeyosola@gmail.com" className="hover:text-ink">Support</a>
              <a href="#" className="hover:text-ink">Safety</a>
              <a href="/terms" className="hover:text-ink">Legal</a>
              <a href="/privacy" className="hover:text-ink">Privacy</a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  )
}
