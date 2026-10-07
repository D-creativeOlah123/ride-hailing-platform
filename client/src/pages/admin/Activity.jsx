import { useEffect, useMemo, useState } from 'react'
import { Search, CarFront, RefreshCw } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, PaymentBadge, EmptyState, Skeleton, Avatar } from '../../components/ui'
import API from '../../api'
import { rideTypeLabel } from '../../components/payments/paystack'

/** Paid / Awaiting payment for completed trips, a dash otherwise. */
function Payment({ trip }) {
  if (trip.status !== 'completed') return <span className="text-ink-subtle" aria-label="Not applicable">—</span>
  return <PaymentBadge trip={trip} />
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const ACTIVE = ['requested', 'accepted', 'driver_arriving', 'trip_started']

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function Person({ person, role }) {
  if (!person) return <span className="text-sm text-ink-subtle">{role === 'Driver' ? 'Not assigned' : '—'}</span>
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar name={person.name} className="h-7 w-7 text-2xs" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{person.name}</p>
        <p className="truncate text-xs text-ink-subtle">{person.phone || person.email}</p>
      </div>
    </div>
  )
}

function Route({ trip }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="flex min-w-0 items-center gap-2 text-sm text-ink">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        <span className="truncate">{trip.pickupLocation}</span>
      </p>
      <p className="flex min-w-0 items-center gap-2 text-sm text-ink">
        <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-ink" />
        <span className="truncate">{trip.destination}</span>
      </p>
    </div>
  )
}

export default function AdminActivity() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const fetchData = () =>
    API.get('/admin/trips')
      .then(res => { setTrips(res.data); setError('') })
      .catch(err => setError(err.response?.data?.message || 'Could not load trips'))
      .finally(() => setLoading(false))

  const load = () => {
    setLoading(true)
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  const counts = useMemo(() => ({
    all: trips.length,
    active: trips.filter(t => ACTIVE.includes(t.status)).length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
  }), [trips])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return trips.filter(t => {
      if (filter === 'active' && !ACTIVE.includes(t.status)) return false
      if (filter === 'completed' && t.status !== 'completed') return false
      if (filter === 'cancelled' && t.status !== 'cancelled') return false
      if (!q) return true
      return [t.pickupLocation, t.destination, t.rider?.name, t.rider?.email, t.driver?.name, t.driver?.email]
        .some(v => v?.toLowerCase().includes(q))
    })
  }, [trips, filter, query])

  return (
    <AppShell
      title="Platform Activity"
      subtitle="Every trip on RideLink, newest first."
      actions={
        <button type="button" onClick={load} disabled={loading} className="btn btn-secondary">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} /> Refresh
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-surface p-1 shadow-xs [scrollbar-width:none]" role="tablist">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors ${
                filter === f.key ? 'bg-surface-2 text-ink ring-1 ring-inset ring-line dark:bg-surface-3' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {f.label}
              <span className="text-xs tabular-nums text-ink-subtle">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
          <label htmlFor="trip-search" className="sr-only">Search trips</label>
          <input
            id="trip-search"
            type="search"
            placeholder="Search rider, driver or place"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input h-10 pl-10"
          />
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4" role="alert">{error}</div>}

      <section className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-5">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={CarFront}
            title={trips.length === 0 ? 'No trips yet' : 'No matching trips'}
            description={trips.length === 0 ? 'Trips will appear here as soon as riders start booking.' : 'Try a different filter or search.'}
          />
        ) : (
          <>
            {/* Phones: stacked list */}
            <ul className="divide-y divide-line md:hidden">
              {visible.map(trip => (
                <li key={trip._id} className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-ink-subtle">{formatDate(trip.createdAt)}</span>
                    <StatusBadge status={trip.status} />
                  </div>
                  <Route trip={trip} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <p className="eyebrow mb-1.5">Rider</p>
                      <Person person={trip.rider} role="Rider" />
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow mb-1.5">Driver</p>
                      <Person person={trip.driver} role="Driver" />
                    </div>
                  </div>
                  {(trip.fare != null || trip.status === 'completed') && (
                    <div className="flex flex-wrap items-center gap-2">
                      {trip.fare != null && (
                        <p className="text-sm font-semibold text-ink tabular-nums">₦{trip.fare.toLocaleString()}</p>
                      )}
                      {rideTypeLabel(trip.rideType) && (
                        <span className="text-xs text-ink-subtle">{rideTypeLabel(trip.rideType)}</span>
                      )}
                      <PaymentBadge trip={trip} />
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* md and up: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="table-head">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Route</th>
                    <th className="px-5 py-3 font-medium">Rider</th>
                    <th className="px-5 py-3 font-medium">Driver</th>
                    <th className="px-5 py-3 text-right font-medium">Fare</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(trip => (
                    <tr key={trip._id} className="table-row align-middle">
                      <td className="whitespace-nowrap px-5 py-3.5 text-ink-muted">{formatDate(trip.createdAt)}</td>
                      <td className="max-w-[240px] px-5 py-3.5"><Route trip={trip} /></td>
                      <td className="max-w-[180px] px-5 py-3.5"><Person person={trip.rider} role="Rider" /></td>
                      <td className="max-w-[180px] px-5 py-3.5"><Person person={trip.driver} role="Driver" /></td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium text-ink tabular-nums">
                        {trip.fare != null ? `₦${trip.fare.toLocaleString()}` : '—'}
                        {rideTypeLabel(trip.rideType) && (
                          <span className="block text-xs font-normal text-ink-subtle">{rideTypeLabel(trip.rideType)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={trip.status} /></td>
                      <td className="whitespace-nowrap px-5 py-3.5"><Payment trip={trip} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="border-t border-line px-5 py-3 text-xs text-ink-subtle">
              Showing {visible.length} of {trips.length} trip{trips.length === 1 ? '' : 's'}
              {trips.length >= 300 && ' (most recent 300)'}
            </p>
          </>
        )}
      </section>
    </AppShell>
  )
}
