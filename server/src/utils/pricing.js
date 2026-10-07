// Fare estimates for Lagos. The server is the single source of truth: the price a
// rider sees in the estimate is the price stored on the trip and charged at payment.
const PLACES = require('../data/lagosPlaces')

const ROAD_FACTOR = 1.35 // roads are longer than a straight line

const RIDE_TYPES = {
    economy: { key: 'economy', label: 'Economy', seats: 4, base: 500, perKm: 180, perMin: 25, minimum: 1500, description: 'Everyday rides at the best price' },
    comfort: { key: 'comfort', label: 'Comfort', seats: 4, base: 800, perKm: 250, perMin: 35, minimum: 2500, description: 'Newer cars and top-rated drivers' },
    xl: { key: 'xl', label: 'XL', seats: 6, base: 1200, perKm: 330, perMin: 45, minimum: 3500, description: 'SUVs and 7-seaters for groups' },
}

// Lagos time of day: Africa/Lagos is UTC+1 all year (no daylight saving).
const lagosClock = (date) => {
    const d = new Date(date.getTime() + 60 * 60 * 1000)
    return { hour: d.getUTCHours(), day: d.getUTCDay() } // day: 0 = Sunday
}

/** Demand period for a moment in time: price multiplier + average road speed (km/h). */
function periodFor(date) {
    const { hour, day } = lagosClock(date)
    const weekday = day >= 1 && day <= 5
    if (hour >= 22 || hour < 5) return { key: 'night', label: 'Late night', multiplier: 1.2, speed: 35 }
    if (weekday && hour >= 7 && hour < 10) return { key: 'morning_rush', label: 'Morning rush', multiplier: 1.35, speed: 15 }
    if (weekday && hour >= 16 && hour < 20) return { key: 'evening_rush', label: 'Evening rush', multiplier: 1.4, speed: 14 }
    return { key: 'standard', label: 'Standard', multiplier: 1, speed: 25 }
}

const normalise = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Find a known place by exact name or alias (case/punctuation-insensitive). */
function findPlace(input) {
    const q = normalise(input)
    if (!q) return null
    return PLACES.find(p => normalise(p.name) === q || (p.aliases || []).some(a => normalise(a) === q)) || null
}

function haversineKm(a, b) {
    const R = 6371, rad = (x) => (x * Math.PI) / 180
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(h))
}

const roundTo50 = (n) => Math.round(n / 50) * 50

/** Price one ride type for a distance at a given period. */
function priceFor(type, distanceKm, durationMin, period) {
    const t = RIDE_TYPES[type]
    const raw = (t.base + t.perKm * distanceKm + t.perMin * durationMin) * period.multiplier
    return roundTo50(Math.max(t.minimum, raw))
}

/**
 * Full estimate for a pickup/destination at a departure time.
 * Returns null if either place is unknown.
 */
function estimate(pickupInput, destinationInput, departAt = new Date()) {
    const from = findPlace(pickupInput), to = findPlace(destinationInput)
    if (!from || !to) return null

    const distanceKm = Math.max(1, Math.round(haversineKm(from, to) * ROAD_FACTOR * 10) / 10)
    const period = periodFor(departAt)
    // Long trips spend more time on expressways, so they average a higher speed
    const speed = period.speed * (distanceKm > 20 ? 1.6 : 1)
    const durationMin = Math.max(5, Math.round((distanceKm / speed) * 60))

    return {
        pickup: from.name,
        destination: to.name,
        distanceKm,
        durationMin,
        departAt: departAt.toISOString(),
        period: { key: period.key, label: period.label, multiplier: period.multiplier },
        options: Object.values(RIDE_TYPES).map(t => ({
            type: t.key, label: t.label, seats: t.seats, description: t.description,
            fare: priceFor(t.key, distanceKm, durationMin, period),
        })),
    }
}

/**
 * Prices for the same trip at different times today (Lagos time), for comparison.
 * Slots: now, then fixed times through the day.
 */
function timeComparison(pickupInput, destinationInput, now = new Date()) {
    const slots = [6, 8, 11, 14, 17, 21, 23] // hours, Lagos time
    const HOUR = 3600e3
    const { hour } = lagosClock(now)
    // Midnight today in Lagos (UTC+1), as a UTC timestamp
    const local = new Date(now.getTime() + HOUR)
    const lagosMidnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - HOUR

    const out = [{ label: 'Now', ...pick(estimate(pickupInput, destinationInput, now)) }]
    for (const h of slots) {
        // Upcoming slots only: later today, otherwise the same time tomorrow
        const when = new Date(lagosMidnight + h * HOUR + (h <= hour ? 24 * HOUR : 0))
        const label = `${h <= hour ? 'Tmrw ' : ''}${((h + 11) % 12) + 1}${h < 12 ? 'am' : 'pm'}`
        out.push({ label, ...pick(estimate(pickupInput, destinationInput, when)) })
    }
    return out.sort((a, b) => new Date(a.departAt) - new Date(b.departAt))

    function pick(e) {
        if (!e) return {}
        return { departAt: e.departAt, period: e.period.label, durationMin: e.durationMin, fares: Object.fromEntries(e.options.map(o => [o.type, o.fare])) }
    }
}

module.exports = { PLACES, RIDE_TYPES, estimate, timeComparison, findPlace, periodFor }
