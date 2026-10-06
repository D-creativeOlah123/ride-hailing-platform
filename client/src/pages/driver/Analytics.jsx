import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import API from '../../api'

export default function Analytics() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/trips/history').then(res => {
      setTrips(res.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const completed = trips.filter(t => t.status === 'completed')
  const cancelled = trips.filter(t => t.status === 'cancelled')
  const totalSpent = completed.reduce((s, t) => s + (t.fare || 0), 0)
  const avgFare = completed.length ? Math.round(totalSpent / completed.length) : 0
  const completionRate = trips.length ? Math.round((completed.length / trips.length) * 100) : 0

  const barHeights = [30, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80]
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D']

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Your trip and spending insights.</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-8">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-navy-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Trips', value: trips.length, icon: '🚗', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
                  { label: user?.role === 'driver' ? 'Total Earned' : 'Total Spent', value: `₦${totalSpent.toLocaleString()}`, icon: '💰', color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Avg Fare', value: `₦${avgFare}`, icon: '📊', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                  { label: 'Completion Rate', value: `${completionRate}%`, icon: '✅', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center text-lg mb-3`}>
                      {stat.icon}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar chart */}
                <div className="lg:col-span-2 bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">
                    {user?.role === 'driver' ? 'Earnings' : 'Spending'} Over Time
                  </h2>
                  <div className="flex items-end gap-2 h-40 mb-2">
                    {barHeights.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-brand-blue rounded-t-sm hover:bg-brand-blue-hover transition-colors cursor-pointer"
                          style={{ height: `${h * 1.4}px` }}>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-white/20">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trip breakdown */}
                <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Trip Breakdown</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-white/40">Completed</span>
                        <span className="text-green-500 font-medium">{completed.length}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-navy-600 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full transition-all"
                          style={{ width: `${trips.length ? (completed.length/trips.length)*100 : 0}%` }}>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-white/40">Cancelled</span>
                        <span className="text-red-500 font-medium">{cancelled.length}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-navy-600 rounded-full">
                        <div className="h-2 bg-red-500 rounded-full transition-all"
                          style={{ width: `${trips.length ? (cancelled.length/trips.length)*100 : 0}%` }}>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-white/40">Completion rate</span>
                        <span className="text-brand-blue font-medium">{completionRate}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-navy-600 rounded-full">
                        <div className="h-2 bg-brand-blue rounded-full transition-all"
                          style={{ width: `${completionRate}%` }}>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-white/40">Total trips</span>
                      <span className="font-bold text-gray-900 dark:text-white">{trips.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-white/40">Avg fare</span>
                      <span className="font-bold text-gray-900 dark:text-white">₦{avgFare}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-white/40">Total {user?.role === 'driver' ? 'earned' : 'spent'}</span>
                      <span className="font-bold text-brand-blue">₦{totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}