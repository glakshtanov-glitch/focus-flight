import type { Airport } from './types'

let loading: Promise<Airport[]> | null = null

export function loadAirports(): Promise<Airport[]> {
  loading ??= fetch(`${import.meta.env.BASE_URL}data/airports.json`).then((r) => {
    if (!r.ok) throw new Error(`Airports failed to load: HTTP ${r.status}`)
    return r.json()
  })
  return loading
}

// Letters that don't split into base letter + accent
const SPECIAL_LETTERS: Record<string, string> = { ł: 'l', ø: 'o', đ: 'd', ß: 'ss', æ: 'ae', œ: 'oe' }

// "Kraków" -> "krakow", "Łódź" -> "lodz"
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[łøđßæœ]/g, (c) => SPECIAL_LETTERS[c])
}

const SIZE_ORDER = { large: 0, medium: 1, small: 2 }

export type AirportSearch = (query: string, options?: { exclude?: string; limit?: number }) => Airport[]

// Matches codes exactly, then city and airport name; bigger airports first within each rank.
// Names matter because the city field is sometimes the airport's town (Kraków's is "Balice").
export function createSearch(airports: Airport[]): AirportSearch {
  const index = airports.map((airport) => ({
    airport,
    city: normalize(airport.city),
    name: normalize(airport.name),
  }))

  return (query, { exclude, limit = 8 } = {}) => {
    const q = normalize(query.trim())
    if (!q) return []
    const ranked: { airport: Airport; rank: number }[] = []
    for (const { airport, city, name } of index) {
      if (airport.icao === exclude) continue
      let rank: number
      if (airport.iata.toLowerCase() === q) rank = 0
      else if (airport.icao.toLowerCase() === q) rank = 1
      else if (city.startsWith(q)) rank = 2
      else if (name.startsWith(q)) rank = 3
      else if (` ${city} ${name}`.includes(` ${q}`)) rank = 4
      else continue
      ranked.push({ airport, rank })
    }
    return ranked
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          SIZE_ORDER[a.airport.size] - SIZE_ORDER[b.airport.size] ||
          a.airport.name.localeCompare(b.airport.name),
      )
      .slice(0, limit)
      .map((r) => r.airport)
  }
}
