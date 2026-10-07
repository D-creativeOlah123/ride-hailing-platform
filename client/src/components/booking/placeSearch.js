// Client-side place matching for the booking form. Mirrors the server's
// normalisation so "what the rider typed" resolves the same way on both sides.

export const normalisePlace = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** The place whose name or alias exactly matches the text, or null. */
export function findPlace(places, text) {
  const q = normalisePlace(text)
  if (!q) return null
  return places.find(p =>
    normalisePlace(p.name) === q || (p.aliases || []).some(a => normalisePlace(a) === q),
  ) || null
}

/**
 * Places matching the typed text (name or alias, case-insensitive), best first.
 * Each result: { place, alias } where alias is the alias that matched when the name didn't.
 * Empty text returns every place in list order.
 */
export function matchPlaces(places, text, limit = 8) {
  const q = normalisePlace(text)
  if (!q) return places.map(place => ({ place, alias: null }))

  const scored = []
  places.forEach((place, index) => {
    const name = normalisePlace(place.name)
    let score = -1
    let alias = null
    if (name === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.split(' ').some(word => word.startsWith(q))) score = 2
    else if (name.includes(q)) score = 4

    for (const a of place.aliases || []) {
      const na = normalisePlace(a)
      if (na === name) continue
      let s = -1
      if (na === q) s = 0
      else if (na.startsWith(q)) s = 3
      else if (na.includes(q)) s = 5
      if (s >= 0 && (score < 0 || s < score)) { score = s; alias = a }
    }

    if (score >= 0) scored.push({ place, alias, score, index })
  })

  return scored
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ place, alias }) => ({ place, alias }))
}
