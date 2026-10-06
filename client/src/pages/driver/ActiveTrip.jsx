import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star, Phone, MessageSquare, Siren, TriangleAlert, Navigation, CheckCircle2, Flag, Play, MapPin,
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { Avatar, Spinner } from '../../components/ui'
import API from '../../api'

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

// Visual-only progress through the driver's trip actions.
const PROGRESS_ORDER = ['accepted', 'driver_arriving', 'trip_started', 'completed']

export default function DriverActiveTrip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTrip()
    const interval = setInterval(fetchTrip, 5000)
    return () => clearInterval(interval)
  }, [id])

  const fetchTrip = async () => {
    try {
      const res = await API.get(`/trips/${id}`)
      setTrip(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await API.patch(`/trips/${id}/status`, { status })
      fetchTrip()
      if (status === 'completed') {
        setTimeout(() => navigate('/driver/dashboard'), 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const progressIndex = PROGRESS_ORDER.indexOf(trip?.status)

  return (
    <AppShell
      title={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          Trip in Progress
          <span className="badge badge-dot badge-accent text-xs font-medium tracking-normal">Active trip</span>
        </span>
      }
    >
      {loading ? (
        <div className="card flex items-center justify-center gap-2.5 py-20 text-sm text-ink-muted">
          <Spinner />
          Loading trip...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left — rider + safety */}
          <div className="min-w-0 space-y-6">
            <section className="card card-pad">
              <div className="flex items-center gap-3.5">
                <Avatar name={trip?.rider?.name || ''} className="h-12 w-12 text-base" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">{trip?.rider?.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" strokeWidth={1.75} />
                    <span className="tabular-nums">4.98</span>
                  </p>
                </div>
              </div>

              <div className="well relative mt-5 space-y-4 p-4">
                <span className="pointer-events-none absolute left-[19.5px] top-[42px] h-[52px] w-px bg-line-strong" aria-hidden="true" />
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

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button className="btn btn-primary">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  Call Rider
                </button>
                <button className="btn btn-secondary">
                  <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                  Message
                </button>
              </div>
            </section>

            <section className="card p-3">
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1.5 rounded-lg border border-danger/20 bg-danger/10 px-2 py-3 text-danger transition-colors hover:bg-danger/15">
                  <Siren className="h-4 w-4" strokeWidth={1.75} />
                  <span className="text-xs font-medium">Emergency</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2 py-3 text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  <span className="text-xs font-medium">Call Rider</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2 py-3 text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
                  <TriangleAlert className="h-4 w-4" strokeWidth={1.75} />
                  <span className="text-xs font-medium">Issue</span>
                </button>
              </div>
            </section>
          </div>

          {/* Right — map + trip actions */}
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <section className="card overflow-hidden">
              <div className="aspect-[8/3]">
                <RouteMap />
              </div>
              <div className="flex items-center gap-3 border-t border-line px-5 py-3.5 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                  <Navigation className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <p className="min-w-0 text-sm font-medium text-ink">Live navigation active</p>
              </div>
            </section>

            <section className="card card-pad">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="eyebrow">Trip Actions</p>
                <div className="flex w-28 shrink-0 gap-1" aria-hidden="true">
                  {[1, 2, 3].map(step => (
                    <span
                      key={step}
                      className={`h-1 flex-1 rounded-full ${progressIndex >= step ? 'bg-accent' : 'bg-surface-3'}`}
                    />
                  ))}
                </div>
              </div>

              {trip?.status === 'completed' ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-success/20 bg-success/10 text-success">
                    <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <p className="text-base font-semibold text-ink">Trip Completed!</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    You earned <span className="font-medium text-ink tabular-nums">₦{trip.fare}</span>
                  </p>
                  <button onClick={() => navigate('/driver/dashboard')}
                    className="btn btn-primary mt-5 w-full sm:w-auto">
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <button
                      onClick={() => trip?.status === 'accepted' && updateStatus('driver_arriving')}
                      disabled={updating || trip?.status !== 'accepted'}
                      className={`btn btn-lg w-full ${
                        trip?.status === 'accepted' ? 'btn-primary' : 'btn-secondary'
                      }`}>
                      <MapPin className="h-4 w-4" strokeWidth={1.75} />
                      I'm Arriving
                    </button>
                    <button
                      onClick={() => trip?.status === 'driver_arriving' && updateStatus('trip_started')}
                      disabled={updating || trip?.status !== 'driver_arriving'}
                      className={`btn btn-lg w-full ${
                        trip?.status === 'driver_arriving' ? 'btn-primary' : 'btn-secondary'
                      }`}>
                      <Play className="h-4 w-4" strokeWidth={1.75} />
                      Start Trip
                    </button>
                  </div>
                  <button
                    onClick={() => trip?.status === 'trip_started' && updateStatus('completed')}
                    disabled={updating || trip?.status !== 'trip_started'}
                    className={`btn btn-lg w-full ${
                      trip?.status === 'trip_started'
                        ? 'bg-success text-white shadow-xs hover:bg-success/90 dark:text-canvas'
                        : 'btn-secondary'
                    }`}>
                    {updating ? <Spinner /> : <Flag className="h-4 w-4" strokeWidth={1.75} />}
                    {updating ? 'Updating...' : 'Complete Trip'}
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
