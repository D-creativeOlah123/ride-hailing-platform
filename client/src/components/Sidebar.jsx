import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, History, Flag, BarChart3, Settings, Car, LogOut, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { Avatar } from './ui'

const navItems = {
  rider: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/rider/dashboard' },
    { label: 'Activity', icon: History, path: '/rider/activity' },
    { label: 'Disputes', icon: Flag, path: '/rider/disputes' },
    { label: 'Analytics', icon: BarChart3, path: '/rider/analytics' },
    { label: 'Settings', icon: Settings, path: '/rider/settings' },
  ],
  driver: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/driver/dashboard' },
    { label: 'Activity', icon: History, path: '/driver/activity' },
    { label: 'Disputes', icon: Flag, path: '/driver/disputes' },
    { label: 'Analytics', icon: BarChart3, path: '/driver/analytics' },
    { label: 'Settings', icon: Settings, path: '/driver/settings' },
  ],
  ops_manager: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Activity', icon: History, path: '/admin/activity' },
    { label: 'Disputes', icon: Flag, path: '/admin/disputes' },
    { label: 'Drivers', icon: Car, path: '/admin/drivers' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
  super_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Activity', icon: History, path: '/admin/activity' },
    { label: 'Disputes', icon: Flag, path: '/admin/disputes' },
    { label: 'Drivers', icon: Car, path: '/admin/drivers' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
}

const roleLabels = {
  rider: 'Rider',
  driver: 'Driver',
  ops_manager: 'Operations manager',
  super_admin: 'Super admin',
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const items = navItems[user?.role] || []
  const home = items[0]?.path || '/'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full w-full flex-col bg-surface lg:bg-transparent">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo to={home} />
        {onClose && (
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm lg:hidden" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-4" aria-label="Main">
        <p className="eyebrow px-3 pb-2">Menu</p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-surface-2 font-medium text-ink shadow-xs ring-1 ring-inset ring-line dark:bg-surface-3'
                      : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-accent-text' : 'text-ink-subtle group-hover:text-ink-muted'}`}
                    strokeWidth={1.75}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-subtle">{roleLabels[user?.role] || 'Member'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )
}
