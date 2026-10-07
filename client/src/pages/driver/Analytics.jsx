import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CarFront, Wallet, Receipt, CheckCircle2, CircleAlert, RotateCw } from 'lucide-react'
import AppShell from '../../components/AppShell'
import BarChart, { ChartLegend } from '../../components/BarChart'
import { StatCard, SectionHeader, Skeleton, EmptyState } from '../../components/ui'
import { naira, tripSummary, monthlySeries, monthOverMonth } from '../../utils/tripStats'
import API from '../../api'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** "+12% vs last month" from a computed change, or undefined when there is no baseline. */
function changeHint(change) {
  if (change === null) return undefined
  return { hint: `${change >= 0 ? '+' : ''}${change}% vs last month`, hintTone: change >= 0 ? 'success' : 'danger' }
}

const pct = (part, whole) => (whole ? (part / whole) * 100 : 0)

export default function DriverAnalytics() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Promise chain so state is only set in async callbacks.
  const fetchTrips = useCallback(() =>
    API.get('/trips/history')
      .then(res => {
        setTrips(Array.isArray(res.data) ? res.data : [])
        setError('')
      })
      .catch(err => {
        console.error(err)
        setError(err.response?.data?.message || 'We couldn’t load your trip history.')
      })
      .finally(() => setLoading(false)),
  [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const summary = useMemo(() => tripSummary(trips), [trips])
  const series = useMemo(() => monthlySeries(trips, 12), [trips])
  const yearEarnings = series.reduce((s, m) => s + m.amount, 0)
  const yearTrips = series.reduce((s, m) => s + m.trips, 0)
  const bestMonth = series.reduce((best, m) => (m.amount > (best?.amount || 0) ? m : best), null)

  // Busiest weekday by completed trips (only when there are any).
  const busiestDay = useMemo(() => {
    const counts = Array(7).fill(0)
    trips.filter(t => t.status === 'completed').forEach(t => { counts[new Date(t.createdAt).getDay()]++ })
    const max = Math.max(...counts)
    return max > 0 ? WEEKDAYS[counts.indexOf(max)] : null
  }, [trips])

  const finished = summary.completed + summary.cancelled

  const stats = [
    { label: 'Total trips', value: summary.total.toLocaleString(), icon: CarFront, ...changeHint(monthOverMonth(series, 'trips')) },
    { label: 'Total earned', value: naira(summary.amount), icon: Wallet, ...changeHint(monthOverMonth(series, 'amount')) },
    {
      label: 'Average fare',
      value: summary.completed ? naira(summary.averageFare) : '—',
      icon: Receipt,
      hint: summary.completed ? `Across ${summary.completed.toLocaleString()} completed trip${summary.completed === 1 ? '' : 's'}` : 'No completed trips yet',
    },
    {
      label: 'Completion rate',
      value: summary.completionRate === null ? '—' : `${summary.completionRate}%`,
      icon: CheckCircle2,
      hint: finished ? `${summary.completed} of ${finished} finished trips` : 'No finished trips yet',
    },
  ]

  const breakdown = [
    { label: 'Completed', value: summary.completed, width: pct(summary.completed, summary.total), bar: 'bg-success' },
    { label: 'Cancelled', value: summary.cancelled, width: pct(summary.cancelled, summary.total), bar: 'bg-danger' },
    { label: 'Active', value: summary.active, width: pct(summary.active, summary.total), bar: 'bg-accent' },
  ]

  return (
    <AppShell title="Analytics" subtitle="Your trips and earnings, calculated from your trip history.">
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[72px] rounded-xl sm:h-32" />)}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-xl lg:col-span-2" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      ) : error && trips.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CircleAlert}
            title="Analytics didn’t load"
            description={error}
            action={
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); fetchTrips() }}>
                <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Try again
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {trips.length === 0 && (
            <div className="card">
              <EmptyState
                icon={CarFront}
                title="No trips to analyse yet"
                description="Once you accept and complete trips, your earnings and trip trends will appear here."
                action={
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/driver/dashboard')}>
                    Find trip requests
                  </button>
                }
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0 space-y-6 lg:col-span-2">
              {/* Earnings chart */}
              <section className="card card-pad min-w-0">
                <SectionHeader title="Earnings over time" description="Completed trip fares, last 12 months" />
                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="stat-value">{naira(yearEarnings)}</p>
                  {bestMonth && (
                    <p className="text-xs text-ink-subtle">
                      Best month: <span className="font-medium text-ink">{bestMonth.label}</span> · <span className="tabular-nums">{naira(bestMonth.amount)}</span>
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <BarChart
                    data={series.map(m => ({ label: m.label, primary: m.amount }))}
                    primaryLabel="Earned"
                    format={naira}
                    emptyText="No earnings in the last 12 months"
                  />
                </div>
              </section>

              {/* Trips chart */}
              <section className="card card-pad min-w-0">
                <SectionHeader
                  title="Trips over time"
                  description={`${yearTrips.toLocaleString()} trip${yearTrips === 1 ? '' : 's'} in the last 12 months`}
                  action={<ChartLegend primaryLabel="Completed" secondaryLabel="Cancelled" />}
                />
                <div className="mt-5">
                  <BarChart
                    data={series.map(m => ({ label: m.label, primary: m.completed, secondary: m.cancelled }))}
                    primaryLabel="Completed"
                    secondaryLabel="Cancelled"
                    emptyText="No finished trips in the last 12 months"
                  />
                </div>
              </section>
            </div>

            {/* Trip breakdown */}
            <section className="card card-pad min-w-0 lg:self-start">
              <SectionHeader title="Trip breakdown" description="All time" />
              <div className="mt-5 space-y-4">
                {breakdown.map(row => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-ink-muted">{row.label}</span>
                      <span className="font-medium text-ink tabular-nums">
                        {row.value.toLocaleString()}
                        {summary.total > 0 && <span className="ml-1 font-normal text-ink-subtle">({Math.round(row.width)}%)</span>}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3">
                      <div className={`h-1.5 rounded-full transition-all ${row.bar}`} style={{ width: `${row.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <dl className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Total trips</dt>
                  <dd className="font-semibold text-ink tabular-nums">{summary.total.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Earned this month</dt>
                  <dd className="font-semibold text-ink tabular-nums">{naira(summary.month)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Busiest day</dt>
                  <dd className="font-semibold text-ink">{busiestDay || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Average fare</dt>
                  <dd className="font-semibold text-ink tabular-nums">{summary.completed ? naira(summary.averageFare) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Total earned</dt>
                  <dd className="font-semibold text-accent-text tabular-nums">{naira(summary.amount)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  )
}
