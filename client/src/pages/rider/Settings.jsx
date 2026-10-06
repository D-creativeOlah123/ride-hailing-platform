import { useState } from 'react'
import { User, Shield, Bell, Palette, CheckCircle2, ChevronDown, Smartphone } from 'lucide-react'
import AppShell from '../../components/AppShell'
import ThemeToggle from '../../components/ThemeToggle'
import { SectionHeader, Avatar } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

const TAB_ICONS = {
  profile: User,
  security: Shield,
  notifications: Bell,
  appearance: Palette,
}

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

  const cardFooter = 'flex flex-col-reverse gap-2 border-t border-line bg-surface-2/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-6'

  return (
    <AppShell title="Account Settings" subtitle="Manage your profile and preferences.">
      <div className="max-w-3xl">
        {/* Tabs */}
        <div className="mb-6 border-b border-line">
          <div className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
            {['profile', 'security', 'notifications', 'appearance'].map(tab => {
              const Icon = TAB_ICONS[tab]
              return (
                <button key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 pt-1 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-accent text-ink'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {tab}
                </button>
              )
            })}
          </div>
        </div>

        {saved && (
          <div className="alert alert-success mb-6 animate-fade-in" role="status">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>Changes saved successfully!</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <section className="card overflow-hidden">
            {/* Avatar */}
            <div className="flex items-center gap-4 border-b border-line p-5 sm:gap-5 sm:p-6">
              <Avatar name={user?.name} className="h-14 w-14 text-lg sm:h-16 sm:w-16 sm:text-xl" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">{user?.name}</p>
                <p className="mt-0.5 text-[13px] capitalize text-ink-muted">{user?.role?.replace('_', ' ')} · Premium Tier</p>
                <button type="button" className="link mt-1.5 text-[13px]">Change avatar</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <label htmlFor="settings-name" className="label">Full Name</label>
                <input id="settings-name" type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label htmlFor="settings-email" className="label">Email Address</label>
                <input id="settings-email" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label htmlFor="settings-phone" className="label">Phone Number</label>
                <input id="settings-phone" type="tel" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label htmlFor="settings-role" className="label">Role</label>
                <input id="settings-role" type="text" value={user?.role?.replace('_', ' ')} disabled
                  className="input bg-surface-2 capitalize" />
              </div>
            </div>

            <div className={cardFooter}>
              <button type="button" onClick={handleSave} className="btn btn-primary w-full sm:w-auto">
                Save Changes
              </button>
            </div>
          </section>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <section className="card overflow-hidden">
              <div className="p-5 sm:p-6">
                <SectionHeader title="Change Password" />
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="settings-current-password" className="label">Current Password</label>
                    <input id="settings-current-password" type="password" placeholder="••••••••" value={form.currentPassword}
                      onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                      className="input" />
                  </div>
                  <div>
                    <label htmlFor="settings-new-password" className="label">New Password</label>
                    <input id="settings-new-password" type="password" placeholder="••••••••" value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      className="input" />
                  </div>
                  <div>
                    <label htmlFor="settings-confirm-password" className="label">Confirm New Password</label>
                    <input id="settings-confirm-password" type="password" placeholder="••••••••" value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      className="input" />
                  </div>
                </div>
              </div>
              <div className={cardFooter}>
                <button type="button" onClick={handleSave} className="btn btn-primary w-full sm:w-auto">
                  Update Password
                </button>
              </div>
            </section>

            <section className="card card-pad">
              <SectionHeader title="Two-Factor Authentication" />
              <div className="well mt-4 flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted">
                  <Smartphone className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">Authenticator App</p>
                  <p className="text-xs text-ink-muted">Add an extra layer of security</p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm shrink-0">Enable</button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'notifications' && (
          <section className="card overflow-hidden">
            <SectionHeader className="p-5 sm:p-6" title="Notification Preferences" />
            <ul className="divide-y divide-line border-t border-line">
              {[
                { label: 'Trip Updates', desc: 'Get notified about your trip status changes', default: true },
                { label: 'Dispute Updates', desc: 'Notifications when your dispute status changes', default: true },
                { label: 'Promotions', desc: 'Receive offers and discount notifications', default: false },
                { label: 'Sound Alerts', desc: 'Play sound when new trip requests arrive', default: true },
                { label: 'Email Notifications', desc: 'Receive summaries and updates via email', default: false },
              ].map(item => (
                <li key={item.label} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={item.default} className="peer sr-only" aria-label={item.label} />
                    <div className="h-5 w-9 rounded-full bg-surface-3 ring-1 ring-inset ring-line-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-xs after:transition-transform after:content-[''] peer-checked:bg-accent peer-checked:ring-accent peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50" />
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'appearance' && (
          <section className="card overflow-hidden">
            <SectionHeader className="p-5 sm:p-6" title="Appearance" />
            <div className="divide-y divide-line border-t border-line">
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Theme</p>
                  <p className="mt-0.5 text-xs text-ink-muted">Toggle between light and dark mode</p>
                </div>
                <ThemeToggle className="btn-secondary shrink-0" />
              </div>
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <label htmlFor="settings-language" className="text-sm font-medium text-ink">Language</label>
                <div className="relative sm:w-56">
                  <select id="settings-language" className="input h-10">
                    <option>English (US)</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" strokeWidth={1.75} />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
}
