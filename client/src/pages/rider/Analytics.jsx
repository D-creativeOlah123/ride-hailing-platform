import { useState, useEffect } from 'react'
import { CarFront, Wallet, Receipt, CheckCircle2 } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatCard, SectionHeader, Skeleton } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

export default function Analytics() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/trips/history').then(res => {
      setTrips(res.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const completed = trips.filter(t => t.status === 'completed')
  const cancelled = trips.filter(t => t.status === 'cancelled')
  const totalSpent = completed.reduce((s, t) => s + (t.fare || 0), 0)
  const avgFare = completed.length ? Math.round(totalSpent / completed.length) : 0
  const completionRate = trips.length ? Math.round((completed.length / trips.length) * 100) : 0

  const barHeights = [30, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80]
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D']

  const breakdown = [
    { label: 'Completed', value: completed.length, pct: trips.length ? (completed.length / trips.length) * 100 : 0, bar: 'bg-success' },
    { label: 'Cancelled', value: cancelled.length, pct: trips.length ? (cancelled.length / trips.length) * 100 : 0, bar: 'bg-danger' },
    { label: 'Completion rate', value: `${completionRate}%`, pct: completionRate, bar: 'bg-accent' },
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
            <StatCard label="Total Trips" value={trips.length} icon={CarFront} />
            <StatCard label={user?.role === 'driver' ? 'Total Earned' : 'Total Spent'} value={`₦${totalSpent.toLocaleString()}`} icon={Wallet} />
            <StatCard label="Avg Fare" value={`₦${avgFare}`} icon={Receipt} />
            <StatCard label="Completion Rate" value={`${completionRate}%`} icon={CheckCircle2} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar chart */}
            <section className="card card-pad min-w-0 lg:col-span-2">
              <SectionHeader title={`${user?.role === 'driver' ? 'Earnings' : 'Spending'} Over Time`} />

              <div className="relative mt-6 h-44">
                {/* Grid lines */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`border-t ${i === 3 ? 'border-line-strong' : 'border-dashed border-line'}`} />
                  ))}
                </div>
                <div className="relative flex h-full items-end gap-1.5 sm:gap-2.5">
                  {barHeights.map((h, i) => (
                    <div key={i} className="flex h-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-[32px] cursor-pointer rounded-t-[3px] bg-accent/85 transition-colors hover:bg-accent"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex gap-1.5 sm:gap-2.5">
                {months.map((m, i) => (
                  <span key={i} className="flex-1 text-center text-2xs text-ink-subtle">{m}</span>
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
                  <dd className="font-semibold text-ink tabular-nums">{trips.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Avg fare</dt>
                  <dd className="font-semibold text-ink tabular-nums">₦{avgFare}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-muted">Total {user?.role === 'driver' ? 'earned' : 'spent'}</dt>
                  <dd className="font-semibold text-accent-text tabular-nums">₦{totalSpent.toLocaleString()}</dd>
                </div>
              </dl>
            </section>
          </div>
        </>
      )}
    </AppShell>
  )
}
