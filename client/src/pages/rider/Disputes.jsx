import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

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

  const statusColor = (status) => {
    if (status === 'resolved') return 'bg-green-500/10 text-green-500'
    if (status === 'escalated') return 'bg-red-500/10 text-red-500'
    if (status === 'under_review') return 'bg-yellow-500/10 text-yellow-500'
    return 'bg-brand-blue/10 text-brand-blue'
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dispute Center</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Resolution for trip discrepancies, fare issues, and service quality reports.</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-8 max-w-3xl">
          <div className="flex gap-2 mb-6">
            {['submit', 'my disputes'].map(t => (
              <button key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  tab === t
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 dark:bg-navy-800 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'submit' && (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
              {success && (
                <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">{success}</div>
              )}
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">
                    Select Relevant Trip
                  </label>
                  <select
                    value={form.tripId}
                    onChange={e => setForm({ ...form, tripId: e.target.value })}
                    className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-blue transition-colors">
                    <option value="">Select a recent trip...</option>
                    {trips.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.pickupLocation} → {t.destination} (₦{t.fare})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 dark:text-white/20 mt-1">Only trips within the last 30 days are eligible.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '💳', title: 'Fare Discrepancy', desc: 'Unexpected charges, incorrect tolls, or base fare information.' },
                    { icon: '⭐', title: 'Service Quality', desc: 'Driver professionalism, vehicle cleanliness, or route safety.' },
                  ].map(c => (
                    <div key={c.title} className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 cursor-pointer transition-all">
                      <span className="text-lg">{c.icon}</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{c.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{c.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block">
                    Detailed Description
                  </label>
                  <textarea
                    placeholder="Please provide specific details about the incident..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    className="w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors resize-none"
                  />
                  {form.description.length < 50 && form.description.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">⚠ Description must be at least 50 characters.</p>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 text-center hover:border-brand-blue/50 transition-colors cursor-pointer">
                  <div className="text-2xl mb-1">☁️</div>
                  <p className="text-sm text-gray-500 dark:text-white/40">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 dark:text-white/20 mt-1">PNG, JPG or PDF (max. 5MB)</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-xs text-gray-500 dark:text-white/40">
                    I certify that the information provided is accurate and I understand that fraudulent claims may result in account suspension.
                  </span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.tripId || form.description.length < 50}
                  className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all">
                  {loading ? 'Submitting...' : 'Submit Dispute Review'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-brand-blue">🛡️</span>
                  <p className="text-sm font-semibold text-brand-blue">Our Commitment</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/40">
                  Disputes are typically reviewed within 24-48 business hours by our specialized Resolution Team.
                </p>
              </div>
            </div>
          )}

          {tab === 'my disputes' && (
            <div className="space-y-4">
              {disputes.length === 0 ? (
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-12 border border-gray-200 dark:border-white/5 text-center">
                  <div className="text-5xl mb-4">⚑</div>
                  <p className="text-gray-500 dark:text-white/40">No disputes submitted yet.</p>
                </div>
              ) : (
                disputes.map(d => (
                  <div key={d._id} className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          TRP-{d._id.slice(-7).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                          Filed {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${statusColor(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/60">{d.description}</p>
                    {d.resolution && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5">
                        <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Resolution</p>
                        <p className="text-sm text-green-500">{d.resolution}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}