import { useState, useEffect } from 'react'
import {
  FilePlus2, Inbox, ChevronDown, CreditCard, Star, UploadCloud, ShieldCheck,
  AlertCircle, AlertTriangle, CheckCircle2, Flag,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, EmptyState, Spinner } from '../../components/ui'
import API from '../../api'

const TAB_ICONS = {
  submit: FilePlus2,
  'my disputes': Inbox,
}

export default function RiderDisputes() {
  const [trips, setTrips] = useState([])
  const [disputes, setDisputes] = useState([])
  const [form, setForm] = useState({ tripId: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('submit')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tripsRes, disputesRes] = await Promise.all([
        API.get('/trips/history'),
        API.get('/disputes/mine')
      ])
      setTrips(tripsRes.data.filter(t => t.status === 'completed'))
      setDisputes(disputesRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    if (!form.tripId || !form.description) return
    setLoading(true)
    setError('')
    try {
      await API.post('/disputes/submit', form)
      setSuccess('Dispute submitted successfully!')
      setForm({ tripId: '', description: '' })
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispute')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      title="Dispute Center"
      subtitle="Resolution for trip discrepancies, fare issues, and service quality reports."
    >
      {/* Tabs */}
      <div className="mb-6 border-b border-line">
        <div className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
          {['submit', 'my disputes'].map(t => {
            const Icon = TAB_ICONS[t]
            return (
              <button key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 pt-1 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {t}
                {t === 'my disputes' && disputes.length > 0 && (
                  <span className="rounded-md bg-surface-2 px-1.5 py-px text-2xs font-medium text-ink-muted tabular-nums ring-1 ring-inset ring-line">
                    {disputes.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'submit' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card card-pad min-w-0 lg:col-span-2">
            {success && (
              <div className="alert alert-success mb-5" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="alert alert-danger mb-5" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="dispute-trip" className="label">
                  Select Relevant Trip
                </label>
                <div className="relative">
                  <select
                    id="dispute-trip"
                    value={form.tripId}
                    onChange={e => setForm({ ...form, tripId: e.target.value })}
                    className="input">
                    <option value="">Select a recent trip...</option>
                    {trips.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.pickupLocation} → {t.destination} (₦{t.fare})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
                </div>
                <p className="hint">Only trips within the last 30 days are eligible.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { icon: CreditCard, title: 'Fare Discrepancy', desc: 'Unexpected charges, incorrect tolls, or base fare information.' },
                  { icon: Star, title: 'Service Quality', desc: 'Driver professionalism, vehicle cleanliness, or route safety.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex cursor-pointer gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2/50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="dispute-description" className="label">
                  Detailed Description
                </label>
                <textarea
                  id="dispute-description"
                  placeholder="Please provide specific details about the incident..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="input resize-none"
                />
                {form.description.length < 50 && form.description.length > 0 && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    Description must be at least 50 characters.
                  </p>
                )}
              </div>

              <div className="group cursor-pointer rounded-lg border border-dashed border-line-strong bg-surface-2/40 px-6 py-7 text-center transition-colors hover:border-accent/50 hover:bg-accent/[0.03]">
                <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted shadow-xs group-hover:text-accent-text">
                  <UploadCloud className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink">Click to upload</span> or drag & drop
                </p>
                <p className="mt-1 text-xs text-ink-subtle">PNG, JPG or PDF (max. 5MB)</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-[rgb(var(--accent))]" />
                <span className="text-xs leading-relaxed text-ink-muted">
                  I certify that the information provided is accurate and I understand that fraudulent claims may result in account suspension.
                </span>
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !form.tripId || form.description.length < 50}
                className="btn btn-primary btn-lg w-full">
                {loading ? <><Spinner /> Submitting...</> : 'Submit Dispute Review'}
              </button>
            </div>
          </section>

          <aside className="min-w-0">
            <section className="card card-pad">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-[15px] font-semibold text-ink">Our Commitment</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Disputes are typically reviewed within 24-48 business hours by our specialized Resolution Team.
              </p>
            </section>
          </aside>
        </div>
      )}

      {tab === 'my disputes' && (
        disputes.length === 0 ? (
          <div className="card">
            <EmptyState icon={Flag} title="No disputes submitted yet." />
          </div>
        ) : (
          <ul className="card divide-y divide-line overflow-hidden">
            {disputes.map(d => (
              <li key={d._id} className="px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink tabular-nums">
                      TRP-{d._id.slice(-7).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      Filed {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={d.status} className="shrink-0" />
                </div>
                <p className="mt-3 break-words text-sm leading-relaxed text-ink-muted">{d.description}</p>
                {d.resolution && (
                  <div className="mt-4 rounded-lg border border-success/20 bg-success/[0.06] p-3.5">
                    <p className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-eyebrow text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Resolution
                    </p>
                    <p className="mt-1.5 break-words text-sm text-ink">{d.resolution}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}
    </AppShell>
  )
}
