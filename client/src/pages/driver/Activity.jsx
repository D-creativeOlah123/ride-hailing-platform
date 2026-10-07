import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History, Search, X, Wallet, CalendarDays, CalendarRange, CheckCircle2, ChevronRight,
  TrendingUp, TrendingDown, RotateCw, CircleAlert, SearchX, ArrowRight,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import BarChart from '../../components/BarChart'
import { StatCard, StatusBadge, SectionHeader, EmptyState, Skeleton, Avatar } from '../../components/ui'
import { naira, tripSummary, monthlySeries, monthOverMonth } from '../../utils/tripStats'
import API from '../../api'

const ACTIVE_STATUSES = ['requested', 'accepted', 'driver_arriving', 'trip_started']
const isActive = (t) => ACTIVE_STATUSES.includes(t.status)
const PAGE_SIZE = 15

const FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'completed', label: 'Completed', match: t => t.status === 'completed' },
  { key: 'cancelled', label: 'Cancelled', match: t => t.status === 'cancelled' },
  { key: 'active', label: 'Active', match: isActive },
]

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function cancelNote(trip) {
  if (trip.status !== 'cancelled' || !trip.cancelledBy) return null
  return trip.cancelledBy === 'driver' ? 'Cancelled by you' : `Cancelled by ${trip.cancelledBy}`
}

// Column template shared by the wide (md+) header and rows.
const WIDE_COLS = 'md:grid-cols-[7rem_minmax(0,1fr)_6rem_9.5rem_1rem]'

