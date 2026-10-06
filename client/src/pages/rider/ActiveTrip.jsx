import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

export default function ActiveTrip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

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

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await API.patch(`/trips/${id}/cancel`)
      navigate('/rider/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  const steps = [
    { key: 'requested', label: 'Requested' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'driver_arriving', label: 'Driver Arriving' },
    { key: 'trip_started', label: 'Trip Started' },
    { key: 'completed', label: 'Completed' },
  ]

  const currentStep = steps.findIndex(s => s.key === trip?.status)

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-blue/10 text-brand-blue text-xs px-3 py-1.5 rounded-full font-medium">
              ● ACTIVE TRIP
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Live Tracking</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {['requested', 'accepted', 'driver_arriving'].includes(trip?.status) && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm px-4 py-2 rounded-lg transition-all font-medium">
                {cancelling ? 'Cancelling...' : '✕ Cancel Ride'}
              </button>
            )}
            <button className="bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white/70 text-sm px-4 py-2 rounded-lg transition-all">
              ↗ Share Trip
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 dark:text-white/40">Loading trip...</div>
          </div>
        ) : (
          <main className="flex-1 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left — driver info + status */}
              <div className="space-y-6">

                {/* Driver card */}
                {trip?.driver ? (
                  <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white text-xl font-bold">
                        {trip.driver.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{trip.driver.name}</p>
                        <p className="text-xs text-yellow-400">★ 4.98</p>
                      </div>
                      <button className="ml-auto w-8 h-8 bg-gray-100 dark:bg-navy-700 rounded-lg flex items-center justify-center text-sm">💬</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-navy-700 rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        <p className="text-xs text-gray-500 dark:text-white/40">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.driver.phone}</p>
                      </div>
                      <div className="bg-white dark:bg-navy-700 rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        <p className="text-xs text-gray-500 dark:text-white/40">Vehicle</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Tesla Model S</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm py-2.5 rounded-xl transition-all">
                        📞 Call
                      </button>
                      <button className="flex-1 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white/70 text-sm py-2.5 rounded-xl transition-all">
                        💬 Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-sm text-gray-500 dark:text-white/40">Finding your driver...</p>
                  </div>
                )}

                {/* Trip status timeline */}
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Trip Status</h3>
                  <div className="space-y-4">
                    {steps.map((step, i) => {
                      const isDone = i < currentStep
                      const isCurrent = i === currentStep
                      const isPending = i > currentStep
                      return (
                        <div key={step.key} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            isDone ? 'bg-green-500' :
                            isCurrent ? 'bg-brand-blue ring-4 ring-brand-blue/20' :
                            'bg-gray-200 dark:bg-navy-600'
                          }`}></div>
                          <span className={`text-sm ${
                            isCurrent ? 'text-brand-blue font-medium' :
                            isDone ? 'text-green-500' :
                            'text-gray-400 dark:text-white/30'
                          }`}>{step.label}</span>
                          {isCurrent && (
                            <span className="ml-auto text-xs text-brand-blue animate-pulse">Now</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right — map placeholder + trip details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Map placeholder */}
                <div className="bg-gray-100 dark:bg-navy-800 rounded-2xl h-72 border border-gray-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                  </div>
                  <div className="text-center z-10">
                    <div className="text-5xl mb-3">🗺️</div>
                    <p className="text-gray-500 dark:text-white/40 text-sm">Live map tracking</p>
                    <p className="text-xs text-gray-400 dark:text-white/20 mt-1">Driver is 3 minutes away</p>
                  </div>
                  {trip?.status === 'driver_arriving' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs px-4 py-2 rounded-full">
                      ↑ Turn right on Montgomery St
                    </div>
                  )}
                </div>

                {/* Trip details */}
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Pickup</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{trip?.pickupLocation}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Destination</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{trip?.destination}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Arrival Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">~15 mins</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">Total Fare</p>
                      <p className="text-sm font-medium text-brand-blue">
                        {trip?.fare ? `₦${trip.fare}` : 'Calculating...'}
                      </p>
                    </div>
                  </div>

                  {trip?.status === 'completed' && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/5 flex gap-3">
                      <button
                        onClick={() => navigate('/rider/disputes')}
                        className="flex-1 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white/70 py-3 rounded-xl text-sm font-medium hover:border-brand-blue border border-transparent transition-all">
                        Submit Dispute
                      </button>
                      <button
                        onClick={() => navigate('/rider/dashboard')}
                        className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white py-3 rounded-xl text-sm font-medium transition-all">
                        Back to Dashboard
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