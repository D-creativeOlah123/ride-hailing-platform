import { useEffect, useId, useRef } from 'react'
import { Check, Navigation, Share2, Clock } from 'lucide-react'
import CarTop from './CarTop'
import Reveal from './Reveal'
import { useInView } from './useInView'
import { useReducedMotion } from './useCarousel'
import { liveRide } from './landingContent'

// ---------------------------------------------------------------------------
// Map geometry (viewBox units, 1200 x 350 — the desktop strip's shape, so nothing is cropped). Roads are straight lines so the
// route length — and therefore where the pickup sits along it — is exact.
// ---------------------------------------------------------------------------
const H_ROADS = [60, 140, 300]
const V_ROADS = [120, 300, 520, 620, 760, 900, 1040, 1160]
const BRIDGES = [300, 760]                 // vertical roads that cross the lagoon
const RIVER = { top: 178, bottom: 258 }
// Chips are 204 wide and centred on the car, so pickup/drop-off stay within every crop below.
const ROUTE = [[440, 140], [640, 140], [760, 140], [760, 300], [860, 300]]
const PICKUP = ROUTE[1]
const DROPOFF = ROUTE[ROUTE.length - 1]
const DURATION = 14 // seconds per loop

const segLen = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1)
const lengths = ROUTE.slice(1).map((p, i) => segLen(ROUTE[i], p))
const total = lengths.reduce((a, b) => a + b, 0)
const pickupAt = lengths[0] / total
const routeD = 'M' + ROUTE.map(p => p.join(' ')).join(' L')

// Timeline: approach → wait at pickup → trip → wait at drop-off
const KEY_TIMES = '0;0.32;0.43;0.89;1'
const KEY_POINTS = `0;${pickupAt.toFixed(4)};${pickupAt.toFixed(4)};1;1`
const STAGE_TIMES = '0;0.32;0.43;0.89'

/** Point and heading at a fraction of the route (for the static reduced-motion car). */
function pointAt(fraction) {
  let d = fraction * total
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i]) {
      const [x1, y1] = ROUTE[i], [x2, y2] = ROUTE[i + 1], t = d / lengths[i]
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, angle: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI }
    }
    d -= lengths[i]
  }
  return { x: DROPOFF[0], y: DROPOFF[1], angle: 0 }
}

// Background traffic: [path, duration]
const TRAFFIC = [
  ['M-40 300 H1240', 24],
  ['M620 -40 V170', 14],
  ['M1240 60 H-40', 28],
]

function blocks() {
  const xs = [0, ...V_ROADS, 1200], ys = [0, ...H_ROADS, 350]
  const out = []
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x = xs[i] + 14, y = ys[j] + 14, w = xs[i + 1] - xs[i] - 28, h = ys[j + 1] - ys[j] - 28
      if (w < 20 || h < 20) continue
      if (y < RIVER.bottom + 10 && y + h > RIVER.top - 10) continue // lagoon
      const park = (i * 7 + j * 3) % 9 === 0
      out.push(<rect key={`${i}-${j}`} x={x} y={y} width={w} height={h} rx="10" className={park ? 'fill-success/15' : 'fill-surface-3'} />)
    }
  }
  return out
}
const BLOCKS = blocks()

function StatusChip({ shadowId }) {
  const stageColors = ['fill-accent', 'fill-success', 'fill-accent', 'fill-success']
  return (
    <g transform="translate(-102 -74)">
      <rect width="204" height="52" rx="12" className="fill-surface stroke-line" strokeWidth="1" filter={`url(#${shadowId})`} />
      <text x="14" y="21" className="fill-ink-muted" fontSize="11" fontWeight="500">
        {liveRide.driver.name} · {liveRide.driver.car}
      </text>
      {liveRide.stages.map((stage, i) => (
        <g key={stage} opacity={i === 0 ? 1 : 0}>
          <animate attributeName="opacity" calcMode="discrete" dur={`${DURATION}s`} repeatCount="indefinite"
            keyTimes={STAGE_TIMES} values={[0, 1, 2, 3].map(k => (k === i ? 1 : 0)).join(';')} />
          <circle cx="19" cy="37" r="4" className={stageColors[i]} />
          <text x="30" y="41" className="fill-ink" fontSize="13" fontWeight="600">{stage}</text>
        </g>
      ))}
      <path d="M94 52 L102 60 L110 52 Z" className="fill-surface" />
    </g>
  )
}

