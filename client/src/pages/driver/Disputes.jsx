import { useState, useEffect } from 'react'
import { CheckCircle2, Flag, CalendarDays } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, EmptyState, Skeleton } from '../../components/ui'
import API from '../../api'

export default function DriverDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const res = await API.get('/disputes/mine')
      setDisputes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      title="Dispute Resolution"
      subtitle="Monitor your active cases and review past resolutions."
    >
      <div className="max-w-3xl">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : disputes.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={CheckCircle2}
              title="No Disputes"
              description="You have no active or past disputes."
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {disputes.map(d => (
              <li key={d._id} className="card card-pad">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                      <Flag className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink tabular-nums">
                        TRP-{d._id.slice(-7).toUpperCase()}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-subtle">
                        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                        <span className="tabular-nums">Filed {new Date(d.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={d.status} className="shrink-0" />
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm text-ink-muted">{d.description}</p>

                {d.resolution && (
                  <div className="alert alert-success mt-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-eyebrow">Resolution</p>
                      <p className="mt-0.5 break-words">{d.resolution}</p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
