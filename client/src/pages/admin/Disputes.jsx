import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

export default function AdminDisputes() {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [resolution, setResolution] = useState('')
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const res = await API.get('/disputes/all')
      setDisputes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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

  const statusColor = (status) => {
    if (status === 'resolved') return 'bg-green-500/10 text-green-500'
    if (status === 'escalated') return 'bg-red-500/10 text-red-500'
    if (status === 'under_review') return 'bg-yellow-500/10 text-yellow-500'
    return 'bg-brand-blue/10 text-brand-blue'
  }

  const filtered = disputes.filter(d => {
    const matchSearch = d.submittedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d._id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dispute Management</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Review and resolve active ride discrepancies.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm px-4 py-2 rounded-xl transition-all">
              ↑ Export Report
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Disputes list */}
            <div className="lg:col-span-2 space-y-4">

              {/* Filters */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Search Trip ID or User..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors">
                  <option value="all">Status: All</option>
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/5">
                      <th className="text-left px-6 py-4 text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Trip ID</th>
                      <th className="text-left px-6 py-4 text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Submitted By</th>
                      <th className="text-left px-6 py-4 text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [1,2,3].map(i => (
                        <tr key={i}>
                          <td colSpan={5} className="px-6 py-4">
                            <div className="h-8 bg-gray-200 dark:bg-navy-700 rounded animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-white/40 text-sm">
                          No disputes found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(d => (
                        <tr key={d._id}
                          className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors cursor-pointer"
                          onClick={() => setSelected(d)}>
                          <td className="px-6 py-4 text-sm text-brand-blue font-medium">
                            #RL-{d._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
                                {d.submittedBy?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">{d.submittedBy?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-white/40 capitalize">{d.submittedBy?.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${statusColor(d.status)}`}>
                              {d.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-white/40">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {d.status === 'open' && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleReview(d._id) }}
                                  className="text-xs bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 px-3 py-1.5 rounded-lg transition-all">
                                  Review
                                </button>
                              )}
                              {d.status === 'under_review' && user?.role === 'ops_manager' && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleEscalate(d._id) }}
                                  className="text-xs bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-3 py-1.5 rounded-lg transition-all">
                                  Escalate
                                </button>
                              )}
                              {(d.status === 'escalated' || d.status === 'under_review') && user?.role === 'super_admin' && (
                                <button
                                  onClick={e => { e.stopPropagation(); setSelected(d) }}
                                  className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-all">
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {filtered.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-white/40">
                      Showing {filtered.length} of {disputes.length} disputes
                    </p>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 bg-brand-blue text-white text-xs rounded-lg">1</button>
                      <button className="w-8 h-8 bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-white/40 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-navy-600">2</button>
                      <button className="w-8 h-8 bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-white/40 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-navy-600">3</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel — dispute detail */}
            <div className="space-y-4">
              {selected ? (
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Dispute #{selected._id.slice(-8).toUpperCase()}
                      </p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase mt-1 inline-block ${statusColor(selected.status)}`}>
                        {selected.status.replace('_', ' ')}
                      </span>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg">✕</button>
                  </div>

                  <div className="space-y-4 mb-5">
                    <div className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2">Submitted By</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
                          {selected.submittedBy?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.submittedBy?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-white/40 capitalize">{selected.submittedBy?.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-gray-700 dark:text-white/70">{selected.description}</p>
                    </div>

                    <div className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2">Trip Details</p>
                      <p className="text-xs text-gray-500 dark:text-white/40">
                        Filed on {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    {selected.status === 'open' && (
                      <button
                        onClick={() => handleReview(selected._id)}
                        className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-3 rounded-xl text-sm font-medium transition-all">
                        Mark as Under Review
                      </button>
                    )}

                    {selected.status === 'under_review' && user?.role === 'ops_manager' && (
                      <button
                        onClick={() => handleEscalate(selected._id)}
                        className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 py-3 rounded-xl text-sm font-medium transition-all">
                        Escalate to Super Admin
                      </button>
                    )}

                    {(selected.status === 'escalated' || selected.status === 'under_review') && user?.role === 'super_admin' && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2">Resolution</p>
                          <textarea
                            placeholder="Type the resolution details here..."
                            value={resolution}
                            onChange={e => setResolution(e.target.value)}
                            rows={4}
                            className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors resize-none"
                          />
                        </div>
                        <button
                          onClick={() => handleResolve(selected._id)}
                          disabled={processing || !resolution}
                          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all">
                          {processing ? 'Resolving...' : 'Confirm Resolution ✓'}
                        </button>
                      </div>
                    )}

                    {selected.status === 'resolved' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <p className="text-xs text-green-500 uppercase tracking-wider mb-1">Resolution</p>
                        <p className="text-sm text-green-500">{selected.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-white/5 text-center">
                  <div className="text-4xl mb-3">⚑</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Select a Dispute</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">Click any dispute from the table to view details and take action.</p>
                </div>
              )}

              {/* Stats summary */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Open', value: disputes.filter(d => d.status === 'open').length, color: 'text-brand-blue' },
                    { label: 'Under Review', value: disputes.filter(d => d.status === 'under_review').length, color: 'text-yellow-500' },
                    { label: 'Escalated', value: disputes.filter(d => d.status === 'escalated').length, color: 'text-red-500' },
                    { label: 'Resolved', value: disputes.filter(d => d.status === 'resolved').length, color: 'text-green-500' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-white/40">{s.label}</span>
                      <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}