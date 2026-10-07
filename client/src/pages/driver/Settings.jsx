import { useState } from 'react'
import { User, Shield, Bell, Palette, CheckCircle2, ChevronDown, Smartphone, AlertCircle, CarFront } from 'lucide-react'
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
  const vehicle = account?.vehicle
  const vehicleFields = vehicle
    ? [
        { label: 'Make', value: vehicle.make },
        { label: 'Model', value: vehicle.model },
        { label: 'Year', value: vehicle.year },
        { label: 'Plate Number', value: vehicle.plateNumber },
        { label: "Driver's License", value: vehicle.licenseNumber },
      ].filter(f => f.value)
    : []

  return (
    <AppShell title="Account Settings" subtitle="Manage your profile and preferences.">
      <div className="max-w-3xl">
        {/* Tabs */}
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-lg border border-line bg-surface-2 p-1" role="tablist">
            {['profile', 'security', 'notifications', 'appearance'].map(tab => {
              const Icon = TAB_ICONS[tab]
              const active = activeTab === tab
              return (
                <button key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-[13px] font-medium capitalize transition-colors ${
                    active
                      ? 'bg-surface text-ink shadow-xs ring-1 ring-line'
                      : 'text-ink-muted hover:text-ink'
                  }`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {tab}
                </button>
              )
            })}
          </div>
        </div>

        {success && (
          <div className="alert alert-success mb-4" role="status">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <form onSubmit={saveProfile} className="card" noValidate>
              {/* Avatar */}
              <div className="flex items-center gap-4 border-b border-line p-5 sm:p-6">
                <Avatar name={account?.name} className="h-16 w-16 text-xl" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-ink">{account?.name}</p>
                  <p className="mt-0.5 truncate text-xs capitalize text-ink-subtle">{roleLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
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
                    className="input" />
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
                    className="input capitalize" />
                </div>
              </div>

              <div className="flex justify-end border-t border-line px-5 py-4 sm:px-6">
                <button type="submit" disabled={profileLoading || savingProfile} className="btn btn-primary w-full sm:w-auto">
                  {savingProfile ? <><Spinner /> Saving…</> : 'Save Changes'}
                </button>
              </div>
            </form>

            {vehicleFields.length > 0 && (
              <section className="card">
                <div className="flex items-center gap-2.5 px-5 pt-5 sm:px-6 sm:pt-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                    <CarFront className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <SectionHeader className="min-w-0 flex-1" title="Vehicle" description="Contact support to change your registered vehicle." />
                </div>
                <dl className="mt-4 divide-y divide-line border-t border-line">
                  {vehicleFields.map(f => (
                    <div key={f.label} className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
                      <dt className="text-xs text-ink-subtle">{f.label}</dt>
                      <dd className="min-w-0 truncate text-sm font-medium text-ink tabular-nums">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={changePassword} className="card" noValidate>
              <div className="space-y-4 p-5 sm:p-6">
                <SectionHeader title="Change Password" description="Use at least 8 characters." />
                <ErrorAlert>{passwordError}</ErrorAlert>
                <div>
                  <label htmlFor="settings-current-password" className="label">Current Password</label>
                  <input id="settings-current-password" type="password" autoComplete="current-password" placeholder="••••••••" value={passwords.currentPassword}
                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="input" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div className="flex justify-end border-t border-line px-5 py-4 sm:px-6">
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
                  <p className="text-xs text-ink-subtle">Add an extra layer of security</p>
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
          <section className="card">
            <SectionHeader
              className="px-5 pt-5 sm:px-6 sm:pt-6"
              title="Notification Preferences"
              description="Notification settings aren't available yet."
              action={<ComingSoon />}
            />
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {NOTIFICATION_PREFS.map(item => (
                <li key={item.label} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <p className="text-xs text-ink-subtle">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-not-allowed items-center opacity-50" title="Coming soon">
                    <input type="checkbox" disabled className="peer sr-only" aria-label={`${item.label} (coming soon)`} />
                    <div className="h-5 w-9 rounded-full bg-surface-3 ring-1 ring-inset ring-line after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-xs after:content-['']"></div>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'appearance' && (
          <section className="card">
            <SectionHeader className="px-5 pt-5 sm:px-6 sm:pt-6" title="Appearance" />
            <ul className="mt-4 divide-y divide-line border-t border-line">
              <li className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Theme</p>
                  <p className="text-xs text-ink-subtle">Toggle between light and dark mode</p>
                </div>
                <ThemeToggle className="-mr-2 shrink-0" />
              </li>
              <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
              </li>
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  )
}
