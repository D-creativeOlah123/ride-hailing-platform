import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CarFront, TrendingUp, TrendingDown, Minus, Flag } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, SectionHeader, EmptyState, Skeleton } from '../../components/ui'
import API from '../../api'
import { naira, tripSummary, monthlySeries, monthOverMonth } from '../../utils/tripStats'

export default function RiderActivity() {
  const [trips, setTrips] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Promise chain so state is only set in async callbacks.
  const fetchTrips = useCallback(() =>
    API.get('/trips/history')
      .then(res => setTrips(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false)),
  [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const filtered = trips.filter(t => {
    if (filter === 'completed') return t.status === 'completed'
    if (filter === 'cancelled') return t.status === 'cancelled'
    return true
  })

  const summary = tripSummary(trips)
  const series = monthlySeries(trips, 6)
  const spendChange = monthOverMonth(series, 'amount')
  const maxAmount = Math.max(0, ...series.map(m => m.amount))
  const TrendIcon = spendChange > 0 ? TrendingUp : spendChange < 0 ? TrendingDown : Minus
  const chartLabel = `Spend over the last 6 months: ${series.map(m => `${m.label} ${naira(m.amount)}`).join(', ')}`

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
                      {trip.fare ? naira(trip.fare) : '—'}
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
            <p className="stat-value mt-3">{naira(summary.amount)}</p>
            {spendChange !== null && (
              <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
                <TrendIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {spendChange === 0
                  ? 'Same as last month'
                  : `${Math.abs(spendChange)}% ${spendChange > 0 ? 'more' : 'less'} than last month`}
              </p>
            )}
            <div className="mt-5 border-t border-line pt-4">
              <div className="flex h-16 items-end gap-2" role="img" aria-label={chartLabel}>
                {series.map(m => (
                  <div key={m.key} className="flex h-full flex-1 flex-col justify-end overflow-hidden rounded-[3px] bg-accent/15" title={`${m.label}: ${naira(m.amount)}`}>
                    <div
                      className="w-full bg-accent"
                      style={{ height: maxAmount ? `${(m.amount / maxAmount) * 100}%` : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex gap-2" aria-hidden="true">
                {series.map(m => (
                  <span key={m.key} className="flex-1 text-center text-2xs text-ink-subtle">{m.label}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="card card-pad">
            <SectionHeader title="Summary" />
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Total trips</dt>
                <dd className="font-medium text-ink tabular-nums">{summary.total}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Completed</dt>
                <dd className="font-medium text-success tabular-nums">{summary.completed}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Cancelled</dt>
                <dd className="font-medium text-danger tabular-nums">{summary.cancelled}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
