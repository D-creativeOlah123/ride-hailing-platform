import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CarFront, TrendingUp, Flag } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, SectionHeader, EmptyState, Skeleton } from '../../components/ui'
import API from '../../api'

export default function RiderActivity() {
  const [trips, setTrips] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const res = await API.get('/trips/history')
      setTrips(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = trips.filter(t => {
    if (filter === 'completed') return t.status === 'completed'
    if (filter === 'cancelled') return t.status === 'cancelled'
    return true
  })

  const totalSpend = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.fare || 0), 0)

  const filterControl = (
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-line bg-surface-2 p-1" role="tablist" aria-label="Filter trips">
      {['all', 'completed', 'cancelled'].map(f => (
        <button key={f}
          type="button"
          role="tab"
          aria-selected={filter === f}
          onClick={() => setFilter(f)}
          className={`h-8 shrink-0 rounded-md px-3 text-[13px] font-medium capitalize transition-colors ${
            filter === f
              ? 'bg-surface text-ink shadow-xs ring-1 ring-line'
              : 'text-ink-muted hover:text-ink'
          }`}>
          {f}
        </button>
      ))}
    </div>
  )

  return (
    <AppShell
      title="Trip History"
      subtitle="Review and manage your past executive journeys."
      actions={filterControl}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trips */}
        <div className="min-w-0 lg:col-span-2">
          {loading ? (
            <div className="card space-y-2 p-5 sm:p-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card">
              <EmptyState icon={CarFront} title="No trips found." />
            </div>
          ) : (
            <ul className="card divide-y divide-line overflow-hidden">
              {filtered.map(trip => (
                <li key={trip._id} className="px-5 py-4 transition-colors hover:bg-surface-2/50 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-xs text-ink-subtle tabular-nums">
                      {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} •{' '}
                      {new Date(trip.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <StatusBadge status={trip.status} className="shrink-0" />
                  </div>

                  <div className="relative mt-3 space-y-2.5">
                    <span className="pointer-events-none absolute left-[3.5px] top-[10px] h-[calc(100%-20px)] w-px bg-line-strong" aria-hidden="true" />
                    <div className="relative flex min-w-0 items-center gap-3">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/15" />
                      <span className="eyebrow w-14 shrink-0">Pickup</span>
                      <p className="min-w-0 truncate text-sm text-ink">{trip.pickupLocation}</p>
                    </div>
                    <div className="relative flex min-w-0 items-center gap-3">
                      <span className="h-2 w-2 shrink-0 rounded-[2px] bg-ink" />
                      <span className="eyebrow w-14 shrink-0">Dropoff</span>
                      <p className="min-w-0 truncate text-sm text-ink">{trip.destination}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold text-ink tabular-nums">
                      {trip.fare ? `₦${trip.fare}` : '—'}
                    </span>
                    {trip.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => navigate('/rider/disputes')}
                        className="btn btn-secondary btn-sm">
                        <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Dispute
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Spend summary */}
        <div className="min-w-0 space-y-6">
          <section className="card card-pad">
            <p className="eyebrow">Total Spend</p>
            <p className="stat-value mt-3">₦{totalSpend.toLocaleString()}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />
              12% increase this month
            </p>
            <div className="mt-5 flex h-16 items-end gap-2 border-t border-line pt-4" aria-hidden="true">
              {[40, 65, 45, 80, 55, 90].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col justify-end overflow-hidden rounded-[3px] bg-accent/15" style={{ height: `${h * 0.6}px` }}>
                  <div className="w-full bg-accent" style={{ height: `${h * 0.3}px` }} />
                </div>
              ))}
            </div>
          </section>

          <section className="card card-pad">
            <SectionHeader title="Summary" />
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Total trips</dt>
                <dd className="font-medium text-ink tabular-nums">{trips.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Completed</dt>
                <dd className="font-medium text-success tabular-nums">{trips.filter(t => t.status === 'completed').length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Cancelled</dt>
                <dd className="font-medium text-danger tabular-nums">{trips.filter(t => t.status === 'cancelled').length}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
