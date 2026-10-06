import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass = "w-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue transition-colors"
  const labelClass = "text-xs font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2 block"

  return (
    <div className="flex min-h-screen bg-white dark:bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-8 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Manage your profile and preferences.</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-8 max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['profile', 'security', 'notifications', 'appearance'].map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 dark:bg-navy-800 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {saved && (
            <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
              ✓ Changes saved successfully!
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-5 pb-5 border-b border-gray-200 dark:border-white/5">
                <div className="w-20 h-20 rounded-full bg-brand-blue flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 capitalize mt-1">{user?.role?.replace('_', ' ')} · Premium Tier</p>
                  <button className="text-xs text-brand-blue hover:underline mt-2">Change avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input type="text" value={user?.role?.replace('_', ' ')} disabled
                    className={`${inputClass} opacity-50 cursor-not-allowed capitalize`} />
                </div>
              </div>

              <button onClick={handleSave}
                className="bg-brand-blue hover:bg-brand-blue-hover text-white px-6 py-3 rounded-xl text-sm font-medium transition-all">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Change Password</h2>
              <div>
                <label className={labelClass}>Current Password</label>
                <input type="password" placeholder="••••••••" value={form.currentPassword}
                  onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" placeholder="••••••••" value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type="password" placeholder="••••••••" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputClass} />
              </div>
              <button onClick={handleSave}
                className="bg-brand-blue hover:bg-brand-blue-hover text-white px-6 py-3 rounded-xl text-sm font-medium transition-all">
                Update Password
              </button>

              <div className="pt-4 border-t border-gray-200 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Authenticator App</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">Add an extra layer of security</p>
                  </div>
                  <button className="text-xs bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-lg">Enable</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Notification Preferences</h2>
              {[
                { label: 'Trip Updates', desc: 'Get notified about your trip status changes', default: true },
                { label: 'Dispute Updates', desc: 'Notifications when your dispute status changes', default: true },
                { label: 'Promotions', desc: 'Receive offers and discount notifications', default: false },
                { label: 'Sound Alerts', desc: 'Play sound when new trip requests arrive', default: true },
                { label: 'Email Notifications', desc: 'Receive summaries and updates via email', default: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 dark:bg-navy-600 peer-checked:bg-brand-blue rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Appearance</h2>
              <div className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">Toggle between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
              <div className="bg-white dark:bg-navy-700 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Language</p>
                <select className="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-blue">
                  <option>English (US)</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}