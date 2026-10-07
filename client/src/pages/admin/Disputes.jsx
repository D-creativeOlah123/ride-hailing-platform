import { useState, useEffect } from 'react'
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, Download, Flag, X, Check, ArrowUpRight, CheckCircle2, CalendarDays,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatusBadge, SectionHeader, EmptyState, Skeleton, Spinner, Avatar } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

// Full class names so Tailwind can find them.
const ACTION_BTN = {
  review: 'btn btn-sm btn-secondary',
  escalate: 'btn btn-sm border border-warning/25 bg-warning/10 text-warning hover:bg-warning/15',
  resolve: 'btn btn-sm border border-success/25 bg-success/10 text-success hover:bg-success/15',
}

const PAGE_SIZE = 10

const pad2 = (n) => String(n).padStart(2, '0')
const localDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const localDateTime = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${localDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

// RFC 4180 quoting, plus a leading apostrophe on values a spreadsheet would run as a formula.
const csvCell = (value) => {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadDisputesCsv(rows) {
  const header = ['ID', 'Date', 'Submitted by', 'Role', 'Email', 'Status', 'Trip pickup', 'Trip destination', 'Description', 'Resolution']
  const lines = rows.map(d => [
    d._id,
    localDateTime(d.createdAt),
    d.submittedBy?.name,
    d.submittedBy?.role?.replace('_', ' '),
    d.submittedBy?.email,
    d.status?.replace('_', ' '),
    d.trip?.pickupLocation,
    d.trip?.destination,
    d.description,
    d.resolution,
  ].map(csvCell).join(','))
  // BOM so Excel opens the file as UTF-8 (₦, accented names).
  const csv = String.fromCharCode(0xfeff) + [header.map(csvCell).join(','), ...lines].join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `ridelink-disputes-${localDate(new Date())}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const DOT = {
  open: 'bg-warning',
  under_review: 'bg-accent',
  escalated: 'bg-danger',
  resolved: 'bg-success',
}

export default function AdminDisputes() {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [resolution, setResolution] = useState('')
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Promise chain so state is only set in async callbacks.
  const fetchDisputes = () =>
    API.get('/disputes/all')
      .then(res => setDisputes(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchDisputes()
  }, [])

  const handleReview = async (id) => {
    try {
      await API.patch(`/disputes/${id}/review`)
      fetchDisputes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEscalate = async (id) => {
    try {
      await API.patch(`/disputes/${id}/escalate`)
      fetchDisputes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolve = async (id) => {
    if (!resolution) return
    setProcessing(true)
    try {
      await API.patch(`/disputes/${id}/resolve`, { resolution })
      setSelected(null)
      setResolution('')
      fetchDisputes()
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const filtered = disputes.filter(d => {
    const matchSearch = d.submittedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d._id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount) // stays valid if a refresh shrinks the list
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  // Row-level action buttons, shared by the phone list and the table.
  const rowActions = (d) => (
    <>
      {d.status === 'open' && (
        <button
          onClick={e => { e.stopPropagation(); handleReview(d._id) }}
          className={ACTION_BTN.review}>
          Review
        </button>
      )}
      {d.status === 'under_review' && user?.role === 'ops_manager' && (
        <button
          onClick={e => { e.stopPropagation(); handleEscalate(d._id) }}
          className={ACTION_BTN.escalate}>
          Escalate
        </button>
      )}
      {(d.status === 'escalated' || d.status === 'under_review') && user?.role === 'super_admin' && (
        <button
          onClick={e => { e.stopPropagation(); setSelected(d) }}
          className={ACTION_BTN.resolve}>
          Resolve
        </button>
      )}
    </>
  )

  const summary = [
    { key: 'open', label: 'Open', value: disputes.filter(d => d.status === 'open').length },
    { key: 'under_review', label: 'Under Review', value: disputes.filter(d => d.status === 'under_review').length },
    { key: 'escalated', label: 'Escalated', value: disputes.filter(d => d.status === 'escalated').length },
    { key: 'resolved', label: 'Resolved', value: disputes.filter(d => d.status === 'resolved').length },
  ]

  return (
    <AppShell
      title="Dispute Management"
      subtitle="Review and resolve active ride discrepancies."
      actions={
        <button
          type="button"
          onClick={() => downloadDisputesCsv(filtered)}
          disabled={loading || filtered.length === 0}
          title={filtered.length ? `Download ${filtered.length} dispute${filtered.length === 1 ? '' : 's'} as CSV` : 'No disputes to export'}
          className="btn btn-primary">
          <Download className="h-4 w-4" strokeWidth={1.75} /> Export Report
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Disputes list */}
        <div className="min-w-0 space-y-4 xl:col-span-2">

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
              <label htmlFor="dispute-search" className="sr-only">Search disputes</label>
              <input
                id="dispute-search"
                type="text"
                placeholder="Search Trip ID or User..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="input h-10 pl-10"
              />
            </div>
            <div className="relative sm:w-48">
              <label htmlFor="dispute-status" className="sr-only">Filter by status</label>
              <select
                id="dispute-status"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="input h-10">
                <option value="all">Status: All</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="space-y-2 p-4 sm:p-5">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={Flag} title="No disputes found." />
            ) : (
              <>
                {/* Phones: stacked list */}
                <ul className="divide-y divide-line md:hidden">
                  {pageRows.map(d => (
                    <li
                      key={d._id}
                      onClick={() => setSelected(d)}
                      className={`cursor-pointer px-4 py-3.5 transition-colors hover:bg-surface-2/60 ${selected?._id === d._id ? 'bg-surface-2/60' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-accent-text tabular-nums">
                          #RL-{d._id.slice(-8).toUpperCase()}
                        </span>
                        <StatusBadge status={d.status} className="shrink-0" />
                      </div>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Avatar name={d.submittedBy?.name} className="h-7 w-7 text-2xs" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-ink">{d.submittedBy?.name}</p>
                          <p className="truncate text-xs capitalize text-ink-subtle">
                            {d.submittedBy?.role} · <span className="tabular-nums">{new Date(d.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 empty:hidden">{rowActions(d)}</div>
                    </li>
                  ))}
                </ul>

                {/* md and up: table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="table-head">
                        <th className="px-5 py-2.5 font-medium">Trip ID</th>
                        <th className="px-5 py-2.5 font-medium">Submitted By</th>
                        <th className="px-5 py-2.5 font-medium">Status</th>
                        <th className="px-5 py-2.5 font-medium">Date</th>
                        <th className="px-5 py-2.5 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map(d => (
                        <tr key={d._id}
                          className={`table-row cursor-pointer ${selected?._id === d._id ? 'bg-surface-2/60' : ''}`}
                          onClick={() => setSelected(d)}>
                          <td className="whitespace-nowrap px-5 py-3 font-medium text-accent-text tabular-nums">
                            #RL-{d._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={d.submittedBy?.name} className="h-7 w-7 text-2xs" />
                              <div className="min-w-0">
                                <p className="truncate text-sm text-ink">{d.submittedBy?.name}</p>
                                <p className="text-xs capitalize text-ink-subtle">{d.submittedBy?.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-ink-muted tabular-nums">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-2">{rowActions(d)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {filtered.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-ink-subtle tabular-nums">
                  {pageCount > 1
                    ? <>Showing {pageStart + 1}–{pageStart + pageRows.length} of {filtered.length} disputes</>
                    : <>Showing {filtered.length} of {disputes.length} disputes</>}
                </p>
                {pageCount > 1 && (
                  <nav className="flex flex-wrap items-center gap-1" aria-label="Disputes pages">
                    <button
                      type="button"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-ghost btn-sm btn-icon"
                      aria-label="Previous page">
                      <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        aria-current={n === currentPage ? 'page' : undefined}
                        aria-label={`Page ${n}`}
                        className={`btn btn-sm btn-icon tabular-nums ${n === currentPage ? 'btn-primary' : 'btn-ghost'}`}>
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      className="btn btn-ghost btn-sm btn-icon"
                      aria-label="Next page">
                      <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — dispute detail */}
        <div className="min-w-0 space-y-6">
          {selected ? (
            // Below xl this is a modal sheet; on xl it sits inline in the right column.
            <div
              className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center xl:static xl:z-auto xl:block xl:animate-none xl:bg-transparent xl:p-0 xl:backdrop-blur-none"
              onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}
            >
              <div
                role="dialog"
                aria-labelledby="dispute-detail-title"
                className="card max-h-[90vh] w-full max-w-md overflow-y-auto shadow-overlay xl:max-h-none xl:max-w-none xl:overflow-visible xl:shadow-card"
              >
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <p id="dispute-detail-title" className="truncate text-[15px] font-semibold text-ink tabular-nums">
                      Dispute #{selected._id.slice(-8).toUpperCase()}
                    </p>
                    <StatusBadge status={selected.status} className="mt-1.5" />
                  </div>
                  <button onClick={() => setSelected(null)} className="btn btn-ghost btn-icon btn-sm -mr-1.5 shrink-0" aria-label="Close">
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>

                <div className="space-y-5 px-5 py-5">
                  <div>
                    <p className="eyebrow mb-2">Submitted By</p>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={selected.submittedBy?.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{selected.submittedBy?.name}</p>
                        <p className="text-xs capitalize text-ink-subtle">{selected.submittedBy?.role}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Description</p>
                    <p className="well whitespace-pre-wrap break-words px-3.5 py-3 text-sm text-ink-muted">{selected.description}</p>
                  </div>

                  <div>
                    <p className="eyebrow mb-2">Trip Details</p>
                    <p className="flex items-center gap-2 text-xs text-ink-muted">
                      <CalendarDays className="h-3.5 w-3.5 text-ink-subtle" strokeWidth={1.75} />
                      Filed on {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 border-t border-line px-5 py-4 empty:hidden">
                  {selected.status === 'open' && (
                    <button
                      onClick={() => handleReview(selected._id)}
                      className="btn btn-primary w-full">
                      Mark as Under Review
                    </button>
                  )}

                  {selected.status === 'under_review' && user?.role === 'ops_manager' && (
                    <button
                      onClick={() => handleEscalate(selected._id)}
                      className="btn w-full border border-warning/25 bg-warning/10 text-warning hover:bg-warning/15">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} /> Escalate to Super Admin
                    </button>
                  )}

                  {(selected.status === 'escalated' || selected.status === 'under_review') && user?.role === 'super_admin' && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="dispute-resolution" className="label">Resolution</label>
                        <textarea
                          id="dispute-resolution"
                          placeholder="Type the resolution details here..."
                          value={resolution}
                          onChange={e => setResolution(e.target.value)}
                          rows={4}
                          className="input resize-none"
                        />
                      </div>
                      <button
                        onClick={() => handleResolve(selected._id)}
                        disabled={processing || !resolution}
                        className="btn btn-primary w-full">
                        {processing
                          ? <><Spinner /> Resolving...</>
                          : <><Check className="h-4 w-4" strokeWidth={2} /> Confirm Resolution</>}
                      </button>
                    </div>
                  )}

                  {selected.status === 'resolved' && (
                    <div className="alert alert-success">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-eyebrow">Resolution</p>
                        <p className="mt-0.5 break-words">{selected.resolution}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <EmptyState
                icon={Flag}
                title="Select a Dispute"
                description="Click any dispute from the table to view details and take action."
              />
            </div>
          )}

          {/* Stats summary */}
          <section className="card">
            <SectionHeader className="px-5 pt-5" title="Summary" />
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {summary.map(s => (
                <li key={s.label} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="flex items-center gap-2.5 text-sm text-ink-muted">
                    <span className={`h-1.5 w-1.5 rounded-full ${DOT[s.key]}`} />
                    {s.label}
                  </span>
                  <span className="text-sm font-semibold text-ink tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
