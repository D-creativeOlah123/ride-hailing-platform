import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

export default function DriverDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const res = await API.get('/disputes/mine')
      setDisputes(res.data)
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

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dispute Resolution</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Monitor your active cases and review past resolutions.</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-8 max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-navy-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : disputes.length === 0 ? (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-12 border border-gray-200 dark:border-white/5 text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-gray-900 dark:text-white font-semibold mb-2">No Disputes</p>
              <p className="text-gray-500 dark:text-white/40 text-sm">You have no active or past disputes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map(d => (
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
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}