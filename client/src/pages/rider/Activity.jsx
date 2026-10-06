import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

export default function RiderActivity() {
  const [trips, setTrips] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const res = await API.get('/trips/history')
      setTrips(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = trips.filter(t => {
    if (filter === 'completed') return t.status === 'completed'
    if (filter === 'cancelled') return t.status === 'cancelled'
    return true
  })

  const totalSpend = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.fare || 0), 0)

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-500/10 text-green-500'
    if (status === 'cancelled') return 'bg-red-500/10 text-red-500'
    return 'bg-yellow-500/10 text-yellow-500'
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trip History</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Review and manage your past executive journeys.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex bg-gray-100 dark:bg-navy-800 rounded-xl p-1">
              {['all', 'completed', 'cancelled'].map(f => (
                <button key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === f
                      ? 'bg-white dark:bg-navy-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-28 bg-gray-100 dark:bg-navy-800 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-12 border border-gray-200 dark:border-white/5 text-center">
                  <div className="text-5xl mb-4">🚗</div>
                  <p className="text-gray-500 dark:text-white/40">No trips found.</p>
                </div>
              ) : (
                filtered.map(trip => (
                  <div key={trip._id}
                    className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-white/40">
                          {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} •{' '}
                          {new Date(trip.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 dark:text-white/70">
                          <span className="text-xs text-gray-400 dark:text-white/30 uppercase mr-2">Pickup</span>
                          {trip.pickupLocation}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 dark:text-white/70">
                          <span className="text-xs text-gray-400 dark:text-white/30 uppercase mr-2">Dropoff</span>
                          {trip.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {trip.fare ? `₦${trip.fare}` : '—'}
                      </span>
                      {trip.status === 'completed' && (
                        <button
                          onClick={() => navigate('/rider/disputes')}
                          className="text-xs text-brand-blue border border-brand-blue/30 px-3 py-1.5 rounded-lg hover:bg-brand-blue/10 transition-all">
                          Dispute
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Spend summary */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2">Total Spend</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">₦{totalSpend.toLocaleString()}</p>
                <p className="text-xs text-green-500 mt-2">↑ 12% increase this month</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 grid grid-cols-3 gap-2">
                  {[40, 65, 45, 80, 55, 90].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-full bg-brand-blue/20 rounded-sm" style={{ height: `${h * 0.6}px` }}>
                        <div className="w-full bg-brand-blue rounded-sm" style={{ height: `${h * 0.3}px`, marginTop: `${h * 0.3}px` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/40">Total trips</span>
                    <span className="font-medium text-gray-900 dark:text-white">{trips.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/40">Completed</span>
                    <span className="font-medium text-green-500">{trips.filter(t => t.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/40">Cancelled</span>
                    <span className="font-medium text-red-500">{trips.filter(t => t.status === 'cancelled').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}