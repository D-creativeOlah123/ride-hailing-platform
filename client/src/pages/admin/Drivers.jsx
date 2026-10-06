import { useState, useEffect } from 'react'
import { CheckCircle2, Check, X, Mail, Phone } from 'lucide-react'
import AppShell from '../../components/AppShell'
import { EmptyState, Skeleton, Spinner, Avatar } from '../../components/ui'
import API from '../../api'

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await API.get('/auth/pending-drivers')
      setDrivers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, approved) => {
    setProcessing(id)
    try {
      await API.patch(`/auth/drivers/${id}/approve`, { approved })
      setSuccess(approved ? 'Driver approved successfully!' : 'Driver rejected.')
      fetchDrivers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <AppShell
      title="Driver Approvals"
      subtitle="Review and approve pending driver applications."
    >
      {success && (
        <div className="alert alert-success mb-5 animate-fade-in" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : drivers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CheckCircle2}
            title="All caught up!"
            description="No pending driver applications."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {drivers.map(driver => (
            <article key={driver._id} className="card min-w-0 overflow-hidden">
              <div className="card-pad">
                {/* Identity */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar name={driver.name} className="h-10 w-10 text-sm sm:h-11 sm:w-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col-reverse items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <p className="min-w-0 max-w-full truncate text-[15px] font-semibold text-ink">{driver.name}</p>
                      <span className="badge badge-warning badge-dot shrink-0">Pending Review</span>
                    </div>
                    <div className="mt-1.5 flex flex-col gap-1 text-[13px] text-ink-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                        <span className="truncate">{driver.email}</span>
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5 tabular-nums">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                        <span className="truncate">{driver.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle */}
                {driver.vehicle && (
                  <dl className="well mt-5 grid grid-cols-2 gap-x-4 gap-y-4 p-4 sm:grid-cols-4">
                    {[
                      { label: 'Make', value: driver.vehicle.make },
                      { label: 'Model', value: driver.vehicle.model },
                      { label: 'Year', value: driver.vehicle.year },
                      { label: 'Plate', value: driver.vehicle.plateNumber },
                    ].map(item => (
                      <div key={item.label} className="min-w-0">
                        <dt className="eyebrow">{item.label}</dt>
                        <dd className="mt-1 truncate text-sm font-medium text-ink tabular-nums">{item.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-2/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  onClick={() => handleApprove(driver._id, false)}
                  disabled={processing === driver._id}
                  className="btn btn-danger w-full sm:w-auto">
                  <X className="h-4 w-4" strokeWidth={1.75} /> Reject
                </button>
                <button
                  onClick={() => handleApprove(driver._id, true)}
                  disabled={processing === driver._id}
                  className="btn btn-primary w-full sm:w-auto">
                  {processing === driver._id ? <Spinner /> : <Check className="h-4 w-4" strokeWidth={2} />} Approve Driver
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  )
}
