import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Navigation, CarFront, Wallet, XCircle, History, BarChart3, Flag, Settings,
  ChevronRight, MapPin, Search, CheckCircle2, CalendarDays, ArrowRight, ArrowUpDown,
  AlertCircle, MapPinOff,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { StatCard, StatusBadge, SectionHeader, EmptyState, Skeleton, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import API from '../../api'
import { naira, tripSummary, monthlySeries, monthOverMonth } from '../../utils/tripStats'
import PlaceCombobox from '../../components/booking/PlaceCombobox'
import FareEstimate from '../../components/booking/FareEstimate'
import { findPlace, matchPlaces } from '../../components/booking/placeSearch'

export default function RiderDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [trips, setTrips] = useState([])
  const pickupRef = useRef(null)
  const destinationRef = useRef(null)
  // Starts true: the trips are fetched on mount.
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingStep, setBookingStep] = useState(0)
  const [bookingError, setBookingError] = useState('')
  // Known Lagos places for autocomplete: loading | ready | error
  const [places, setPlaces] = useState([])
  const [placesStatus, setPlacesStatus] = useState('loading')
  // Latest fare estimate, tagged with the pickup→destination it was made for
  const [quote, setQuote] = useState(null)
  const [rideType, setRideType] = useState('economy')

  // Promise chain so state is only set in async callbacks.
  // Keep the full history: stats need every trip, Recent Trips shows the latest 5.
  const fetchTrips = useCallback(() =>
    API.get('/trips/history')
      .then(res => setTrips(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false)),
  [])

  const fetchPlaces = useCallback(() =>
    API.get('/trips/places')
      .then(res => {
        setPlaces(Array.isArray(res.data) ? res.data : [])
        setPlacesStatus('ready')
      })
      .catch(err => {
        console.error(err)
        setPlacesStatus('error')
      }),
  [])

  // Resolves to { data, error } so the caller can drop answers for an outdated trip
  const fetchEstimate = useCallback((from, to) =>
    API.post('/trips/estimate', { pickupLocation: from, destination: to })
      .then(res => ({ data: res.data, error: null }))
      .catch(err => ({
        data: null,
        error: err.response?.data?.message || 'We couldn’t get a price right now. Please try again.',
      })),
  [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  // A field counts as chosen when its text matches a known place or alias.
  // If the place list failed to load, let the server decide what it recognises.
  const resolvePlace = (text) => {
    if (placesStatus === 'error') return text.trim() || null
    return findPlace(places, text)?.name || null
  }
  const pickupPlace = resolvePlace(pickup)
  const destinationPlace = resolvePlace(destination)
  const quoteKey = pickupPlace && destinationPlace ? `${pickupPlace}→${destinationPlace}` : null

  // Estimate as soon as both places are chosen, debounced while the rider is still editing
  useEffect(() => {
    if (!quoteKey) return
    let active = true
    const load = () => fetchEstimate(pickupPlace, destinationPlace).then(result => {
      if (active) setQuote({ key: quoteKey, ...result })
    })
    const timer = setTimeout(load, 300)
    // Keep prices fresh while the rider decides (pricing periods change through the day)
    const refresh = setInterval(load, 60000)
    return () => {
      active = false
      clearTimeout(timer)
      clearInterval(refresh)
    }
  }, [quoteKey, pickupPlace, destinationPlace, fetchEstimate])

  const currentQuote = quote && quote.key === quoteKey ? quote : null
  const estimating = Boolean(quoteKey) && !currentQuote
  const estimate = currentQuote?.data || null
  const selectedOption = estimate
    ? estimate.options.find(o => o.type === rideType) || estimate.options[0]
    : null

  // Typed text that isn't a known place: nothing matches at all, or a suggestion still needs picking
  const typedUnknown = placesStatus === 'ready'
    ? [pickup, destination].filter(t => t.trim() && !findPlace(places, t))
    : []
  const noMatches = typedUnknown.some(t => matchPlaces(places, t, 1).length === 0)

  const changePickup = (value) => { setPickup(value); setBookingError('') }
  const changeDestination = (value) => { setDestination(value); setBookingError('') }
  const swapPlaces = () => {
    setPickup(destination)
    setDestination(pickup)
    setBookingError('')
  }
  const chooseRideType = (type) => { setRideType(type); setBookingError('') }

  const handleBookRide = async () => {
    if (!estimate || !selectedOption || booking) return
    setBookingError('')
    setBooking(true)
    setBookingStep(1)
    try {
      await new Promise(r => setTimeout(r, 1000))
      setBookingStep(2)
      const res = await API.post('/trips/request', {
        pickupLocation: estimate.pickup,
        destination: estimate.destination,
        rideType: selectedOption.type,
        // The server refuses (409) if its current price differs from what the rider saw
        expectedFare: selectedOption.fare,
      })
      setBookingStep(3)
      await new Promise(r => setTimeout(r, 800))
      navigate(`/rider/trip/${res.data.trip._id}`)
    } catch (err) {
      console.error(err)
      // Price changed since the estimate: show the new prices so the rider can confirm
      if (err.response?.status === 409 && err.response.data?.estimate) {
        setQuote({ key: quoteKey, data: err.response.data.estimate, error: null })
      }
      setBookingError(err.response?.data?.message || 'We couldn’t book your ride. Please try again.')
      setBooking(false)
      setBookingStep(0)
    }
  }

  // History comes back newest first.
  const recentTrips = trips.slice(0, 5)
  const summary = tripSummary(trips)
  const series = monthlySeries(trips, 2)
  const tripsChange = monthOverMonth(series, 'trips')
  const thisMonth = series[series.length - 1]
  const monthName = new Date().toLocaleString('en-US', { month: 'long' })

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
                <p className="truncate text-[13px] text-ink">{estimate?.pickup || pickup}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-[2px] bg-ink" />
                <p className="truncate text-[13px] text-ink">{estimate?.destination || destination}</p>
              </div>
              {selectedOption && (
                <p className="border-t border-line pt-2.5 text-[13px] text-ink-muted">
                  {selectedOption.label} · <span className="font-semibold text-ink tabular-nums">{naira(selectedOption.fare)}</span>
                </p>
              )}
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
              <PlaceCombobox
                id="pickup"
                label="Pickup location"
                placeholder="Pickup — e.g. Yaba, Ikeja, VI"
                value={pickup}
                onChange={changePickup}
                onChoose={() => { if (!destinationPlace) destinationRef.current?.focus() }}
                places={places}
                inputRef={pickupRef}
                inputClassName="pr-12"
                marker={<span className="pointer-events-none absolute left-[15px] top-[22px] z-10 h-2 w-2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/15" />}
              />
              <PlaceCombobox
                id="destination"
                label="Destination"
                placeholder="Where are you going?"
                value={destination}
                onChange={changeDestination}
                places={places}
                inputRef={destinationRef}
                inputClassName="pr-12"
                marker={<span className="pointer-events-none absolute left-[15px] top-[22px] z-10 h-2 w-2 -translate-y-1/2 rounded-[2px] bg-ink" />}
              />
              <button
                type="button"
                onClick={swapPlaces}
                disabled={booking || (!pickup && !destination)}
                className="btn btn-secondary btn-icon btn-sm absolute right-2 top-[49px] z-20 -translate-y-1/2 rounded-full"
                aria-label="Swap pickup and destination"
                title="Swap pickup and destination"
              >
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Estimate, or what's needed before there can be one */}
            {quoteKey ? (
              <FareEstimate
                estimate={estimate}
                loading={estimating}
                error={currentQuote?.error}
                rideType={selectedOption?.type || rideType}
                onRideTypeChange={chooseRideType}
              />
            ) : noMatches ? (
              <div className="well mt-4 flex items-start gap-2.5 px-3.5 py-3 text-sm text-ink-muted" role="status">
                <MapPinOff className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} aria-hidden="true" />
                <span>Choose a Lagos area from the list — we’re adding more places.</span>
              </div>
            ) : typedUnknown.length > 0 ? (
              <p className="mt-3 text-xs text-ink-subtle" role="status">
                Choose a Lagos area from the list to see your price.
              </p>
            ) : placesStatus === 'error' ? (
              <p className="mt-3 text-xs text-ink-subtle">
                Suggestions aren’t available right now — type a Lagos area name to see prices.
              </p>
            ) : (
              <p className="mt-3 text-xs text-ink-subtle">
                Enter your pickup and destination to see prices for every ride type and time.
              </p>
            )}

            <button
              type="button"
              onClick={handleBookRide}
              disabled={booking || !selectedOption}
              className="btn btn-primary btn-lg mt-5 w-full">
              {booking
                ? <><Spinner /> Finding your ride…</>
                : estimating
                  ? <><Spinner /> Getting prices…</>
                  : selectedOption
                    ? <>Book {selectedOption.label} · {naira(selectedOption.fare)} <ArrowRight className="h-4 w-4" /></>
                    : <>Book Ride <ArrowRight className="h-4 w-4" /></>}
            </button>

            {bookingError && (
              <div className="alert alert-danger mt-3" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{bookingError}</span>
              </div>
            )}
          </section>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total trips"
              value={summary.total}
              icon={CarFront}
              hint={tripsChange === null ? undefined : `${tripsChange > 0 ? '+' : ''}${tripsChange}% trips vs last month`}
            />
            <StatCard
              label="Amount spent"
              value={naira(summary.amount)}
              icon={Wallet}
              hint={`Across ${summary.completed} completed ${summary.completed === 1 ? 'trip' : 'trips'}`}
            />
            <StatCard
              label="Cancelled"
              value={summary.cancelled}
              icon={XCircle}
              hint={summary.completionRate === null ? undefined : `${summary.completionRate}% completion rate`}
            />
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
                          {trip.fare ? <span className="text-sm font-semibold text-ink tabular-nums">{naira(trip.fare)}</span> : null}
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
          {/* This month */}
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
                <span className="text-2xs font-medium uppercase tracking-eyebrow text-white/70">This month</span>
                <CalendarDays className="h-5 w-5 text-white/80" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight">{monthName}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="min-w-0 rounded-lg bg-white/10 px-3 py-2.5">
                  <dt className="text-xs text-white/70">Trips</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums">{loading ? '—' : thisMonth.trips}</dd>
                </div>
                <div className="min-w-0 rounded-lg bg-white/10 px-3 py-2.5">
                  <dt className="text-xs text-white/70">Spent</dt>
                  <dd className="mt-0.5 truncate text-lg font-semibold tabular-nums">{loading ? '—' : naira(thisMonth.amount)}</dd>
                </div>
              </dl>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => pickupRef.current?.focus()}
                  className="btn btn-sm bg-white/15 text-white hover:bg-white/25">
                  Book a ride
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/rider/activity')}
                  className="btn btn-sm bg-white/15 text-white hover:bg-white/25">
                  View activity
                </button>
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
