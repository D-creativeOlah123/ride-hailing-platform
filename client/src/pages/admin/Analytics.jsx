import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CarFront, CheckCircle2, Wallet, Receipt, Users, Car, Flag, RefreshCw } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatCard, SectionHeader, Skeleton } from '../../components/ui'
import BarChart, { ChartLegend } from '../../components/BarChart'
import API from '../../api'

const naira = (n) => `₦${Math.round(n).toLocaleString()}`

const TRIP_STATUSES = [
  { key: 'completed', label: 'Completed', bar: 'bg-success' },
  { key: 'trip_started', label: 'In progress', bar: 'bg-accent' },
  { key: 'driver_arriving', label: 'Driver arriving', bar: 'bg-accent/70' },
  { key: 'accepted', label: 'Accepted', bar: 'bg-accent/50' },
  { key: 'requested', label: 'Requested', bar: 'bg-warning' },
  { key: 'cancelled', label: 'Cancelled', bar: 'bg-danger' },
]

const DISPUTE_STATUSES = [
  { key: 'open', label: 'Open', dot: 'bg-warning' },
  { key: 'under_review', label: 'Under review', dot: 'bg-accent' },
  { key: 'escalated', label: 'Escalated', dot: 'bg-danger' },
  { key: 'resolved', label: 'Resolved', dot: 'bg-success' },
]

function Breakdown({ rows, total }) {
  return (
    <ul className="space-y-4">
      {rows.map(r => {
        const pct = total ? (r.value / total) * 100 : 0
        return (
          <li key={r.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-ink-muted">{r.label}</span>
              <span className="font-medium text-ink tabular-nums">
                {r.value.toLocaleString()} <span className="text-xs font-normal text-ink-subtle">· {Math.round(pct)}%</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-3">
              <div className={`h-1.5 rounded-full ${r.bar}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = () =>
    API.get('/admin/overview')
      .then(res => { setData(res.data); setError('') })
      .catch(err => setError(err.response?.data?.message || 'Could not load analytics'))
      .finally(() => setLoading(false))

  const load = () => {
    setLoading(true)
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  const trips = data?.trips
  const completed = trips?.byStatus.completed || 0
  const finished = completed + (trips?.byStatus.cancelled || 0)
  const completionRate = finished ? Math.round((completed / finished) * 100) : 0
  const avgFare = completed ? trips.revenue / completed : 0

  const monthlyTrips = (data?.monthly || []).map(m => ({ label: m.month, primary: m.completed, secondary: m.trips - m.completed }))
  const monthlyRevenue = (data?.monthly || []).map(m => ({ label: m.month, primary: m.revenue, secondary: 0 }))

  return (
    <AppShell
      title="Analytics"
      subtitle="Platform-wide performance across riders, drivers and trips."
      actions={
        <button type="button" onClick={load} disabled={loading} className="btn btn-secondary">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} /> Refresh
        </button>
      }
    >
      {error && <div className="alert alert-danger mb-6" role="alert">{error}</div>}

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : data && (
        <div className="space-y-6">
          {/* Headline numbers */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total trips" value={trips.total.toLocaleString()} icon={CarFront} hint={`${completed.toLocaleString()} completed`} />
            <StatCard label="Completion rate" value={`${completionRate}%`} icon={CheckCircle2} hint="Of finished trips" hintTone={completionRate >= 80 ? 'success' : 'muted'} />
            <StatCard label="Revenue" value={naira(trips.revenue)} icon={Wallet} hint="From completed trips" />
            <StatCard label="Average fare" value={naira(avgFare)} icon={Receipt} hint="Per completed trip" />
          </div>

          {/* Monthly charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card card-pad min-w-0">
              <SectionHeader
                title="Trips per month"
                description="Last 12 months"
                action={<ChartLegend primaryLabel="Completed" secondaryLabel="Other" />}
              />
              <div className="mt-6">
                <BarChart data={monthlyTrips} primaryLabel="completed" secondaryLabel="other" emptyText="No trips yet" />
              </div>
            </section>

            <section className="card card-pad min-w-0">
              <SectionHeader
                title="Revenue per month"
                description="Completed trips, last 12 months"
                action={<ChartLegend primaryLabel="Revenue" />}
              />
              <div className="mt-6">
                <BarChart data={monthlyRevenue} primaryLabel="revenue" format={naira} emptyText="No revenue yet" />
              </div>
            </section>
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="card card-pad min-w-0">
              <SectionHeader title="Trip status" description={`${trips.total.toLocaleString()} trips in total`} />
              <div className="mt-5">
                <Breakdown rows={TRIP_STATUSES.map(s => ({ ...s, value: trips.byStatus[s.key] || 0 }))} total={trips.total} />
              </div>
            </section>

            <section className="card card-pad min-w-0">
              <SectionHeader
                title="People"
                description="Registered accounts"
                action={data.users.pendingDrivers > 0 && (
                  <button type="button" onClick={() => navigate('/admin/drivers')} className="badge badge-warning badge-dot">
                    {data.users.pendingDrivers} pending
                  </button>
                )}
              />
              <ul className="mt-4 divide-y divide-line">
                {[
                  { icon: Users, label: 'Riders', value: data.users.riders },
                  { icon: Car, label: 'Drivers', value: data.users.drivers, note: `${data.users.drivers - data.users.pendingDrivers} approved` },
                  { icon: Users, label: 'Admins', value: data.users.admins },
                ].map(({ icon: Icon, label, value, note }) => (
                  <li key={label} className="flex items-center gap-3 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 text-sm text-ink">
                      {label}
                      {note && <span className="block text-xs text-ink-subtle">{note}</span>}
                    </span>
                    <span className="text-base font-semibold text-ink tabular-nums">{value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card card-pad min-w-0">
              <SectionHeader
                title="Disputes"
                description={`${data.disputes.total.toLocaleString()} in total`}
                action={
                  <button type="button" onClick={() => navigate('/admin/disputes')} className="btn btn-ghost btn-sm -mr-2 text-accent-text">
                    <Flag className="h-3.5 w-3.5" /> Manage
                  </button>
                }
              />
              <ul className="mt-4 divide-y divide-line">
                {DISPUTE_STATUSES.map(s => (
                  <li key={s.key} className="flex items-center justify-between py-3 text-sm">
                    <span className="flex items-center gap-2.5 text-ink-muted">
                      <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                    </span>
                    <span className="font-semibold text-ink tabular-nums">{(data.disputes.byStatus[s.key] || 0).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  )
}
