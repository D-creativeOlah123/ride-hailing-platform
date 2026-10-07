import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, CalendarDays, CarFront, PowerOff, User, Phone, History, Flag, Settings, ChevronRight, Check,
  BarChart3, ArrowRight, Route as RouteIcon,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { SectionHeader, EmptyState, Skeleton, Spinner, StatusBadge, PaymentBadge } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'
import beep from '../../utils/sound'
import { naira, tripSummary } from '../../utils/tripStats'
import { rideTypeLabel, formatDistance, formatDuration } from '../../components/payments/paystack'

const ACTIVE_STATUSES = ['requested', 'accepted', 'driver_arriving', 'trip_started']
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const shortDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const shortTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export default function DriverDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const prevTripCount = useRef(0)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [vehicle, setVehicle] = useState(user?.vehicle ?? null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Promise chain so state is only set in async callbacks.
  const fetchAvailableTrips = () =>
    API.get('/trips/available')
      .then(res => {
        const newTrips = res.data
        if (prevTripCount.current > 0 && newTrips.length > prevTripCount.current) {
          beep()
        }
        prevTripCount.current = newTrips.length
        setTrips(newTrips)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchAvailableTrips()
    const interval = setInterval(fetchAvailableTrips, 8000)
    return () => clearInterval(interval)
  }, [])

  // The driver's own trips, for real earnings and the recent trips list.
  const fetchHistory = useCallback(() =>
    API.get('/trips/history')
      .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setHistoryLoading(false)),
  [])

  // Fresh profile, for the vehicle on file.
  const fetchProfile = useCallback(() =>
    API.get('/auth/me')
      .then(res => setVehicle(res.data?.user?.vehicle ?? null))
      .catch(err => console.error(err))
      .finally(() => setProfileLoading(false)),
  [])

  useEffect(() => {
    fetchHistory()
    fetchProfile()
  }, [fetchHistory, fetchProfile])

  const summary = tripSummary(history)
  const sortedHistory = [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const recentTrips = sortedHistory.slice(0, 5)
  const activeTrip = sortedHistory.find(t => ACTIVE_STATUSES.includes(t.status) && t.status !== 'requested')
  const hasVehicle = !!(vehicle && (vehicle.make || vehicle.model || vehicle.plateNumber))

  const handleAccept = async (tripId) => {
    setAccepting(tripId)
    try {
      await API.patch(`/trips/${tripId}/accept`)
      navigate(`/driver/trip/${tripId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setAccepting(null)
    }
  }

  const quickActions = [
    { icon: History, label: 'Trip History', path: '/driver/activity' },
    { icon: BarChart3, label: 'Analytics', path: '/driver/analytics' },
    { icon: Flag, label: 'My Disputes', path: '/driver/disputes' },
    { icon: Settings, label: 'Settings', path: '/driver/settings' },
  ]

  const availabilityToggle = (
    <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5" role="group" aria-label="Availability">
      <button
        type="button"
        onClick={() => setIsOnline(true)}
        aria-pressed={isOnline}
        className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition-colors ${
          isOnline ? 'bg-surface text-ink shadow-xs ring-1 ring-line' : 'text-ink-muted hover:text-ink'
        }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-ink-subtle'}`} />
        Online
      </button>
      <button
        type="button"
        onClick={() => setIsOnline(false)}
        aria-pressed={!isOnline}
        className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition-colors ${
          !isOnline ? 'bg-surface text-ink shadow-xs ring-1 ring-line' : 'text-ink-muted hover:text-ink'
        }`}>
        Offline
      </button>
    </div>
  )

  return (
    <AppShell
      title={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`}
      subtitle={isOnline ? 'You are online. New trip requests appear below.' : 'You are offline. Go online to see trip requests.'}
      actions={availabilityToggle}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left column */}
        <div className="min-w-0 space-y-6 lg:col-span-2">

          {/* Trip in progress */}
          {activeTrip && (
            <button
              type="button"
              onClick={() => navigate(`/driver/trip/${activeTrip._id}`)}
              className="card group flex w-full items-center gap-3 border-accent/30 bg-accent-soft/50 px-5 py-4 text-left transition-colors hover:bg-accent-soft sm:px-6"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white dark:text-canvas">
                <CarFront className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">You have a trip in progress</span>
                <span className="block truncate text-xs text-ink-muted">
                  {activeTrip.rider?.name ? `${activeTrip.rider.name} · ` : ''}{activeTrip.pickupLocation} to {activeTrip.destination}
                </span>
              </span>
              <span className="hidden shrink-0 sm:block"><StatusBadge status={activeTrip.status} /></span>
              <ChevronRight className="h-4 w-4 shrink-0 text-accent-text transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          {/* Earnings */}
          <section className="card">
            <SectionHeader
              className="px-5 pt-5 sm:px-6 sm:pt-6"
              title="Earnings Summary"
              action={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                  <Wallet className="h-4 w-4" strokeWidth={1.75} />
                </span>
              }
            />
            <dl className="mt-4 grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="min-w-0 px-5 py-5 sm:px-6">
                <dt className="eyebrow">Today</dt>
                {historyLoading ? (
                  <dd><Skeleton className="mt-3 h-7 w-28" /></dd>
                ) : (
                  <>
                    <dd className="stat-value mt-3">{naira(summary.today)}</dd>
                    <dd className="mt-2 flex items-center gap-1.5 text-xs text-ink-subtle">
                      <CarFront className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {plural(summary.tripsToday, 'trip')} completed today
                    </dd>
                  </>
                )}
              </div>
              <div className="min-w-0 px-5 py-5 sm:px-6">
                <dt className="eyebrow">This week</dt>
                {historyLoading ? (
                  <dd><Skeleton className="mt-3 h-7 w-28" /></dd>
                ) : (
                  <>
                    <dd className="stat-value mt-3">{naira(summary.week)}</dd>
                    <dd className="mt-2 flex items-center gap-1.5 text-xs text-ink-subtle">
                      <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {plural(summary.tripsThisWeek, 'trip')} completed since Monday
                    </dd>
                  </>
                )}
              </div>
            </dl>
          </section>

          {/* Available trips */}
          <section className="card">
            <SectionHeader
              className="px-5 pt-5 sm:px-6 sm:pt-6"
              title="Available Trip Requests"
              action={
                <div className="flex items-center gap-2">
                  {trips.length > 0 && (
                    <span className="badge badge-success">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
                      </span>
                      Live
                    </span>
                  )}
                  <span className="badge badge-accent tabular-nums">{trips.length} open</span>
                </div>
              }
            />

            <div className="mt-4">
              {!isOnline ? (
                <div className="border-t border-line">
                  <EmptyState
                    icon={PowerOff}
                    title="You are offline."
                    description="Go online to see trip requests."
                  />
                </div>
              ) : loading ? (
                <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                  {[1, 2].map(i => <Skeleton key={i} className="h-36" />)}
                </div>
              ) : trips.length === 0 ? (
                <div className="border-t border-line">
                  <EmptyState
                    icon={CarFront}
                    title="No trip requests available right now."
                    description="Checking every 8 seconds..."
                  />
                </div>
              ) : (
                <ul className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                  {trips.map(trip => (
                    <li
                      key={trip._id}
                      className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                      <div className="flex items-start gap-4">
                        {/* Route */}
                        <div className="relative min-w-0 flex-1 space-y-3">
                          <span className="pointer-events-none absolute left-[3.5px] top-[26px] h-12 w-px bg-line-strong" aria-hidden="true" />
                          <div className="flex items-start gap-3">
                            <span className="relative mt-[22px] h-2 w-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/15" />
                            <div className="min-w-0">
                              <p className="eyebrow">Pickup</p>
                              <p className="truncate text-sm font-medium text-ink">{trip.pickupLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="relative mt-[22px] h-2 w-2 shrink-0 rounded-[2px] bg-ink" />
                            <div className="min-w-0">
                              <p className="eyebrow">Destination</p>
                              <p className="truncate text-sm font-medium text-ink">{trip.destination}</p>
                            </div>
                          </div>
                        </div>

                        {/* Fare */}
                        <div className="shrink-0 text-right">
                          <p className="text-base font-semibold text-ink tabular-nums">{trip.fare ? `₦${trip.fare.toLocaleString()}` : '—'}</p>
                          <p className="text-xs text-ink-subtle">Est. fare</p>
                          {rideTypeLabel(trip.rideType) && (
                            <span className="badge badge-neutral mt-2">{rideTypeLabel(trip.rideType)}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                            <span className="truncate">{trip.rider?.name}</span>
                          </span>
                          <span className="flex items-center gap-1.5 tabular-nums">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                            {trip.rider?.phone}
                          </span>
                          {formatDistance(trip.distanceKm) && (
                            <span className="flex items-center gap-1.5 tabular-nums">
                              <RouteIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={1.75} />
                              {formatDistance(trip.distanceKm)}
                              {formatDuration(trip.duration) && ` · ~${formatDuration(trip.duration)}`}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAccept(trip._id)}
                          disabled={accepting === trip._id}
                          className="btn btn-primary btn-sm w-full sm:w-auto">
                          {accepting === trip._id ? (
                            <>
                              <Spinner className="h-3.5 w-3.5" />
                              Accepting...
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" strokeWidth={2} />
                              Accept Trip
                            </>
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-6">

          {/* Recent trips */}
          <section className="card overflow-hidden">
            <SectionHeader
              className="px-5 pt-5 sm:px-6 sm:pt-6"
              title="Recent trips"
              action={
                <button type="button" onClick={() => navigate('/driver/activity')} className="btn btn-ghost btn-sm -mr-2">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              }
            />
            {historyLoading ? (
              <div className="space-y-2 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : recentTrips.length === 0 ? (
              <p className="mt-3 border-t border-line px-5 py-6 text-center text-[13px] text-ink-muted sm:px-6">
                No trips yet. Trips you accept will show up here.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-t border-line">
                {recentTrips.map(trip => {
                  const active = ACTIVE_STATUSES.includes(trip.status)
                  const body = (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{trip.destination}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-subtle tabular-nums">
                          {trip.rider?.name ? `${trip.rider.name} · ` : ''}{shortDate(trip.createdAt)}, {shortTime(trip.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {trip.status === 'completed' && trip.fare
                          ? <span className="text-sm font-semibold text-ink tabular-nums">{naira(trip.fare)}</span>
                          : null}
                        {/* Completed trips show their payment state ("Paid" / "Awaiting payment") instead */}
                        {trip.status === 'completed'
                          ? <PaymentBadge trip={trip} />
                          : <StatusBadge status={trip.status} />}
                      </div>
                      {active && <ChevronRight className="h-4 w-4 shrink-0 text-accent-text transition-transform group-hover:translate-x-0.5" />}
                    </>
                  )
                  return (
                    <li key={trip._id}>
                      {active ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/driver/trip/${trip._id}`)}
                          aria-label={`Open active trip to ${trip.destination}`}
                          className="group flex w-full items-center gap-3 bg-accent-soft/40 px-5 py-3 text-left transition-colors hover:bg-accent-soft/70 sm:px-6"
                        >
                          {body}
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-3 sm:px-6">{body}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Vehicle on file */}
          <section className="card card-pad">
            <SectionHeader
              title="Your vehicle"
              action={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                  <CarFront className="h-4 w-4" strokeWidth={1.75} />
                </span>
              }
            />
            {profileLoading && !hasVehicle ? (
              <div className="mt-4 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-5" />)}</div>
            ) : hasVehicle ? (
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ['Make', vehicle.make],
                  ['Model', vehicle.model],
                  ['Year', vehicle.year],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-ink-muted">{label}</dt>
                    <dd className="min-w-0 truncate font-medium text-ink tabular-nums">{value || '—'}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Plate number</dt>
                  <dd>
                    {vehicle.plateNumber
                      ? <span className="rounded-md border border-line-strong bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink">{vehicle.plateNumber}</span>
                      : <span className="font-medium text-ink">—</span>}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-[13px] text-ink-muted">
                No vehicle details on file yet. They are recorded when you register as a driver; contact support if yours are missing or need updating.
              </p>
            )}
          </section>

          {/* Quick actions */}
          <section className="card">
            <h2 className="px-5 pt-5 text-[15px] font-semibold text-ink sm:px-6">Quick Actions</h2>
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {quickActions.map(({ icon: Icon, label, path }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(path)}
                    className="group flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-ink transition-colors hover:bg-surface-2/60 sm:px-6"
                  >
                    <Icon className="h-4 w-4 text-ink-subtle group-hover:text-accent-text" strokeWidth={1.75} />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-4 w-4 text-ink-subtle transition-transform group-hover:translate-x-0.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