function RideMap({ viewBox, animate, className = '' }) {
  const svgRef = useRef(null)
  // Two maps render (phone + desktop), so ids must be unique per instance.
  const uid = useId().replace(/:/g, '')
  const routeId = `ride-route-${uid}`
  const shadowId = `chip-shadow-${uid}`
  const [inViewRef, inView] = useInView({ threshold: 0.05, once: false })

  // Pause SMIL animations while the map is off screen.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg?.pauseAnimations) return
    if (inView) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }, [inView])

  const still = pointAt(0.7)

  return (
    <div ref={inViewRef} className={className}>
      <svg ref={svgRef} viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img"
        aria-label="Map showing a RideLink driver driving to the pickup point in Lekki and on across the lagoon bridge to Victoria Island">
        <defs>
          <filter id={shadowId} x="-20%" y="-30%" width="140%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0b0f17" floodOpacity="0.16" />
          </filter>
        </defs>

        <rect width="1200" height="350" className="fill-surface-2" />
        {BLOCKS}

        {/* Lagoon */}
        <path d={`M0 ${RIVER.top + 14} C300 ${RIVER.top - 10} 640 ${RIVER.top + 30} 1200 ${RIVER.top}
                 V${RIVER.bottom} C760 ${RIVER.bottom + 14} 360 ${RIVER.bottom - 18} 0 ${RIVER.bottom + 6} Z`}
          className="fill-accent/15" />
        <text x="1150" y={RIVER.top + 46} textAnchor="end" className="fill-accent-text/60" fontSize="13" fontStyle="italic" letterSpacing="2">LAGOS LAGOON</text>

        {/* Roads */}
        <g className="stroke-surface" strokeWidth="16">
          {H_ROADS.map(y => <path key={`h${y}`} d={`M0 ${y} H1200`} />)}
          {V_ROADS.map(x => BRIDGES.includes(x)
            ? <path key={`v${x}`} d={`M${x} 0 V350`} />
            : <g key={`v${x}`}><path d={`M${x} 0 V${RIVER.top - 4}`} /><path d={`M${x} ${RIVER.bottom + 6} V350`} /></g>)}
        </g>
        {/* Bridge railings */}
        <g className="stroke-line-strong" strokeWidth="2">
          {BRIDGES.map(x => <g key={x}><path d={`M${x - 11} ${RIVER.top - 6} V${RIVER.bottom + 10}`} /><path d={`M${x + 11} ${RIVER.top - 6} V${RIVER.bottom + 10}`} /></g>)}
        </g>
        <g className="stroke-line" strokeWidth="1" strokeDasharray="6 8">
          {H_ROADS.map(y => <path key={y} d={`M0 ${y} H1200`} />)}
        </g>

        {/* Background traffic */}
        <g className="text-ink-subtle/70">
          {TRAFFIC.map(([d, dur], i) => (
            animate
              ? <g key={i}><CarTop scale={0.62} /><animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate="auto" path={d} begin={`-${i * 5}s`} /></g>
              : null
          ))}
        </g>

        {/* Route */}
        <path d={routeD} fill="none" className="stroke-accent/20" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <path id={routeId} d={routeD} fill="none" className="stroke-accent" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Pickup (pulsing) and drop-off pins with labels */}
        <circle cx={PICKUP[0]} cy={PICKUP[1]} r="11" className="fill-accent/30 motion-safe:animate-pulse-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        <circle cx={PICKUP[0]} cy={PICKUP[1]} r="9" className="fill-accent stroke-surface" strokeWidth="4" />
        <rect x={DROPOFF[0] - 9} y={DROPOFF[1] - 9} width="18" height="18" rx="4" className="fill-ink stroke-surface" strokeWidth="4" />
        <g fontSize="12" fontWeight="600">
          <text x={PICKUP[0]} y={PICKUP[1] + 30} textAnchor="middle" className="fill-ink">Lekki Phase 1</text>
          <text x={DROPOFF[0]} y={DROPOFF[1] + 30} textAnchor="middle" className="fill-ink">Victoria Island</text>
        </g>

        {/* The driver's car + status chip that follows it */}
        {animate ? (
          <>
            <g className="text-accent">
              <CarTop scale={1.1} />
              <animateMotion dur={`${DURATION}s`} repeatCount="indefinite" rotate="auto" calcMode="linear" keyTimes={KEY_TIMES} keyPoints={KEY_POINTS}>
                <mpath href={`#${routeId}`} />
              </animateMotion>
            </g>
            <g>
              <StatusChip shadowId={shadowId} />
              <animateMotion dur={`${DURATION}s`} repeatCount="indefinite" calcMode="linear" keyTimes={KEY_TIMES} keyPoints={KEY_POINTS}>
                <mpath href={`#${routeId}`} />
              </animateMotion>
            </g>
          </>
        ) : (
          <>
            <g className="text-accent" transform={`translate(${still.x} ${still.y}) rotate(${still.angle})`}><CarTop scale={1.1} /></g>
            <g transform={`translate(${still.x} ${still.y})`}>
              <g transform="translate(-102 -74)">
                <rect width="204" height="52" rx="12" className="fill-surface stroke-line" strokeWidth="1" filter={`url(#${shadowId})`} />
                <text x="14" y="21" className="fill-ink-muted" fontSize="11" fontWeight="500">{liveRide.driver.name} · {liveRide.driver.car}</text>
                <circle cx="19" cy="37" r="4" className="fill-accent" />
                <text x="30" y="41" className="fill-ink" fontSize="13" fontWeight="600">{liveRide.stages[2]}</text>
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}

const BULLET_ICONS = [Navigation, Clock, Share2]

function Copy({ className = '' }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-3 text-accent-text">{liveRide.eyebrow}</p>
      <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem]">{liveRide.headline}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{liveRide.body}</p>
      <ul className="mt-6 space-y-3">
        {liveRide.bullets.map((b, i) => {
          const Icon = BULLET_ICONS[i] || Check
          return (
            <li key={b} className="flex items-start gap-3 text-sm text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <span className="pt-1">{b}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function LiveRideStrip() {
  const reduced = useReducedMotion()

  return (
    <section className="relative border-t border-line bg-surface-2" aria-label="Live tracking">
      {/* Phones and tablets: copy above the map */}
      <Reveal className="mx-auto max-w-content px-4 pb-8 pt-16 sm:px-6 lg:hidden">
        <Copy />
      </Reveal>

      <div className="relative h-[320px] sm:h-[420px]">
        {/* One framing per breakpoint so the whole trip and its chips are always in view */}
        <RideMap viewBox="530 0 440 350" animate={!reduced} className="h-full md:hidden" />
        <RideMap viewBox="380 0 640 350" animate={!reduced} className="hidden h-full md:block lg:hidden" />
        <RideMap viewBox="0 0 1200 350" animate={!reduced} className="hidden h-full lg:block" />

        {/* lg+: copy floats over the left of the map */}
        <div className="pointer-events-none absolute inset-0 hidden items-center lg:flex">
          <div className="mx-auto w-full max-w-content px-6 lg:px-8">
            <Reveal className="card pointer-events-auto max-w-[360px] bg-surface/90 p-6 shadow-raised backdrop-blur-md lg:max-w-sm">
              <Copy />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
