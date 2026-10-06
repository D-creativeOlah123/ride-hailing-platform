import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

export default function DriverActiveTrip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTrip()
    const interval = setInterval(fetchTrip, 5000)
    return () => clearInterval(interval)
  }, [id])

  const fetchTrip = async () => {
    try {
      const res = await API.get(`/trips/${id}`)
      setTrip(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await API.patch(`/trips/${id}/status`, { status })
      fetchTrip()
      if (status === 'completed') {
        setTimeout(() => navigate('/driver/dashboard'), 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-blue/10 text-brand-blue text-xs px-3 py-1.5 rounded-full font-medium">
              ● ACTIVE TRIP
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Trip in Progress</h1>
          </div>
          <ThemeToggle />
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-white/40">Loading trip...</p>
          </div>
        ) : (
          <main className="flex-1 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white text-xl font-bold">
                      {trip?.rider?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{trip?.rider?.name}</p>
                      <p className="text-xs text-yellow-400">★ 4.98</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-5">
                    <div className="bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5">
                      <p className="text-xs text-gray-400 dark:text-white/30 uppercase">Pickup</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{trip?.pickupLocation}</p>
                    </div>
                    <div className="bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5">
                      <p className="text-xs text-gray-400 dark:text-white/30 uppercase">Destination</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{trip?.destination}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-brand-blue text-white text-sm py-2.5 rounded-xl">
                      📞 Call Rider
                    </button>
                    <button className="flex-1 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white/70 text-sm py-2.5 rounded-xl">
                      💬 Message
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-4 border border-gray-200 dark:border-white/5">
                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center gap-1 py-3 bg-red-500/10 rounded-xl">
                      <span className="text-red-500 text-lg">🆘</span>
                      <span className="text-xs text-red-500 font-medium">Emergency</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 dark:bg-navy-700 rounded-xl">
                      <span className="text-lg">📞</span>
                      <span className="text-xs text-gray-500 dark:text-white/40">Call Rider</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 dark:bg-navy-700 rounded-xl">
                      <span className="text-lg">⚠️</span>
                      <span className="text-xs text-gray-500 dark:text-white/40">Issue</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-100 dark:bg-navy-800 rounded-2xl h-80 border border-gray-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <div className="text-5xl mb-3">🗺️</div>
                    <p className="text-gray-500 dark:text-white/40 text-sm">Live navigation active</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-4">Trip Actions</p>
                  {trip?.status === 'completed' ? (
                    <div className="text-center py-6">
                      <div className="text-5xl mb-3">✅</div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">Trip Completed!</p>
                      <p className="text-sm text-gray-500 dark:text-white/40 mb-4">You earned ₦{trip.fare}</p>
                      <button onClick={() => navigate('/driver/dashboard')}
                        className="bg-brand-blue text-white px-8 py-3 rounded-xl font-medium">
                        Back to Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => trip?.status === 'accepted' && updateStatus('driver_arriving')}
                          disabled={updating || trip?.status !== 'accepted'}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            trip?.status === 'accepted'
                              ? 'bg-gray-100 dark:bg-navy-700 text-gray-900 dark:text-white'
                              : 'bg-gray-100 dark:bg-navy-700 text-gray-400 dark:text-white/20 cursor-not-allowed'
                          }`}>
                          I'm Arriving
                        </button>
                        <button
                          onClick={() => trip?.status === 'driver_arriving' && updateStatus('trip_started')}
                          disabled={updating || trip?.status !== 'driver_arriving'}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            trip?.status === 'driver_arriving'
                              ? 'bg-brand-blue text-white'
                              : 'bg-gray-100 dark:bg-navy-700 text-gray-400 dark:text-white/20 cursor-not-allowed'
                          }`}>
                          Start Trip
                        </button>
                      </div>
                      <button
                        onClick={() => trip?.status === 'trip_started' && updateStatus('completed')}
                        disabled={updating || trip?.status !== 'trip_started'}
                        className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                          trip?.status === 'trip_started'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-navy-700 text-gray-400 dark:text-white/20 cursor-not-allowed'
                        }`}>
                        {updating ? 'Updating...' : 'Complete Trip'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}