import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, TrendingUp, CalendarDays, CarFront, PowerOff, User, Phone, Map as MapIcon,
  Gauge, Wrench, History, Flag, Settings, ChevronRight, Check,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { SectionHeader, EmptyState, Skeleton, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'
import beep from '../../utils/sound'

// Restrained street-grid placeholder with a highlighted demand zone.
function DemandMap() {
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="160" className="fill-surface-2" />
      <g className="stroke-surface" strokeWidth="9" strokeLinecap="square">
        <path d="M0 40H400M0 112H400M76 0V160M196 0V160M312 0V160M248 112L400 24" />
      </g>
      <g className="stroke-line" strokeWidth="1">
        <path d="M0 76H400M136 0V160M256 0V112M360 0V160" />
      </g>
      <circle cx="236" cy="74" r="62" className="fill-accent/[0.06]" />
      <circle cx="236" cy="74" r="36" className="fill-accent/[0.12]" />
      <circle cx="236" cy="74" r="6" className="fill-accent stroke-surface" strokeWidth="3" />
    </svg>
  )
}

export default function DriverDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const prevTripCount = useRef(0)

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
      subtitle="Your vehicle is ready and the city is active."
      actions={availabilityToggle}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left column */}
        <div className="min-w-0 space-y-6 lg:col-span-2">

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
                <dt className="eyebrow">Daily Earnings</dt>
                <dd className="stat-value mt-3">₦342.50</dd>
                <dd className="mt-2 flex items-center gap-1.5 text-xs text-success">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                  +12% vs yesterday
                </dd>
              </div>
              <div className="min-w-0 px-5 py-5 sm:px-6">
                <dt className="eyebrow">Weekly Total</dt>
                <dd className="stat-value mt-3">₦2,840.12</dd>
                <dd className="mt-2 flex items-center gap-1.5 text-xs text-ink-subtle">
                  <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                  6 days completed
                </dd>
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
                  <span className="badge badge-accent tabular-nums">{trips.length} nearby</span>
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

          {/* City heatmap */}
          <section className="card overflow-hidden">
            <div className="relative h-40 border-b border-line">
              <DemandMap />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-medium text-accent-text shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                High demand area
              </span>
            </div>
            <div className="card-pad">
              <h2 className="text-[15px] font-semibold text-ink">City Heatmap</h2>
              <p className="mt-1 text-sm text-ink-muted">Earnings are currently 1.5x higher downtown.</p>
              <button className="btn btn-secondary btn-sm mt-4 w-full">
                <MapIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                Open Full Map
              </button>
            </div>
          </section>

          {/* Vehicle health */}
          <section className="card card-pad">
            <SectionHeader
              title="Vehicle Health"
              action={
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                  <Gauge className="h-4 w-4" strokeWidth={1.75} />
                </span>
              }
            />
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-[13px]">
                  <span className="text-ink-muted">Fuel Level</span>
                  <span className="font-medium text-ink tabular-nums">85%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-3">
                  <div className="h-1.5 rounded-full bg-accent" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-[13px]">
                  <span className="text-ink-muted">Tire Pressure</span>
                  <span className="font-medium text-success">Optimal</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-3">
                  <div className="h-1.5 w-full rounded-full bg-success" />
                </div>
              </div>
            </div>
            <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs text-ink-subtle">
              <Wrench className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Next service in <span className="tabular-nums">1,240</span> miles</span>
            </p>
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
