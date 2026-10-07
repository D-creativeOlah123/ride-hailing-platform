import { useState, useEffect, useCallback } from 'react'
import { CarFront, Wallet, Receipt, CheckCircle2 } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatCard, SectionHeader, Skeleton } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'
import { naira, tripSummary, monthlySeries } from '../../utils/tripStats'

export default function Analytics() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTrips = useCallback(() =>
    API.get('/trips/history')
      .then(res => setTrips(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false)),
  [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const summary = tripSummary(trips)
  const rateText = summary.completionRate === null ? '—' : `${summary.completionRate}%`
  const avgFareText = summary.completed ? naira(summary.averageFare) : '—'

  // Last 12 calendar months of completed-trip fares, oldest first.
  const series = monthlySeries(trips, 12)
  const maxAmount = Math.max(0, ...series.map(m => m.amount))
  const spendWord = user?.role === 'driver' ? 'earned' : 'spent'
  const chartDescription = maxAmount
    ? `Last 12 months · highest month ${naira(maxAmount)}`
    : `Nothing ${spendWord} in the last 12 months yet`

  const pctOf = (n) => (summary.total ? (n / summary.total) * 100 : 0)
  const breakdown = [
    { label: 'Completed', value: summary.completed, pct: pctOf(summary.completed), bar: 'bg-success' },
    { label: 'Cancelled', value: summary.cancelled, pct: pctOf(summary.cancelled), bar: 'bg-danger' },
    { label: 'Completion rate', value: rateText, pct: summary.completionRate || 0, bar: 'bg-accent' },
  ]

  return (
    <AppShell title="Analytics" subtitle="Your trip and spending insights.">
      {loading ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Trips" value={summary.total} icon={CarFront} />
            <StatCard label={user?.role === 'driver' ? 'Total Earned' : 'Total Spent'} value={naira(summary.amount)} icon={Wallet} />
            <StatCard label="Avg Fare" value={avgFareText} icon={Receipt} />
            <StatCard
              label="Completion Rate"
              value={rateText}
              icon={CheckCircle2}
              hint={summary.completionRate === null ? undefined : `${summary.completed} of ${summary.completed + summary.cancelled} finished trips`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar chart */}
            <section className="card card-pad min-w-0 lg:col-span-2">
              <SectionHeader
                title={`${user?.role === 'driver' ? 'Earnings' : 'Spending'} Over Time`}
                description={chartDescription}
              />

              <div className="relative mt-6 h-44">
                {/* Grid lines */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`border-t ${i === 3 ? 'border-line-strong' : 'border-dashed border-line'}`} />
                  ))}
                </div>
                <ul className="relative flex h-full items-end gap-1.5 sm:gap-2.5">
                  {series.map(m => (
                    <li key={m.key} className="flex h-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-[32px] rounded-t-[3px] bg-accent/85 transition-colors hover:bg-accent"
                        style={{ height: maxAmount ? `${(m.amount / maxAmount) * 100}%` : '0%' }}
                        title={`${m.label}: ${naira(m.amount)} · ${m.completed} completed`}
                      >
                        <span className="sr-only">{`${m.label}: ${naira(m.amount)} ${spendWord}, ${m.completed} completed trips`}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 flex gap-1.5 sm:gap-2.5" aria-hidden="true">
                {series.map(m => (
                  <span key={m.key} className="flex-1 text-center text-2xs text-ink-subtle">
                    <span className="sm:hidden">{m.label[0]}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Trip breakdown */}
            <section className="card card-pad min-w-0">
              <SectionHeader title="Trip Breakdown" />
              <div className="mt-5 space-y-4">
                {breakdown.map(item => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="text-ink-muted">{item.label}</span>
                      <span className="font-medium text-ink tabular-nums">{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-3">
                      <div className={`h-1.5 rounded-full transition-all ${item.bar}`}
                        style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Total trips</dt>
                  <dd className="font-semibold text-ink tabular-nums">{summary.total}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Avg fare</dt>
                  <dd className="font-semibold text-ink tabular-nums">{avgFareText}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Total {user?.role === 'driver' ? 'earned' : 'spent'}</dt>
                  <dd className="font-semibold text-accent-text tabular-nums">{naira(summary.amount)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </>
      )}
    </AppShell>
  )
}
