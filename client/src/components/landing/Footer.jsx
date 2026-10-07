import { Link } from 'react-router-dom'
import { Globe, Mail } from 'lucide-react'
import Logo from '../Logo'
import { footerColumns, SUPPORT_EMAIL } from './landingContent'

// Simple monochrome glyphs (lucide no longer ships brand icons).
const SOCIAL = [
  { name: 'X', d: 'M4 4h4.6l4 5.6L17.4 4H20l-6.2 7.2L20.5 20h-4.6l-4.3-6-5.2 6H3.8l6.6-7.6Z' },
  { name: 'Instagram', d: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm4.5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm5-3.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z' },
  { name: 'LinkedIn', d: 'M4 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h3v12H3Zm6 0h2.9v1.7c.5-.9 1.7-2 3.6-2 3.4 0 4.5 2.1 4.5 5.5V21h-3v-6.1c0-1.6-.3-3-2.1-3s-2.4 1.4-2.4 2.9V21H9Z' },
  { name: 'Facebook', d: 'M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21Z' },
]

function FooterLink({ link }) {
  const cls = 'text-sm text-ink-muted transition-colors hover:text-ink'
  return link.to
    ? <Link to={link.to} className={cls}>{link.label}</Link>
    : <a href={link.href} className={cls}>{link.label}</a>
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">Precision in Motion. Premium rides across Lagos, day and night.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-5 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink">
            <Mail className="h-4 w-4" strokeWidth={1.75} /> {SUPPORT_EMAIL}
          </a>
          <ul className="mt-6 flex gap-2" aria-label="Social media (coming soon)">
            {SOCIAL.map(s => (
              <li key={s.name}>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-subtle"
                  title={`RideLink on ${s.name} — coming soon`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d={s.d} /></svg>
                  <span className="sr-only">RideLink on {s.name} (coming soon)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Footer">
          {footerColumns.map(col => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold text-ink">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map(l => <li key={l.label}><FooterLink link={l} /></li>)}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RideLink. All rights reserved.</p>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-line px-3 py-1 sm:self-auto">
            <Globe className="h-3.5 w-3.5" strokeWidth={1.75} /> Nigeria · English
          </span>
        </div>
      </div>
    </footer>
  )
}
