/**
 * Small stylised street map with a route that draws itself and a pulsing pickup pin.
 * Re-mount (change `key`) to replay the draw animation.
 */
export default function RouteMap({ className = '' }) {
  return (
    <svg viewBox="0 0 400 150" className={`h-full w-full ${className}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="150" className="fill-surface-2" />
      <g className="stroke-surface" strokeWidth="9" strokeLinecap="square">
        <path d="M0 38H400M0 104H400M70 0V150M188 0V150M300 0V150M240 104L400 20" />
      </g>
      <g className="stroke-line" strokeWidth="1">
        <path d="M0 70H400M128 0V150M250 0V104M350 0V150" />
      </g>

      {/* Faint full route underneath, then the drawn route on top */}
      <path d="M70 128V104H188V38H300V22" fill="none" className="stroke-accent/20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M70 128V104H188V38H300V22"
        fill="none"
        className="stroke-accent motion-safe:animate-draw-route"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        style={{ '--route-length': 1 }}
      />

      {/* Pickup: pulsing ring */}
      <circle cx="70" cy="128" r="7" className="fill-accent/30 motion-safe:animate-pulse-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      <circle cx="70" cy="128" r="7" className="fill-accent stroke-surface" strokeWidth="3" />
      {/* Destination */}
      <rect x="293" y="15" width="14" height="14" rx="3" className="fill-ink stroke-surface" strokeWidth="3" />
    </svg>
  )
}
