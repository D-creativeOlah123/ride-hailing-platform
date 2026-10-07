// Shared helpers for turning /trips/history into real numbers for dashboards, activity and analytics.

export const naira = (n) => `₦${Math.round(n || 0).toLocaleString('en-NG')}`

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfWeek = (d = new Date()) => {
  // Week starts on Monday
  const s = startOfDay(d)
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7))
  return s
}
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1)

const at = (t) => new Date(t.updatedAt || t.createdAt)
const isCompleted = (t) => t.status === 'completed'
const fare = (t) => (isCompleted(t) ? t.fare || 0 : 0)

/** Sum of fares for completed trips since a date (uses completion time when available). */
export function earningsSince(trips, since) {
  return trips.filter(t => isCompleted(t) && at(t) >= since).reduce((sum, t) => sum + fare(t), 0)
}

/** Headline numbers for a list of trips. */
export function tripSummary(trips) {
  const completed = trips.filter(isCompleted)
  const cancelled = trips.filter(t => t.status === 'cancelled')
  const finished = completed.length + cancelled.length
  const total = completed.reduce((s, t) => s + fare(t), 0)
  return {
    total: trips.length,
    completed: completed.length,
    cancelled: cancelled.length,
    active: trips.filter(t => ['requested', 'accepted', 'driver_arriving', 'trip_started'].includes(t.status)).length,
    amount: total,
    averageFare: completed.length ? total / completed.length : 0,
    completionRate: finished ? Math.round((completed.length / finished) * 100) : null,
    today: earningsSince(trips, startOfDay()),
    week: earningsSince(trips, startOfWeek()),
    month: earningsSince(trips, startOfMonth()),
    tripsToday: completed.filter(t => at(t) >= startOfDay()).length,
    tripsThisWeek: completed.filter(t => at(t) >= startOfWeek()).length,
  }
}

/**
 * Last `months` calendar months, oldest first:
 * [{ key, label: 'Jan', trips, completed, cancelled, amount }]
 */
export function monthlySeries(trips, months = 6) {
  const now = new Date()
  const out = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }), trips: 0, completed: 0, cancelled: 0, amount: 0 })
  }
  for (const t of trips) {
    const d = new Date(t.createdAt)
    const row = out.find(r => r.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (!row) continue
    row.trips++
    if (isCompleted(t)) { row.completed++; row.amount += t.fare || 0 }
    if (t.status === 'cancelled') row.cancelled++
  }
  return out
}

/** Change between the last two entries of a series field, as a whole-number percentage (null if no baseline). */
export function monthOverMonth(series, field = 'trips') {
  if (series.length < 2) return null
  const prev = series[series.length - 2][field], cur = series[series.length - 1][field]
  if (!prev) return null
  return Math.round(((cur - prev) / prev) * 100)
}

/** "Toyota Corolla · LND-482KJ" from a driver's vehicle object, or '' if unknown. */
export function vehicleLabel(vehicle) {
  if (!vehicle) return ''
  const name = [vehicle.make, vehicle.model].filter(Boolean).join(' ')
  return [name, vehicle.plateNumber].filter(Boolean).join(' · ')
}
