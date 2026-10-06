import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeDisputes: 0,
    resolvedDisputes: 0,
    escalatedDisputes: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const disputesRes = await API.get('/disputes/all')
      const disputes = disputesRes.data
      setStats({
        totalTrips: disputes.length * 12,
        activeDisputes: disputes.filter(d => d.status === 'open' || d.status === 'under_review').length,
        resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
        escalatedDisputes: disputes.filter(d => d.status === 'escalated').length,
      })
      setRecentActivity(disputes.slice(0, 5))
    } catch (err) {
      console.error(err)
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

  const barHeights = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88]
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Real-time mobility metrics and fleet status.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="flex items-center gap-2 bg-gray-100 dark:bg-navy-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-sm px-4 py-2 rounded-xl hover:border-brand-blue transition-all">
              📅 Last 30 Days
            </button>
            <button className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm px-4 py-2 rounded-xl transition-all">
              ↑ Generate Report
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Trips', value: stats.totalTrips.toLocaleString(), change: '+12.5%', color: 'text-green-500', icon: '🚗', bg: 'bg-brand-blue/10' },
              { label: 'Active Disputes', value: stats.activeDisputes, change: '-2.4%', color: 'text-red-500', icon: '⚑', bg: 'bg-red-500/10', note: `${stats.activeDisputes} requiring attention` },
              { label: 'Escalated', value: stats.escalatedDisputes, change: '8 New', color: 'text-yellow-500', icon: '⚠️', bg: 'bg-yellow-500/10', note: 'Avg verification: 4.1h' },
              { label: 'Revenue', value: '₦48,290', change: '+16.2%', color: 'text-green-500', icon: '💰', bg: 'bg-green-500/10', note: 'Projected 55k this month' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-5 border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center text-lg`}>
                    {stat.icon}
                  </div>
                  <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.note && <p className="text-xs text-gray-400 dark:text-white/20 mt-1">{stat.note}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Trip volume chart */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Trip Volume</h2>
                  <p className="text-xs text-gray-500 dark:text-white/40">Demand distribution across premium fleets</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue inline-block"></span> Lux</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span> Standard</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-40">
                {barHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-0.5" style={{ height: `${h * 1.4}px` }}>
                      <div className="w-full bg-brand-blue rounded-t-sm flex-1"></div>
                      <div className="w-full bg-brand-blue/30 rounded-b-sm" style={{ height: '30%' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-white/20">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet density */}
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Fleet Density</h2>
                  <p className="text-xs text-gray-500 dark:text-white/40">Live operational zones</p>
                </div>
                <span className="text-xs bg-brand-blue text-white px-2 py-1 rounded-full">● LIVE</span>
              </div>
              <div className="bg-gray-100 dark:bg-navy-700 rounded-xl h-40 flex items-center justify-center relative overflow-hidden mb-4">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #2563eb 0%, transparent 60%)' }}>
                </div>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
                <div className="z-10 text-center">
                  <p className="text-xs text-brand-blue font-medium">Downtown Core</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-white/40">Downtown Core</span>
                <span className="text-brand-blue font-medium">High Demand</span>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-xs text-gray-500 dark:text-white/40">Audit trail of critical system events</p>
              </div>
              <button
                onClick={() => navigate('/admin/disputes')}
                className="text-xs text-brand-blue hover:underline">
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-gray-200 dark:bg-navy-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-white/40 text-sm">No recent activity.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                      <th className="text-left pb-3">Transaction ID</th>
                      <th className="text-left pb-3">Entity</th>
                      <th className="text-left pb-3">Status</th>
                      <th className="text-left pb-3">Severity</th>
                      <th className="text-left pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {recentActivity.map(d => (
                      <tr key={d._id} className="border-t border-gray-200 dark:border-white/5">
                        <td className="py-3 text-sm text-brand-blue font-medium">
                          #RL-{d._id.slice(-4).toUpperCase()}
                        </td>
                        <td className="py-3">
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
                        <td className="py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${statusColor(d.status)}`}>
                            {d.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-500 dark:text-white/40">
                          {d.status === 'escalated' ? 'High' : d.status === 'under_review' ? 'Moderate' : 'Low'}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => navigate('/admin/disputes')}
                            className="text-xs text-brand-blue hover:underline">
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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