import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import API from '../../api'

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await API.get('/auth/pending-drivers')
      setDrivers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, approved) => {
    setProcessing(id)
    try {
      await API.patch(`/auth/drivers/${id}/approve`, { approved })
      setSuccess(approved ? 'Driver approved successfully!' : 'Driver rejected.')
      fetchDrivers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Driver Approvals</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Review and approve pending driver applications.</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-8">
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
              ✓ {success}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-navy-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-12 border border-gray-200 dark:border-white/5 text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-gray-900 dark:text-white font-semibold mb-2">All caught up!</p>
              <p className="text-gray-500 dark:text-white/40 text-sm">No pending driver applications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.map(driver => (
                <div key={driver._id}
                  className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center text-white text-lg font-bold">
                        {driver.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{driver.name}</p>
                        <p className="text-xs text-gray-500 dark:text-white/40">{driver.email}</p>
                        <p className="text-xs text-gray-500 dark:text-white/40">{driver.phone}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full font-medium">
                      Pending Review
                    </span>
                  </div>

                  {driver.vehicle && (
                    <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Make', value: driver.vehicle.make },
                        { label: 'Model', value: driver.vehicle.model },
                        { label: 'Year', value: driver.vehicle.year },
                        { label: 'Plate', value: driver.vehicle.plateNumber },
                      ].map(item => (
                        <div key={item.label} className="bg-white dark:bg-navy-700 rounded-xl p-3 border border-gray-200 dark:border-white/5">
                          <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleApprove(driver._id, true)}
                      disabled={processing === driver._id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                      {processing === driver._id ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : '✓'} Approve Driver
                    </button>
                    <button
                      onClick={() => handleApprove(driver._id, false)}
                      disabled={processing === driver._id}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl text-sm font-medium transition-all">
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}