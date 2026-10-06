import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

export default function RiderDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState(0)

  useEffect(() => {
    fetchRecentTrips()
  }, [])

  const fetchRecentTrips = async () => {
    setLoading(true)
    try {
      const res = await API.get('/trips/history')
      setRecentTrips(res.data.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookRide = async () => {
    if (!pickup || !destination) return
    setBooking(true)
    setBookingStep(1)
    try {
      await new Promise(r => setTimeout(r, 1000))
      setBookingStep(2)
      const res = await API.post('/trips/request', {
        pickupLocation: pickup,
        destination: destination
      })
      setBookingStep(3)
      await new Promise(r => setTimeout(r, 800))
      navigate(`/rider/trip/${res.data.trip._id}`)
    } catch (err) {
      console.error(err)
      setBooking(false)
      setBookingStep(0)
    }
  }

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-500/10 text-green-500'
    if (status === 'cancelled') return 'bg-red-500/10 text-red-500'
    if (status === 'requested') return 'bg-yellow-500/10 text-yellow-500'
    return 'bg-brand-blue/10 text-brand-blue'
  }

  const totalSpent = recentTrips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.fare || 0), 0)

  const totalTrips = recentTrips.length
  const cancelled = recentTrips.filter(t => t.status === 'cancelled').length

  const bookingSteps = [
    { icon: '📍', label: 'Confirming your location...' },
    { icon: '🔍', label: 'Finding available drivers...' },
    { icon: '✅', label: 'Ride confirmed! Redirecting...' },
  ]

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">

      {/* Booking loading overlay */}
      {booking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-navy-800 rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-brand-blue/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-blue border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                {bookingSteps[bookingStep - 1]?.icon || '🚗'}
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Booking Your Ride
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/40 mb-6">
              {bookingSteps[bookingStep - 1]?.label || 'Please wait...'}
            </p>
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {bookingSteps.map((_, i) => (
                <div key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < bookingStep ? 'w-8 bg-brand-blue' : 'w-2 bg-gray-200 dark:bg-navy-600'
                  }`}>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-navy-700 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0"></div>
                <p className="text-xs text-gray-700 dark:text-white/70 truncate">{pickup}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                <p className="text-xs text-gray-700 dark:text-white/70 truncate">{destination}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top navbar */}
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Hello, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs text-gray-500 dark:text-white/40">
              Your executive transport is ready for dispatch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate('/rider/settings')}
              className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold hover:bg-brand-blue-hover transition-all">
              {user?.name?.charAt(0)}
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Book a ride */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  🔒 Where to?
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus-within:border-brand-blue transition-colors">
                    <div className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0"></div>
                    <input
                      type="text"
                      placeholder="Current Location"
                      value={pickup}
                      onChange={e => setPickup(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus-within:border-brand-blue transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                    <input
                      type="text"
                      placeholder="Enter Destination"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleBookRide}
                  disabled={booking || !pickup || !destination}
                  className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                  {booking ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Finding your ride...
                    </>
                  ) : 'Book Ride'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Total Trips</span>
                    <span className="text-blue-500 text-lg">🕐</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalTrips}</p>
                  <p className="text-xs text-green-500 mt-1">+12% from last month</p>
                </div>
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Amount Spent</span>
                    <span className="text-green-500 text-lg">💳</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">₦{totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-1">Corporate billing enabled</p>
                </div>
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Cancelled</span>
                    <span className="text-red-500 text-lg">✕</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{cancelled.toString().padStart(2, '0')}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-1">98% reliability score</p>
                </div>
              </div>

              {/* Recent Trips */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Trips</h2>
                  <button onClick={() => navigate('/rider/activity')}
                    className="text-xs text-brand-blue hover:underline">
                    View All History
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-navy-700 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : recentTrips.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🚗</div>
                    <p className="text-gray-500 dark:text-white/40 text-sm">No trips yet. Book your first ride!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrips.map(trip => (
                      <div key={trip._id}
                        className="flex items-center justify-between bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 transition-all cursor-pointer"
                        onClick={() => navigate(`/rider/trip/${trip._id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-navy-600 rounded-lg flex items-center justify-center text-sm">🚗</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                              To {trip.destination}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-white/40">
                              {new Date(trip.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {trip.fare && <span className="text-sm font-semibold text-gray-900 dark:text-white">₦{trip.fare}</span>}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(trip.status)}`}>
                            {trip.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Membership card */}
              <div className="bg-brand-blue rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-blue-200 text-xs uppercase tracking-wider">Active Membership</span>
                </div>
                <p className="text-xl font-bold mb-4">⭐ Elite Platinum</p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-200">Next Reward</span>
                    <span>120 pts</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full">
                    <div className="h-1.5 bg-white rounded-full w-2/3"></div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg transition-all">Benefits</button>
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg transition-all">Manage</button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { icon: '📋', label: 'View Trip History', path: '/rider/activity' },
                    { icon: '📊', label: 'Analytics', path: '/rider/analytics' },
                    { icon: '⚑', label: 'Submit Dispute', path: '/rider/disputes' },
                    { icon: '⚙', label: 'Account Settings', path: '/rider/settings' },
                  ].map(action => (
                    <button key={action.label}
                      onClick={() => navigate(action.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 text-sm text-gray-700 dark:text-white/70 hover:text-brand-blue transition-all text-left">
                      <span>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="px-8 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
          <span className="text-brand-blue font-bold text-sm">RideLink</span>
          <p className="text-xs text-gray-400 dark:text-white/20">© 2024 RideLink. Precision in Motion.</p>
          <div className="flex gap-4 text-xs text-gray-400 dark:text-white/20">
            <a href="#" className="hover:text-brand-blue">Support</a>
            <a href="#" className="hover:text-brand-blue">Safety</a>
            <a href="#" className="hover:text-brand-blue">Legal</a>
            <a href="#" className="hover:text-brand-blue">Privacy</a>
          </div>
        </footer>
      </div>
    </div>
  )
}