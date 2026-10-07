/**
 * Simple stacked monthly bar chart.
 * data: [{ label, primary, secondary }] — primary is drawn solid, secondary as a light segment on top.
 * format: optional (n) => string for the hover title.
 */
export default function BarChart({ data, primaryLabel, secondaryLabel, format = (n) => n.toLocaleString(), emptyText = 'No data yet' }) {
  const max = Math.max(1, ...data.map(d => (d.primary || 0) + (d.secondary || 0)))
  const isEmpty = data.every(d => !d.primary && !d.secondary)

  return (
    <div>
      <div className="relative h-44">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
          {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-dashed border-line" />)}
        </div>

        <div className="relative flex h-full items-end gap-1 border-b border-line sm:gap-2">
          {data.map((d, i) => {
            const total = (d.primary || 0) + (d.secondary || 0)
            const title = `${d.label}: ${primaryLabel} ${format(d.primary || 0)}${secondaryLabel ? `, ${secondaryLabel} ${format(d.secondary || 0)}` : ''}`
            return (
              <div key={i} className="flex h-full min-w-0 flex-1 items-end" title={title}>
                {total > 0 && (
                  <div className="flex w-full flex-col" style={{ height: `${Math.max(4, (total / max) * 100)}%` }}>
                    {d.secondary > 0 && <div className="w-full rounded-t-[3px] bg-accent/30" style={{ height: `${(d.secondary / total) * 100}%` }} />}
                    {d.primary > 0 && <div className={`w-full flex-1 bg-accent ${d.secondary > 0 ? '' : 'rounded-t-[3px]'}`} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted shadow-xs">{emptyText}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-1 sm:gap-2">
        {data.map((d, i) => (
          <span key={i} className="min-w-0 flex-1 text-center text-[10px] font-medium uppercase tracking-wide text-ink-subtle sm:text-2xs">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ChartLegend({ primaryLabel, secondaryLabel }) {
  return (
    <div className="flex items-center gap-3 pt-0.5 text-xs text-ink-muted">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" /> {primaryLabel}</span>
      {secondaryLabel && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent/30" /> {secondaryLabel}</span>}
    </div>
  )
}
