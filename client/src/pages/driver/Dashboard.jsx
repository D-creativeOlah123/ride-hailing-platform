import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'
import beep from '../../utils/sound'

export default function DriverDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const prevTripCount = useRef(0)

  useEffect(() => {
    fetchAvailableTrips()
    const interval = setInterval(fetchAvailableTrips, 8000)
    return () => clearInterval(interval)
  }, [])

  const fetchAvailableTrips = async () => {
    try {
      const res = await API.get('/trips/available')
      const newTrips = res.data
      if (prevTripCount.current > 0 && newTrips.length > prevTripCount.current) {
        beep()
      }
      prevTripCount.current = newTrips.length
      setTrips(newTrips)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (tripId) => {
    setAccepting(tripId)
    try {
      await API.patch(`/trips/${tripId}/accept`)
      navigate(`/driver/trip/${tripId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setAccepting(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Your vehicle is ready and the city is active.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex bg-gray-100 dark:bg-navy-800 rounded-xl p-1">
              <button onClick={() => setIsOnline(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  isOnline ? 'bg-brand-blue text-white' : 'text-gray-500 dark:text-white/40'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                ONLINE
              </button>
              <button onClick={() => setIsOnline(false)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  !isOnline ? 'bg-gray-300 dark:bg-navy-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/40'
                }`}>
                OFFLINE
              </button>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Earnings */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Earnings Summary</h2>
                  <span className="text-2xl">💰</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Daily Earnings</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">₦342.50</p>
                    <p className="text-xs text-green-500 mt-1">↑ +12% vs yesterday</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Weekly Total</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">₦2,840.12</p>
                    <p className="text-xs text-gray-500 dark:text-white/40 mt-1">📅 6 days completed</p>
                  </div>
                </div>
              </div>

              {/* Available trips */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Available Trip Requests</h2>
                  <div className="flex items-center gap-2">
                    {trips.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-500 animate-pulse">
                        ● Live
                      </span>
                    )}
                    <span className="text-xs bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded-full font-medium">
                      {trips.length} NEARBY
                    </span>
                  </div>
                </div>

                {!isOnline ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🔴</div>
                    <p className="text-gray-500 dark:text-white/40 text-sm">You are offline. Go online to see trip requests.</p>
                  </div>
                ) : loading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-navy-700 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : trips.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🚗</div>
                    <p className="text-gray-500 dark:text-white/40 text-sm">No trip requests available right now.</p>
                    <p className="text-xs text-gray-400 dark:text-white/20 mt-1">Checking every 8 seconds...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trips.map(trip => (
                      <div key={trip._id}
                        className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-brand-blue/20 hover:border-brand-blue/50 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0"></div>
                              <div>
                                <p className="text-xs text-gray-400 dark:text-white/30 uppercase">Pickup</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.pickupLocation}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                              <div>
                                <p className="text-xs text-gray-400 dark:text-white/30 uppercase">Destination</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.destination}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-brand-blue">₦{Math.floor(Math.random() * 3000) + 500}</p>
                            <p className="text-xs text-gray-400 dark:text-white/30">Est. fare</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/40">
                            <span>👤 {trip.rider?.name}</span>
                            <span>📞 {trip.rider?.phone}</span>
                          </div>
                          <button
                            onClick={() => handleAccept(trip._id)}
                            disabled={accepting === trip._id}
                            className="bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-60 text-white text-sm px-5 py-2 rounded-xl transition-all font-medium flex items-center gap-2">
                            {accepting === trip._id ? (
                              <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Accepting...
                              </>
                            ) : 'Accept Trip'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <div className="bg-gray-100 dark:bg-navy-700 rounded-xl h-40 mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #2563eb 0%, transparent 60%)' }}>
                  </div>
                  <div className="z-10 text-center">
                    <span className="text-xs bg-brand-blue text-white px-2 py-1 rounded-full">● HIGH DEMAND AREA</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">City Heatmap</p>
                <p className="text-xs text-gray-500 dark:text-white/40">Earnings are currently 1.5x higher downtown.</p>
                <button className="w-full mt-3 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white/70 text-xs py-2.5 rounded-xl transition-all">
                  Open Full Map
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Vehicle Health</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-white/40">Fuel Level</span>
                      <span className="text-gray-900 dark:text-white font-medium">85%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-navy-600 rounded-full">
                      <div className="h-1.5 bg-brand-blue rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-white/40">Tire Pressure</span>
                      <span className="text-green-500 font-medium">OPTIMAL</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-navy-600 rounded-full">
                      <div className="h-1.5 bg-green-500 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/40 mt-4">⏱ Next service in 1,240 miles</p>
              </div>

              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: '📋', label: 'Trip History', path: '/driver/activity' },
                    { icon: '⚑', label: 'My Disputes', path: '/driver/disputes' },
                    { icon: '⚙', label: 'Settings', path: '/driver/settings' },
                  ].map(a => (
                    <button key={a.label} onClick={() => navigate(a.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 text-sm text-gray-700 dark:text-white/70 hover:text-brand-blue transition-all text-left">
                      <span>{a.icon}</span>
                      {a.label}
                    </button>
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