/** One trip. A stacked card on phones, a wide grid row from md up. Active trips are clickable. */
function TripRow({ trip, onOpen }) {
  const active = isActive(trip)
  const riderName = trip.rider?.name || 'Rider'
  const note = cancelNote(trip)
  const fare = trip.status === 'completed' && trip.fare
    ? naira(trip.fare)
    : <span className="font-normal text-ink-subtle" aria-label="No fare">—</span>

  const openHint = active && (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-accent-text">
      Open trip
      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
    </span>
  )

  const content = (
    <>
      {/* Phones: stacked card */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs text-ink-subtle tabular-nums">
            {formatDate(trip.createdAt)} · {formatTime(trip.createdAt)}
          </p>
          <StatusBadge status={trip.status} className="shrink-0" />
        </div>
        <div className="mt-3 flex min-w-0 items-center gap-2.5">
          <Avatar name={riderName} className="h-7 w-7 text-[11px]" />
          <span className="min-w-0 truncate text-sm font-medium text-ink">{riderName}</span>
        </div>
        <div className="relative mt-3 space-y-2">
          <span className="pointer-events-none absolute left-[3.5px] top-[9px] h-[calc(100%-18px)] w-px bg-line-strong" aria-hidden="true" />
          <div className="relative flex min-w-0 items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/15" />
            <span className="eyebrow w-12 shrink-0">From</span>
            <p className="min-w-0 truncate text-sm text-ink">{trip.pickupLocation}</p>
          </div>
          <div className="relative flex min-w-0 items-center gap-3">
            <span className="h-2 w-2 shrink-0 rounded-[2px] bg-ink" />
            <span className="eyebrow w-12 shrink-0">To</span>
            <p className="min-w-0 truncate text-sm text-ink">{trip.destination}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="text-[15px] font-semibold text-ink tabular-nums">{fare}</span>
          {openHint || (note && <span className="text-xs text-ink-subtle">{note}</span>)}
        </div>
      </div>

      {/* md and up: wide row */}
      <div className={`hidden md:grid ${WIDE_COLS} md:items-center md:gap-4`}>
        <div className="tabular-nums">
          <p className="text-sm text-ink">{formatDate(trip.createdAt)}</p>
          <p className="mt-0.5 text-xs text-ink-subtle">{formatTime(trip.createdAt)}</p>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={riderName} className="h-8 w-8 text-xs" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{riderName}</p>
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-ink-muted" title={`${trip.pickupLocation} → ${trip.destination}`}>
              <span className="min-w-0 truncate">{trip.pickupLocation}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-ink-subtle" strokeWidth={2} aria-label="to" />
              <span className="min-w-0 truncate">{trip.destination}</span>
            </p>
          </div>
        </div>
        <p className="text-right text-sm font-semibold text-ink tabular-nums">{fare}</p>
        <div className="min-w-0">
          <StatusBadge status={trip.status} />
          {note && <p className="mt-1 truncate text-xs text-ink-subtle">{note}</p>}
        </div>
        <span className="flex justify-end text-accent-text">
          {active && <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />}
        </span>
      </div>
    </>
  )

  const layout = 'block w-full px-5 py-4 text-left sm:px-6 md:py-3.5'

  return (
    <li>
      {active ? (
        <button
          type="button"
          onClick={() => onOpen(trip._id)}
          aria-label={`Open active trip with ${riderName}, ${trip.pickupLocation} to ${trip.destination}`}
          className={`group ${layout} bg-accent-soft/40 transition-colors hover:bg-accent-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent`}
        >
          {content}
        </button>
      ) : (
        <div className={layout}>{content}</div>
      )}
    </li>
  )
}

export default function DriverActivity() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Promise chain so state is only set in async callbacks.
  const fetchTrips = useCallback(() =>
    API.get('/trips/history')
      .then(res => {
        setTrips(Array.isArray(res.data) ? res.data : [])
        setError('')
      })
      .catch(err => {
        console.error(err)
        setError(err.response?.data?.message || 'We couldn’t load your trips. Check your connection and try again.')
      })
      .finally(() => setLoading(false)),
  [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const sorted = useMemo(
    () => [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [trips],
  )
  const summary = useMemo(() => tripSummary(trips), [trips])
  const series = useMemo(() => monthlySeries(trips, 6), [trips])
  const earningsChange = monthOverMonth(series, 'amount')
  const sixMonthTotal = series.reduce((s, m) => s + m.amount, 0)

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map(f => [f.key, trips.filter(f.match).length])),
    [trips],
  )

  const q = query.trim().toLowerCase()
  const filtered = sorted.filter(t => {
    if (!FILTERS.find(f => f.key === filter).match(t)) return false
    if (!q) return true
    return [t.rider?.name, t.pickupLocation, t.destination].some(v => v?.toLowerCase().includes(q))
  })
  const shown = filtered.slice(0, visible)

  const changeFilter = (key) => { setFilter(key); setVisible(PAGE_SIZE) }
  const changeQuery = (value) => { setQuery(value); setVisible(PAGE_SIZE) }
  const openTrip = (id) => navigate(`/driver/trip/${id}`)

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const stats = [
    { label: 'Earned today', value: naira(summary.today), icon: Wallet, hint: `${plural(summary.tripsToday, 'trip')} completed` },
    { label: 'This week', value: naira(summary.week), icon: CalendarDays, hint: `${plural(summary.tripsThisWeek, 'trip')} since Monday` },
    { label: 'This month', value: naira(summary.month), icon: CalendarRange, hint: `Since ${monthStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` },
    {
      label: 'Completed trips',
      value: summary.completed.toLocaleString(),
      icon: CheckCircle2,
      hint: summary.completionRate === null ? 'No finished trips yet' : `${summary.completionRate}% completion rate`,
      hintTone: summary.completionRate === null ? 'muted' : summary.completionRate >= 80 ? 'success' : summary.completionRate >= 50 ? 'warning' : 'danger',
    },
  ]

  const breakdown = [
    { label: 'Total trips', value: summary.total.toLocaleString() },
    { label: 'Completed', value: summary.completed.toLocaleString(), tone: 'text-success' },
    { label: 'Cancelled', value: summary.cancelled.toLocaleString(), tone: 'text-danger' },
    { label: 'Active now', value: summary.active.toLocaleString(), tone: summary.active ? 'text-accent-text' : 'text-ink' },
    { label: 'Completion rate', value: summary.completionRate === null ? '—' : `${summary.completionRate}%` },
    { label: 'Average fare', value: summary.completed ? naira(summary.averageFare) : '—' },
  ]

  const toolbar = (
    <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div className="-mx-1 flex max-w-full overflow-x-auto px-1">
        <div className="flex shrink-0 gap-1 rounded-lg border border-line bg-surface-2 p-1" role="tablist" aria-label="Filter trips by status">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => changeFilter(f.key)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors sm:px-3 ${
                filter === f.key
                  ? 'bg-surface text-ink shadow-xs ring-1 ring-line'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {f.label}
              <span className={`rounded px-1 text-[11px] tabular-nums ${filter === f.key ? 'bg-accent-soft text-accent-text' : 'bg-surface-3 text-ink-muted'}`}>
                {loading ? '–' : counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
        <label htmlFor="trip-search" className="sr-only">Search trips</label>
        <input
          id="trip-search"
          type="search"
          value={query}
          onChange={e => changeQuery(e.target.value)}
          placeholder="Search rider, pickup or destination"
          className="input h-9 pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => changeQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )

  const filterLabel = FILTERS.find(f => f.key === filter).label.toLowerCase()

  let list
  if (loading) {
    list = (
      <div className="space-y-2 p-5 sm:p-6" aria-busy="true" aria-label="Loading trips">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 md:h-14" />)}
      </div>
    )
  } else if (error && trips.length === 0) {
    list = (
      <EmptyState
        icon={CircleAlert}
        title="Trip history didn’t load"
        description={error}
        action={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); fetchTrips() }}>
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Try again
          </button>
        }
      />
    )
  } else if (trips.length === 0) {
    list = (
      <EmptyState
        icon={History}
        title="No trips yet"
        description="Trips you accept from your dashboard will appear here, along with the fare you earned on each one."
        action={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/driver/dashboard')}>
            Find trip requests
          </button>
        }
      />
    )
  } else if (filtered.length === 0) {
    list = (
      <EmptyState
        icon={SearchX}
        title={q ? `No trips match “${query.trim()}”` : `No ${filterLabel} trips`}
        description={q
          ? 'Try a different rider name or address, or clear the search.'
          : filter === 'active'
            ? 'You have no trip in progress right now.'
            : 'Trips with this status will show up here.'}
        action={(q || filter !== 'all') && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { changeQuery(''); changeFilter('all') }}>
            Show all trips
          </button>
        )}
      />
    )
  } else {
    list = (
      <>
        <div className={`hidden border-b border-line bg-surface-2/50 px-6 py-2.5 md:grid ${WIDE_COLS} md:gap-4`} aria-hidden="true">
          <span className="eyebrow">Date</span>
          <span className="eyebrow">Rider &amp; route</span>
          <span className="eyebrow text-right">Fare</span>
          <span className="eyebrow">Status</span>
          <span />
        </div>
        <ul className="divide-y divide-line">
          {shown.map(trip => <TripRow key={trip._id} trip={trip} onOpen={openTrip} />)}
        </ul>
        <div className="flex flex-col items-center gap-3 border-t border-line px-5 py-3.5 text-xs text-ink-subtle sm:flex-row sm:justify-between sm:px-6">
          <span className="tabular-nums">Showing {shown.length} of {plural(filtered.length, 'trip')}</span>
          {shown.length < filtered.length && (
            <button type="button" className="btn btn-secondary btn-sm w-full sm:w-auto" onClick={() => setVisible(v => v + PAGE_SIZE)}>
              Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
            </button>
          )}
        </div>
      </>
    )
  }

  return (
    <AppShell title="Trip History" subtitle="Every trip you’ve taken on, and what you earned from it.">
      <div className="space-y-6">
        {error && trips.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Earnings summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[72px] rounded-xl sm:h-32" />)
            : stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
          {/* Trips */}
          <section className="card min-w-0 overflow-hidden 2xl:col-span-2" aria-labelledby="trips-heading">
            <h2 id="trips-heading" className="sr-only">Trips</h2>
            {toolbar}
            {list}
          </section>

          {/* Insights */}
          <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-1 2xl:content-start">
            <section className="card card-pad min-w-0">
              <SectionHeader title="Earnings by month" description="Completed trips, last 6 months" />
              {loading ? (
                <Skeleton className="mt-5 h-52" />
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="stat-value">{naira(sixMonthTotal)}</p>
                    {earningsChange !== null && (
                      <p className={`flex items-center gap-1 text-xs ${earningsChange >= 0 ? 'text-success' : 'text-danger'}`}>
                        {earningsChange >= 0
                          ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                          : <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        {earningsChange >= 0 ? '+' : ''}{earningsChange}% vs last month
                      </p>
                    )}
                  </div>
                  <div className="mt-5">
                    <BarChart
                      data={series.map(m => ({ label: m.label, primary: m.amount }))}
                      primaryLabel="Earned"
                      format={naira}
                      emptyText="No earnings in the last 6 months"
                    />
                  </div>
                </>
              )}
            </section>

            <section className="card card-pad min-w-0">
              <SectionHeader title="All-time" description="Across every trip you’ve accepted" />
              {loading ? (
                <div className="mt-4 space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-5" />)}</div>
              ) : (
                <>
                  <dl className="mt-4 space-y-3 text-sm">
                    {breakdown.map(row => (
                      <div key={row.label} className="flex items-center justify-between gap-3">
                        <dt className="text-ink-muted">{row.label}</dt>
                        <dd className={`font-medium tabular-nums ${row.tone || 'text-ink'}`}>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <span className="text-sm text-ink-muted">Total earned</span>
                    <span className="text-base font-semibold text-accent-text tabular-nums">{naira(summary.amount)}</span>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
