import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = {
  rider: [
    { label: 'Dashboard', icon: '⊞', path: '/rider/dashboard' },
    { label: 'Activity', icon: '↗', path: '/rider/activity' },
    { label: 'Disputes', icon: '⚑', path: '/rider/disputes' },
    { label: 'Analytics', icon: '↑', path: '/rider/analytics' },
    { label: 'Settings', icon: '⚙', path: '/rider/settings' },
  ],
  driver: [
    { label: 'Dashboard', icon: '⊞', path: '/driver/dashboard' },
    { label: 'Activity', icon: '↗', path: '/driver/activity' },
    { label: 'Disputes', icon: '⚑', path: '/driver/disputes' },
    { label: 'Analytics', icon: '↑', path: '/driver/analytics' },
    { label: 'Settings', icon: '⚙', path: '/driver/settings' },
  ],
ops_manager: [
  { label: 'Dashboard', icon: '⊞', path: '/admin/dashboard' },
  { label: 'Activity', icon: '↗', path: '/admin/activity' },
  { label: 'Disputes', icon: '⚑', path: '/admin/disputes' },
  { label: 'Drivers', icon: '🚗', path: '/admin/drivers' },
  { label: 'Analytics', icon: '↑', path: '/admin/analytics' },
  { label: 'Settings', icon: '⚙', path: '/admin/settings' },
],
super_admin: [
  { label: 'Dashboard', icon: '⊞', path: '/admin/dashboard' },
  { label: 'Activity', icon: '↗', path: '/admin/activity' },
  { label: 'Disputes', icon: '⚑', path: '/admin/disputes' },
  { label: 'Drivers', icon: '🚗', path: '/admin/drivers' },
  { label: 'Analytics', icon: '↑', path: '/admin/analytics' },
  { label: 'Settings', icon: '⚙', path: '/admin/settings' },
],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const items = navItems[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-48 min-h-screen bg-gray-100 dark:bg-navy-800 flex flex-col py-6 px-3 border-r border-gray-200 dark:border-white/5">
      <div className="flex items-center gap-2 px-3 mb-8">
        <span className="text-brand-blue font-bold text-lg">RideLink</span>
      </div>

      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-sm font-bold text-white">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <p className="text-gray-900 dark:text-white text-xs font-semibold">{user?.name}</p>
          <p className="text-gray-500 dark:text-white/40 text-xs">Premium Tier</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-brand-blue text-white font-medium'
                  : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 px-3 py-2.5 text-left text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 rounded-lg transition-all"
      >
        Logout
      </button>
    </div>
  )
}