import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Navigation, CarFront, Wallet, XCircle, History, BarChart3, Flag, Settings,
  ChevronRight, MapPin, Search, CheckCircle2, Award, ArrowRight,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatCard, StatusBadge, SectionHeader, EmptyState, Skeleton, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'

export default function RiderDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState(0)

  useEffect(() => {
    fetchRecentTrips()
  }, [])

  const fetchRecentTrips = async () => {
    setLoading(true)
    try {
      const res = await API.get('/trips/history')
      setRecentTrips(res.data.slice(0, 5))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookRide = async () => {
    if (!pickup || !destination) return
    setBooking(true)
    setBookingStep(1)
    try {
      await new Promise(r => setTimeout(r, 1000))
      setBookingStep(2)
      const res = await API.post('/trips/request', {
        pickupLocation: pickup,
        destination: destination
      })
      setBookingStep(3)
      await new Promise(r => setTimeout(r, 800))
      navigate(`/rider/trip/${res.data.trip._id}`)
    } catch (err) {
      console.error(err)
      setBooking(false)
      setBookingStep(0)
    }
  }

  const totalSpent = recentTrips
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.fare || 0), 0)

  const totalTrips = recentTrips.length
  const cancelled = recentTrips.filter(t => t.status === 'cancelled').length

  const bookingSteps = [
    { icon: MapPin, label: 'Confirming your location…' },
    { icon: Search, label: 'Finding available drivers…' },
    { icon: CheckCircle2, label: 'Ride confirmed! Redirecting…' },
  ]
  const StepIcon = bookingSteps[bookingStep - 1]?.icon || CarFront

  const quickActions = [
    { icon: History, label: 'View Trip History', path: '/rider/activity' },
    { icon: BarChart3, label: 'Analytics', path: '/rider/analytics' },
    { icon: Flag, label: 'Submit Dispute', path: '/rider/disputes' },
    { icon: Settings, label: 'Account Settings', path: '/rider/settings' },
  ]

  return (
    <AppShell
      title={`Hello, ${user?.name?.split(' ')[0] || 'there'}`}
      subtitle="Your executive transport is ready for dispatch."
    >
      {/* Booking progress overlay */}
      {booking && (
        <div className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="card w-full max-w-sm p-8 text-center shadow-overlay">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full border-2 border-accent/15" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-accent-text">
                <StepIcon className="h-6 w-6" strokeWidth={1.75} />
              </div>
            </div>
            <h3 className="text-base font-semibold text-ink">Booking Your Ride</h3>
            <p className="mt-1 text-sm text-ink-muted">
              {bookingSteps[bookingStep - 1]?.label || 'Please wait…'}
            </p>

            <div className="my-6 flex items-center justify-center gap-1.5">
              {bookingSteps.map((_, i) => (
                <div key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i < bookingStep ? 'w-8 bg-accent' : 'w-3 bg-surface-3'}`} />
              ))}
            </div>

            <div className="well space-y-2.5 p-4 text-left">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                <p className="truncate text-[13px] text-ink">{pickup}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-[2px] bg-ink" />
                <p className="truncate text-[13px] text-ink">{destination}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left column */}
        <div className="min-w-0 space-y-6 lg:col-span-2">

          {/* Book a ride */}
          <section className="card card-pad">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                <Navigation className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <h2 className="text-[15px] font-semibold text-ink">Where to?</h2>
            </div>

            <div className="relative space-y-2.5">
              <span className="pointer-events-none absolute left-[18px] top-[22px] z-10 h-[calc(100%-44px)] w-px bg-line-strong" aria-hidden="true" />
              <div className="relative">
                <span className="pointer-events-none absolute left-[15px] top-1/2 z-10 h-2 w-2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/15" />
                <label htmlFor="pickup" className="sr-only">Pickup location</label>
                <input
                  id="pickup"
                  type="text"
                  placeholder="Current Location"
                  value={pickup}
                  onChange={e => setPickup(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-[15px] top-1/2 z-10 h-2 w-2 -translate-y-1/2 rounded-[2px] bg-ink" />
                <label htmlFor="destination" className="sr-only">Destination</label>
                <input
                  id="destination"
                  type="text"
                  placeholder="Enter Destination"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              onClick={handleBookRide}
              disabled={booking || !pickup || !destination}
              className="btn btn-primary btn-lg mt-4 w-full">
              {booking ? <><Spinner /> Finding your ride…</> : <>Book Ride <ArrowRight className="h-4 w-4" /></>}
            </button>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total trips" value={totalTrips} icon={CarFront} hint="+12% from last month" hintTone="success" />
            <StatCard label="Amount spent" value={`₦${totalSpent.toLocaleString()}`} icon={Wallet} hint="Corporate billing enabled" />
            <StatCard label="Cancelled" value={cancelled.toString().padStart(2, '0')} icon={XCircle} hint="98% reliability score" />
          </div>

          {/* Recent trips */}
          <section className="card">
            <SectionHeader
              className="px-5 pt-5 sm:px-6 sm:pt-6"
              title="Recent Trips"
              action={
                <button onClick={() => navigate('/rider/activity')} className="btn btn-ghost btn-sm -mr-2 text-accent-text">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              }
            />

            <div className="mt-4">
              {loading ? (
                <div className="space-y-2 px-5 pb-5 sm:px-6 sm:pb-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : recentTrips.length === 0 ? (
                <EmptyState
                  icon={CarFront}
                  title="No trips yet"
                  description="Book your first ride and it will show up here."
                />
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {recentTrips.map(trip => (
                    <li key={trip._id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/rider/trip/${trip._id}`)}
                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-2/60 sm:px-6"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                          <CarFront className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">To {trip.destination}</p>
                          <p className="text-xs text-ink-subtle">{new Date(trip.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                          {trip.fare && <span className="text-sm font-semibold text-ink tabular-nums">₦{trip.fare}</span>}
                          <StatusBadge status={trip.status} />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-6">
          {/* Membership */}
          <section className="relative overflow-hidden rounded-xl bg-accent p-5 text-white shadow-raised sm:p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                maskImage: 'linear-gradient(to bottom left, #000, transparent 70%)',
                WebkitMaskImage: 'linear-gradient(to bottom left, #000, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-medium uppercase tracking-eyebrow text-white/70">Active Membership</span>
                <Award className="h-5 w-5 text-white/80" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight">Elite Platinum</p>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-white/70">Next reward</span>
                  <span className="font-medium tabular-nums">120 pts</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/20">
                  <div className="h-1.5 w-2/3 rounded-full bg-white" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="btn btn-sm bg-white/15 text-white hover:bg-white/25">Benefits</button>
                <button className="btn btn-sm bg-white/15 text-white hover:bg-white/25">Manage</button>
              </div>
            </div>
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
