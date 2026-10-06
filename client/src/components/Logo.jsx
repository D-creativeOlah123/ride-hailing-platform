import { Link } from 'react-router-dom'

export function LogoMark({ className = 'h-7 w-7' }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-accent text-white ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 17V13a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3V6" />
        <circle cx="6" cy="18" r="2.25" fill="currentColor" stroke="none" />
        <circle cx="18" cy="6" r="2.25" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 rounded-md ${className}`} aria-label="RideLink home">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-ink">RideLink</span>
    </Link>
  )
}
