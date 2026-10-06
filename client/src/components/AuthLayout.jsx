import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

/**
 * Layout for the public auth pages (login, register).
 * Props: title, subtitle, children (form), footer (content under the card), width ('md' | 'lg')
 */
export default function AuthLayout({ title, subtitle, children, footer, width = 'md' }) {
  const maxW = width === 'lg' ? 'max-w-xl' : 'max-w-[420px]'

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-70 dark:opacity-50" aria-hidden="true" />

      <header className="relative">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-1">
            <a href="/#how-it-works" className="hidden rounded-md px-3 py-2 text-sm text-ink-muted hover:text-ink sm:block">How it works</a>
            <a href="#" className="hidden rounded-md px-3 py-2 text-sm text-ink-muted hover:text-ink sm:block">Support</a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 items-start justify-center px-4 pb-16 pt-8 sm:items-center sm:px-6 sm:pt-12">
        <div className={`w-full ${maxW}`}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>}
          </div>

          <div className="card p-6 shadow-raised sm:p-8">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
        </div>
      </main>

      <footer className="relative border-t border-line">
        <div className="mx-auto flex max-w-content flex-col items-center gap-3 px-4 py-5 text-xs text-ink-subtle sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RideLink. Precision in Motion.</p>
          <nav className="flex gap-5" aria-label="Footer">
            <a href="#" className="hover:text-ink">Privacy Policy</a>
            <a href="#" className="hover:text-ink">Terms of Service</a>
            <a href="#" className="hover:text-ink">Support</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
