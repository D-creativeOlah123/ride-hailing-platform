import { useState } from 'react'
import { User, Shield, Bell, Palette, CheckCircle2, ChevronDown, Smartphone, AlertCircle } from 'lucide-react'
import AppShell from '../../components/AppShell'
import ThemeToggle from '../../components/ThemeToggle'
import { SectionHeader, Avatar, Spinner, ComingSoon } from '../../components/ui'
import useAccountSettings from '../../hooks/useAccountSettings'

const TAB_ICONS = {
  profile: User,
  security: Shield,
  notifications: Bell,
  appearance: Palette,
}

const NOTIFICATION_PREFS = [
  { label: 'Trip Updates', desc: 'Get notified about your trip status changes' },
  { label: 'Dispute Updates', desc: 'Notifications when your dispute status changes' },
  { label: 'Promotions', desc: 'Receive offers and discount notifications' },
  { label: 'Sound Alerts', desc: 'Play sound when new trip requests arrive' },
  { label: 'Email Notifications', desc: 'Receive summaries and updates via email' },
]

function ErrorAlert({ children }) {
  if (!children) return null
  return (
    <div className="alert alert-danger" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>{children}</span>
    </div>
  )
}

export default function Settings() {
  const {
    account,
    profile, setProfile, profileLoading, savingProfile, profileError, saveProfile,
    passwords, setPasswords, savingPassword, passwordError, changePassword,
    success,
  } = useAccountSettings()
  const [activeTab, setActiveTab] = useState('profile')

  const roleLabel = account?.role?.replace('_', ' ') || ''
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

        {success && (
          <div className="alert alert-success mb-6 animate-fade-in" role="status">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={saveProfile} className="card overflow-hidden" noValidate>
            {/* Avatar */}
            <div className="flex items-center gap-4 border-b border-line p-5 sm:gap-5 sm:p-6">
              <Avatar name={account?.name} className="h-14 w-14 text-lg sm:h-16 sm:w-16 sm:text-xl" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">{account?.name}</p>
                <p className="mt-0.5 truncate text-[13px] capitalize text-ink-muted">{roleLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {profileError && <div className="sm:col-span-2"><ErrorAlert>{profileError}</ErrorAlert></div>}
              <div>
                <label htmlFor="settings-name" className="label">Full Name</label>
                <input id="settings-name" type="text" autoComplete="name" value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label htmlFor="settings-email" className="label">Email Address</label>
                <input id="settings-email" type="email" value={account?.email || ''} readOnly disabled
                  className="input bg-surface-2" />
              </div>
              <div>
                <label htmlFor="settings-phone" className="label">Phone Number</label>
                <input id="settings-phone" type="tel" autoComplete="tel" value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label htmlFor="settings-role" className="label">Role</label>
                <input id="settings-role" type="text" value={roleLabel} readOnly disabled
                  className="input bg-surface-2 capitalize" />
              </div>
            </div>

            <div className={cardFooter}>
              <button type="submit" disabled={profileLoading || savingProfile} className="btn btn-primary w-full sm:w-auto">
                {savingProfile ? <><Spinner /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={changePassword} className="card overflow-hidden" noValidate>
              <div className="p-5 sm:p-6">
                <SectionHeader title="Change Password" description="Use at least 8 characters." />
                {passwordError && <div className="mt-5"><ErrorAlert>{passwordError}</ErrorAlert></div>}
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="settings-current-password" className="label">Current Password</label>
                    <input id="settings-current-password" type="password" autoComplete="current-password" placeholder="••••••••" value={passwords.currentPassword}
                      onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      className="input" />
                  </div>
                  <div>
                    <label htmlFor="settings-new-password" className="label">New Password</label>
                    <input id="settings-new-password" type="password" autoComplete="new-password" placeholder="••••••••" value={passwords.newPassword}
                      onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="input" />
                  </div>
                  <div>
                    <label htmlFor="settings-confirm-password" className="label">Confirm New Password</label>
                    <input id="settings-confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" value={passwords.confirmPassword}
                      onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="input" />
                  </div>
                </div>
              </div>
              <div className={cardFooter}>
                <button type="submit" disabled={savingPassword} className="btn btn-primary w-full sm:w-auto">
                  {savingPassword ? <><Spinner /> Updating…</> : 'Update Password'}
                </button>
              </div>
            </form>

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
                <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <ComingSoon />
                  <button type="button" disabled title="Coming soon" className="btn btn-secondary btn-sm">Enable</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'notifications' && (
          <section className="card overflow-hidden">
            <SectionHeader
              className="p-5 sm:p-6"
              title="Notification Preferences"
              description="Notification settings aren't available yet."
              action={<ComingSoon />}
            />
            <ul className="divide-y divide-line border-t border-line">
              {NOTIFICATION_PREFS.map(item => (
                <li key={item.label} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-not-allowed items-center opacity-50" title="Coming soon">
                    <input type="checkbox" disabled className="peer sr-only" aria-label={`${item.label} (coming soon)`} />
                    <div className="h-5 w-9 rounded-full bg-surface-3 ring-1 ring-inset ring-line-strong after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-xs after:content-['']" />
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
                <div className="flex items-center gap-2">
                  <label htmlFor="settings-language" className="text-sm font-medium text-ink">Language</label>
                  <ComingSoon />
                </div>
                <div className="relative sm:w-56">
                  <select id="settings-language" disabled title="Coming soon" className="input h-10 cursor-not-allowed opacity-60">
                    <option>English (US)</option>
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
