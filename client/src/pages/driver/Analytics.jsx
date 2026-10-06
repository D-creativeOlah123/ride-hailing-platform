import { CarFront, Wallet, Receipt, CheckCircle2 } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatCard, SectionHeader, Skeleton } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
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

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: CarFront },
    { label: user?.role === 'driver' ? 'Total Earned' : 'Total Spent', value: `₦${totalSpent.toLocaleString()}`, icon: Wallet },
    { label: 'Avg Fare', value: `₦${avgFare}`, icon: Receipt },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle2 },
  ]

  const breakdown = [
    { label: 'Completed', value: completed.length, width: trips.length ? (completed.length / trips.length) * 100 : 0, bar: 'bg-success' },
    { label: 'Cancelled', value: cancelled.length, width: trips.length ? (cancelled.length / trips.length) * 100 : 0, bar: 'bg-danger' },
    { label: 'Completion rate', value: `${completionRate}%`, width: completionRate, bar: 'bg-accent' },
  ]

  return (
    <AppShell title="Analytics" subtitle="Your trip and spending insights.">
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[72px] rounded-xl sm:h-32" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar chart */}
            <section className="card card-pad min-w-0 lg:col-span-2">
              <SectionHeader title={`${user?.role === 'driver' ? 'Earnings' : 'Spending'} Over Time`} />
              <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">
                {barHeights.map((h, i) => (
                  <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full cursor-pointer rounded-t-[3px] bg-accent/80 transition-colors hover:bg-accent"
                      style={{ height: `${h * 1.4}px` }}
                    />
                    <span className="text-2xs text-ink-subtle">{months[i]}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Trip breakdown */}
            <section className="card card-pad min-w-0">
              <SectionHeader title="Trip Breakdown" />
              <div className="mt-5 space-y-4">
                {breakdown.map(row => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-ink-muted">{row.label}</span>
                      <span className="font-medium text-ink tabular-nums">{row.value}</span>
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
                  <dd className="font-semibold text-ink tabular-nums">{trips.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Avg fare</dt>
                  <dd className="font-semibold text-ink tabular-nums">₦{avgFare}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Total {user?.role === 'driver' ? 'earned' : 'spent'}</dt>
                  <dd className="font-semibold text-accent-text tabular-nums">₦{totalSpent.toLocaleString()}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  )
}
