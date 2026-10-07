import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  X, Share2, MessageSquare, Phone, Search, Check, MapPin, Navigation, Clock, Wallet, CheckCircle2, AlertCircle,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { Avatar, SectionHeader, Spinner, ComingSoon } from '../../components/ui'
import { TripChatPanel, UnreadBadge } from '../../components/TripChat'
import { useTripChat } from '../../components/useTripChat'
import API from '../../api'
import { naira, vehicleLabel } from '../../utils/tripStats'

const STATUS_LABEL = {
  requested: 'Requested',
  accepted: 'Accepted',
  driver_arriving: 'Driver arriving',
  trip_started: 'Trip started',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// Honest, status-based progress text (there is no live GPS data).
function statusMessage(trip) {
  switch (trip?.status) {
    case 'requested': return 'Looking for a driver'
    case 'accepted': return 'Driver is on the way to your pickup'
    case 'driver_arriving': return 'Your driver is arriving at the pickup point'
    case 'trip_started': return `On your way to ${trip.destination}`
    case 'completed': return `Arrived at ${trip.destination}`
    case 'cancelled': return 'This trip was cancelled'
    default: return 'Waiting for trip details'
  }
}

// Restrained route placeholder (street grid + route line).
function RouteMap() {
  return (
    <svg viewBox="0 0 400 150" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="150" className="fill-surface-2" />
      <g className="stroke-surface" strokeWidth="9" strokeLinecap="square">
        <path d="M0 38H400M0 104H400M70 0V150M188 0V150M300 0V150M240 104L400 20" />
      </g>
      <g className="stroke-line" strokeWidth="1">
        <path d="M0 70H400M128 0V150M250 0V104M350 0V150" />
      </g>
      <path
        d="M70 128V104H188V38H300V22"
        fill="none"
        className="stroke-accent"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="70" cy="128" r="7" className="fill-accent stroke-surface" strokeWidth="3" />
      <rect x="293" y="15" width="14" height="14" rx="3" className="fill-ink stroke-surface" strokeWidth="3" />
    </svg>
  )
}

export default function ActiveTrip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const closeChat = useCallback(() => setChatOpen(false), [])
  const [shareNote, setShareNote] = useState(null) // { tone: 'success' | 'danger', text }
  const shareTimer = useRef(null)

  useEffect(() => () => clearTimeout(shareTimer.current), [])

  // Promise chain so state is only set in async callbacks.
  const fetchTrip = useCallback(() =>
    API.get(`/trips/${id}`)
      .then(res => setTrip(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false)),
  [id])

  useEffect(() => {
    fetchTrip()
    const interval = setInterval(fetchTrip, 5000)
    return () => clearInterval(interval)
  }, [fetchTrip])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await API.patch(`/trips/${id}/cancel`)
      navigate('/rider/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  const showShareNote = (note) => {
    clearTimeout(shareTimer.current)
    setShareNote(note)
    shareTimer.current = setTimeout(() => setShareNote(null), 3000)
  }

  const handleShare = async () => {
    if (!trip?.driver) return
    const vehicle = vehicleLabel(trip.driver.vehicle) || 'vehicle details unavailable'
    const text = `I'm on a RideLink trip with ${trip.driver.name || 'my driver'} (${vehicle}) from ${trip.pickupLocation} to ${trip.destination}. Status: ${STATUS_LABEL[trip.status] || trip.status}.`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My RideLink trip', text })
        return
      } catch (err) {
        // User dismissed the share sheet: nothing else to do.
        if (err?.name === 'AbortError') return
        // Otherwise fall back to copying below.
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      showShareNote({ tone: 'success', text: 'Trip details copied' })
    } catch (err) {
      console.error(err)
      showShareNote({ tone: 'danger', text: "Couldn't copy trip details. Please try again." })
    }
  }

  const steps = [
    { key: 'requested', label: 'Requested' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'driver_arriving', label: 'Driver Arriving' },
    { key: 'trip_started', label: 'Trip Started' },
    { key: 'completed', label: 'Completed' },
  ]

  const currentStep = steps.findIndex(s => s.key === trip?.status)
  // Chat only exists once a driver is assigned
  const chat = useTripChat(id, !!trip?.driver)
  const driverPhone = trip?.driver?.phone

  return (
    <AppShell
      title={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          Live Tracking
          <span className="badge badge-dot badge-accent align-middle text-xs font-medium tracking-normal">Active trip</span>
        </span>
      }
      actions={
        <>
          {['requested', 'accepted', 'driver_arriving'].includes(trip?.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn btn-danger btn-sm">
              {cancelling ? (
                <><Spinner className="h-3.5 w-3.5" /> Cancelling...</>
              ) : (
                <><X className="h-3.5 w-3.5" strokeWidth={2} /> Cancel Ride</>
              )}
            </button>
          )}
          <span className="inline-flex" title={trip?.driver ? 'Share your trip details' : 'Available once a driver is assigned'}>
            <button
              type="button"
              onClick={handleShare}
              disabled={!trip?.driver}
              className="btn btn-secondary btn-sm">
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Share Trip
            </button>
          </span>
        </>
      }
    >
      {shareNote && (
        <div className={`alert ${shareNote.tone === 'success' ? 'alert-success' : 'alert-danger'} mb-5 animate-fade-in`} role="status">
          {shareNote.tone === 'success'
            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />}
          <span>{shareNote.text}</span>
        </div>
      )}

      {trip?.driver && (
        <TripChatPanel open={chatOpen} onClose={closeChat} chat={chat} otherName={trip.driver.name || 'Driver'} />
      )}

      {loading ? (
        <div className="card flex items-center justify-center gap-2.5 py-20 text-sm text-ink-muted">
          <Spinner />
          Loading trip...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left — driver info + status */}
          <div className="min-w-0 space-y-6">

            {/* Driver card */}
            {trip?.driver ? (
              <section className="card card-pad">
                <div className="flex items-center gap-3.5">
                  <Avatar name={trip.driver.name || ''} className="h-12 w-12 text-base" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{trip.driver.name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">Your driver</p>
                  </div>
                  <button type="button" onClick={() => setChatOpen(true)} className="btn btn-secondary btn-icon btn-sm relative shrink-0" aria-label="Message driver">
                    <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                    {chat.unread > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface" aria-hidden="true" />}
                  </button>
                </div>

                <dl className="mt-5 grid grid-cols-2 divide-x divide-line rounded-lg border border-line">
                  <div className="min-w-0 px-3.5 py-3">
                    <dt className="text-xs text-ink-subtle">Phone</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-ink tabular-nums">{trip.driver.phone || '—'}</dd>
                  </div>
                  <div className="min-w-0 px-3.5 py-3">
                    <dt className="text-xs text-ink-subtle">Vehicle</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-ink" title={vehicleLabel(trip.driver.vehicle) || undefined}>
                      {vehicleLabel(trip.driver.vehicle) || '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {driverPhone ? (
                    <a href={`tel:${driverPhone}`} className="btn btn-primary">
                      <Phone className="h-4 w-4" strokeWidth={1.75} />
                      Call
                    </a>
                  ) : (
                    <button type="button" disabled className="btn btn-primary" title="This driver hasn't added a phone number">
                      <Phone className="h-4 w-4" strokeWidth={1.75} />
                      No phone
                    </button>
                  )}
                  <button type="button" onClick={() => setChatOpen(true)} className="btn btn-secondary">
                    <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                    Message
                    <UnreadBadge count={chat.unread} />
                  </button>
                </div>
              </section>
            ) : (
              <section className="card flex flex-col items-center px-6 py-10 text-center">
                <div className="relative mb-4 h-11 w-11">
                  <span className="absolute inset-0 rounded-full border-2 border-accent/15" />
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center text-accent-text">
                    <Search className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
                <p className="text-sm text-ink-muted">Finding your driver...</p>
              </section>
            )}

            {/* Trip status timeline */}
            <section className="card card-pad">
              <SectionHeader title="Trip Status" />
              <ol className="mt-5">
                {steps.map((step, i) => {
                  const isDone = i < currentStep
                  const isCurrent = i === currentStep
                  const isPending = i > currentStep
                  const isLast = i === steps.length - 1
                  return (
                    <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
                      {!isLast && (
                        <span
                          className={`absolute left-[9px] top-6 h-[calc(100%-28px)] w-0.5 rounded-full ${isDone ? 'bg-accent' : 'bg-line'}`}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          isDone
                            ? 'bg-accent text-white'
                            : isCurrent
                              ? 'border-2 border-accent bg-surface ring-4 ring-accent/15'
                              : 'border-2 border-line bg-surface-3'
                        }`}>
                        {isDone && <Check className="h-3 w-3" strokeWidth={2.5} />}
                        {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                      </span>
                      <span className={`min-w-0 flex-1 text-sm leading-5 ${
                        isCurrent ? 'font-medium text-ink' :
                        isDone ? 'text-ink-muted' :
                        isPending ? 'text-ink-subtle' : ''
                      }`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="badge badge-accent shrink-0">Now</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          </div>

          {/* Right — map placeholder + trip details */}
          <div className="min-w-0 space-y-6 lg:col-span-2">

            {/* Map placeholder */}
            <section className="card overflow-hidden">
              <div className="relative aspect-[8/3]">
                <RouteMap />
                {['accepted', 'driver_arriving', 'trip_started'].includes(trip?.status) && (
                  <div className="absolute left-1/2 top-4 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-white shadow-raised">
                    <Navigation className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{statusMessage(trip)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 border-t border-line px-5 py-3.5 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{statusMessage(trip)}</p>
                  <p className="text-xs text-ink-subtle">Route preview only. Live map tracking isn't available yet.</p>
                </div>
                <ComingSoon className="hidden shrink-0 sm:inline-flex" />
              </div>
            </section>

            {/* Trip details */}
            <section className="card card-pad">
              <div className="relative space-y-4">
                <span className="pointer-events-none absolute left-[3.5px] top-[26px] h-[52px] w-px bg-line-strong" aria-hidden="true" />
                <div className="flex items-start gap-3">
                  <span className="relative mt-[22px] h-2 w-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/15" />
                  <div className="min-w-0">
                    <p className="eyebrow">Pickup</p>
                    <p className="truncate text-sm font-medium text-ink">{trip?.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="relative mt-[22px] h-2 w-2 shrink-0 rounded-[2px] bg-ink" />
                  <div className="min-w-0">
                    <p className="eyebrow">Destination</p>
                    <p className="truncate text-sm font-medium text-ink">{trip?.destination}</p>
                  </div>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 divide-x divide-line rounded-lg border border-line">
                <div className="min-w-0 px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-subtle">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Requested
                  </dt>
                  <dd className="mt-1 truncate text-sm font-semibold text-ink tabular-nums">
                    {trip?.createdAt
                      ? new Date(trip.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </dd>
                </div>
                <div className="min-w-0 px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-subtle">
                    <Wallet className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Total Fare
                  </dt>
                  <dd className="mt-1 truncate text-sm font-semibold text-accent-text tabular-nums">
                    {trip?.fare ? naira(trip.fare) : 'Calculating...'}
                  </dd>
                </div>
              </dl>

              {trip?.status === 'completed' && (
                <div className="mt-5 flex flex-col-reverse gap-2.5 border-t border-line pt-5 sm:flex-row">
                  <button
                    onClick={() => navigate('/rider/disputes')}
                    className="btn btn-secondary flex-1">
                    Submit Dispute
                  </button>
                  <button
                    onClick={() => navigate('/rider/dashboard')}
                    className="btn btn-primary flex-1">
                    Back to Dashboard
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </AppShell>
  )
}
