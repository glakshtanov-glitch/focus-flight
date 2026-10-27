// Distances and flight times; see docs/flight-time.md

const EARTH_RADIUS_KM = 6371

// Typical jet airliner; used for every time shown before an aircraft is chosen
export const REFERENCE_SPEED_KMH = 840

// Taxi out, extra time for climb and descent, taxi in
export const GROUND_ALLOWANCE_MIN = 30

interface Point {
  lat: number
  lon: number
}

const toRad = (deg: number) => (deg * Math.PI) / 180

// Great-circle distance (haversine)
export function distanceKm(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function flightMinutes(km: number, speedKmh = REFERENCE_SPEED_KMH): number {
  return Math.round((km / speedKmh) * 60 + GROUND_ALLOWANCE_MIN)
}

// 252 -> "4:12"
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}
