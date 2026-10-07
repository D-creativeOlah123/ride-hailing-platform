import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CarFront, Flag, AlertTriangle, Wallet, BarChart3, ChevronRight, Activity, MapPin,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, SectionHeader, EmptyState, Skeleton, Avatar } from '../../components/ui'
import BarChart, { ChartLegend } from '../../components/BarChart'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

// Full class names so Tailwind can find them.
const CHANGE_TONE = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
}

const SEVERITY_DOT = {
  High: 'bg-danger',
  Moderate: 'bg-warning',
  Low: 'bg-ink-subtle',
}

const severityOf = (status) =>
  status === 'escalated' ? 'High' : status === 'under_review' ? 'Moderate' : 'Low'

function KpiCard({ label, value, change, tone, note, icon: Icon }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-ink-muted">{label}</span>
        <span className="hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted sm:flex">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <p className="stat-value mt-3 text-2xl sm:mt-4 sm:text-[1.75rem]">{value}</p>
      <div className="mt-2 flex min-w-0 items-center gap-2 text-xs">
        {change && <span className={`shrink-0 font-medium tabular-nums ${CHANGE_TONE[tone]}`}>{change}</span>}
        {note && <span className="truncate text-ink-subtle">{note}</span>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeDisputes: 0,
    resolvedDisputes: 0,
    escalatedDisputes: 0,
  })
  const [overview, setOverview] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [disputesRes, overviewRes] = await Promise.all([
        API.get('/disputes/all'),
        API.get('/admin/overview').catch(() => null),
      ])
      const disputes = disputesRes.data
      if (overviewRes) setOverview(overviewRes.data)
      setStats({
        totalTrips: overviewRes?.data.trips.total ?? 0,
        activeDisputes: disputes.filter(d => d.status === 'open' || d.status === 'under_review').length,
        resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
        escalatedDisputes: disputes.filter(d => d.status === 'escalated').length,
      })
      setRecentActivity(disputes.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const completedTrips = overview?.trips.byStatus.completed || 0
  const revenue = overview?.trips.revenue || 0
  const monthly = (overview?.monthly || []).map(m => ({ label: m.month, primary: m.completed, secondary: m.trips - m.completed }))

  const kpis = [
    { label: 'Total Trips', value: stats.totalTrips.toLocaleString(), change: `${completedTrips.toLocaleString()} completed`, tone: 'success', icon: CarFront },
    { label: 'Active Disputes', value: stats.activeDisputes, icon: Flag, note: 'Open or under review' },
    { label: 'Escalated', value: stats.escalatedDisputes, icon: AlertTriangle, note: 'Awaiting a super admin' },
    { label: 'Revenue', value: `₦${revenue.toLocaleString()}`, icon: Wallet, note: 'From completed trips' },
  ]

  return (
    <AppShell
      title="Platform Overview"
      subtitle="Real-time mobility metrics and fleet status."
      actions={
        <>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/activity')}>
            <Activity className="h-4 w-4" strokeWidth={1.75} /> All trips
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/analytics')}>
            <BarChart3 className="h-4 w-4" strokeWidth={1.75} /> View analytics
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Trip volume chart */}
          <section className="card card-pad min-w-0 lg:col-span-2">
            <SectionHeader
              title="Trip Volume"
              description="Trips requested per month, last 12 months"
              action={<ChartLegend primaryLabel="Completed" secondaryLabel="Other" />}
            />

            <div className="mt-6">
              <BarChart data={monthly} primaryLabel="completed" secondaryLabel="other" emptyText={loading ? 'Loading…' : 'No trips yet'} />
            </div>
          </section>

          {/* Fleet density */}
          <section className="card card-pad flex min-w-0 flex-col">
            <SectionHeader
              title="Fleet Density"
              description="Live operational zones"
              action={<span className="badge badge-accent badge-dot">Live</span>}
            />

            <div className="well relative mt-5 flex h-44 flex-1 items-center justify-center overflow-hidden lg:h-auto lg:min-h-[176px]">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(var(--line-strong)) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center">
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent/10 [animation-duration:2.5s]" aria-hidden="true" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-accent/20" />
                </span>
                <p className="mt-3 rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-medium text-accent-text shadow-xs">Downtown Core</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-ink-muted">
                <MapPin className="h-4 w-4 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                <span className="truncate">Downtown Core</span>
              </span>
              <span className="shrink-0 text-xs font-medium text-accent-text">High Demand</span>
            </div>
          </section>
        </div>

        {/* Recent activity */}
        <section className="card min-w-0">
          <SectionHeader
            className="px-5 pt-5 sm:px-6 sm:pt-6"
            title="Recent Activity"
            description="Audit trail of critical system events"
            action={
              <button onClick={() => navigate('/admin/disputes')} className="btn btn-ghost btn-sm -mr-2 text-accent-text">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </button>
            }
          />

          <div className="mt-4">
            {loading ? (
              <div className="space-y-2 px-5 pb-5 sm:px-6 sm:pb-6">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="border-t border-line">
                <EmptyState icon={Activity} title="No recent activity." />
              </div>
            ) : (
              <>
                {/* Phones: stacked list */}
                <ul className="divide-y divide-line border-t border-line md:hidden">
                  {recentActivity.map(d => {
                    const severity = severityOf(d.status)
                    return (
                      <li key={d._id} className="px-5 py-3.5 sm:px-6">
                        <div className="flex items-start gap-3">
                          <Avatar name={d.submittedBy?.name} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{d.submittedBy?.name}</p>
                            <p className="truncate text-xs text-ink-subtle">
                              <span className="font-mono">#RL-{d._id.slice(-4).toUpperCase()}</span>
                              <span className="capitalize"> · {d.submittedBy?.role}</span>
                            </p>
                          </div>
                          <StatusBadge status={d.status} className="shrink-0" />
                        </div>
                        <div className="mt-2 flex items-center justify-between pl-11">
                          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                            <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[severity]}`} />
                            {severity}
                          </span>
                          <button
                            onClick={() => navigate('/admin/disputes')}
                            className="btn btn-ghost btn-sm -mr-2 text-accent-text">
                            Review <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {/* md and up: table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="table-head border-t">
                        <th scope="col" className="px-6 py-2.5 font-medium">Transaction ID</th>
                        <th scope="col" className="px-3 py-2.5 font-medium">Entity</th>
                        <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                        <th scope="col" className="px-3 py-2.5 font-medium">Severity</th>
                        <th scope="col" className="px-6 py-2.5 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map(d => {
                        const severity = severityOf(d.status)
                        return (
                          <tr key={d._id} className="table-row">
                            <td className="whitespace-nowrap px-6 py-3 font-mono text-[13px] text-ink">
                              #RL-{d._id.slice(-4).toUpperCase()}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={d.submittedBy?.name} className="h-7 w-7 text-2xs" />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-ink">{d.submittedBy?.name}</p>
                                  <p className="text-xs capitalize text-ink-subtle">{d.submittedBy?.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={d.status} />
                            </td>
                            <td className="px-3 py-3">
                              <span className="flex items-center gap-2 text-ink-muted">
                                <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[severity]}`} />
                                {severity}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => navigate('/admin/disputes')}
                                className="btn btn-ghost btn-sm -mr-3 text-accent-text">
                                Review
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
