// Shared building blocks used across the app pages.
// Styling primitives (.btn, .card, .input, .badge…) live in src/index.css.

const STATUS_STYLES = {
  // trips
  requested: { tone: 'warning', label: 'Requested' },
  accepted: { tone: 'accent', label: 'Accepted' },
  driver_arriving: { tone: 'accent', label: 'Driver arriving' },
  trip_started: { tone: 'accent', label: 'In progress' },
  completed: { tone: 'success', label: 'Completed' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
  // disputes
  open: { tone: 'warning', label: 'Open' },
  under_review: { tone: 'accent', label: 'Under review' },
  escalated: { tone: 'danger', label: 'Escalated' },
  resolved: { tone: 'success', label: 'Resolved' },
  // drivers
  approved: { tone: 'success', label: 'Approved' },
  pending: { tone: 'warning', label: 'Pending' },
}

// Full class names so Tailwind can find them.
const TONE_CLASS = {
  neutral: 'badge-neutral',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
}

const humanize = (s = '') => s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

export function StatusBadge({ status, label, className = '' }) {
  const style = STATUS_STYLES[status] || { tone: 'neutral', label: humanize(status) }
  return (
    <span className={`badge badge-dot ${TONE_CLASS[style.tone]} ${className}`}>
      {label || style.label}
    </span>
  )
}

export function StatCard({ label, value, hint, hintTone = 'muted', icon: Icon }) {
  const hintColor = {
    muted: 'text-ink-subtle',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    accent: 'text-accent-text',
  }[hintTone]

  // Phones: compact row (label + hint left, value right). sm and up: stacked card.
  return (
    <div className="card flex items-center gap-4 p-4 sm:block sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink-muted">{label}</span>
          {Icon && (
            <span className="hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted sm:flex">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
          )}
        </div>
        <p className="stat-value mt-4 hidden sm:block">{value}</p>
        {hint && <p className={`mt-1 text-xs sm:mt-2 ${hintColor}`}>{hint}</p>}
      </div>
      <p className="stat-value shrink-0 text-2xl sm:hidden">{value}</p>
    </div>
  )
}

export function SectionHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink-subtle">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
    </svg>
  )
}

export function Skeleton({ className = 'h-14' }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />
}

/** Small neutral label for features that aren't available yet. */
export function ComingSoon({ className = '' }) {
  return <span className={`badge badge-neutral whitespace-nowrap text-[11px] ${className}`}>Coming soon</span>
}

export function Avatar({ name = '', className = 'h-8 w-8 text-xs' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-text ring-1 ring-inset ring-accent/15 ${className}`}>
      {initials}
    </span>
  )
}
